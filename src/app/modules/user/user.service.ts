import { userController } from './user.controller';
import fs from 'fs';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IUser, TLogin } from './user.interface';
import { User } from './user.models';
import QueryBuilder from '../../class/builder/QueryBuilder';
import bcrypt from 'bcrypt';
import config from '../../config';
import { createToken } from './user.utils';
import path from 'path';
import { sendEmail } from '../../utils/mailSender';
import { subscriptionService } from '../subscription/subscription.service';

export type IFilter = {
  searchTerm?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const login = async (payload: TLogin) => {
  const user: IUser | null = await User.isUserExist(payload?.email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // if (user?.registerWithGoogle) {
  //   throw new AppError(
  //     httpStatus.FORBIDDEN,
  //     'this user registered with Google not manually',
  //   );
  // }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  const jwtPayload: { userId: string; role: string } = {
    userId: user?._id?.toString() as string,
    role: user?.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in,
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const createUser = async (payload: IUser): Promise<IUser> => {
  const isExist = await User.isUserExist(payload.email as string);

  if (isExist) {
    if (isExist?.emailVerified) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'This user already exist, Please try to login',
      );
    }
    const user = await User.findByIdAndUpdate(isExist?._id, payload, {
      new: true,
    });
    if (!user)
      throw new AppError(httpStatus.BAD_GATEWAY, 'User creating failed!');

    return user;
  }

  const user = await User.create(payload);
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
  }
  return user;
};

const signInWithGoogle = async (payload: any) => {
  const user = await User.isUserExist(payload.email);

  if (!user) {
    const userData = {
      email: payload.email,
      name: payload.name,
      emailVerified: true,
      registerWithGoogle: true,
    };

    const user: IUser | null = await User.create(userData);
    if (!user) {
      throw new AppError(httpStatus.FORBIDDEN, 'user register failed!');
    }

    const jwtPayload: { userId: string; role: string } = {
      userId: user?._id?.toString() as string,
      role: user?.role,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in,
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in,
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  if (!user?.registerWithGoogle) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'this user register with email and password.',
    );
  }

  const jwtPayload: { userId: string; role: string } = {
    userId: user?._id?.toString() as string,
    role: user?.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in,
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const forgotPassword = async (payload: IUser) => {
  const user = await User.isUserExist(payload?.email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'user not found!');
  }
  const oneTimeCode =
    Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  const result = await User.findByIdAndUpdate(
    user?._id,
    { oneTimeCode },
    { new: true },
  );

  const otpEmailPath = path.join(
    __dirname,
    '../../../../public/view/otp_mail.html',
  );

  await sendEmail(
    user?.email,
    'Your reset password OTP is',
    fs
      .readFileSync(otpEmailPath, 'utf8')
      .replace('{{otp}}', oneTimeCode.toString())
      .replace('{{email}}', user?.email),
  );

  return user;
};

const verifyOtp = async (query: any, payload: any) => {
  const requestType = !query.requestType ? 'resetPassword' : query.requestType;
  const user: IUser | null = await User.isUserExist(payload?.email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user.oneTimeCode !== payload?.oneTimeCode) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid OTP code');
  }

  const data: any = {};
  if (requestType === 'resetPassword') {
    data['oneTimeCode'] = 'verified';
  } else if (
    requestType === 'verifyEmail' &&
    user.oneTimeCode !== null &&
    user.emailVerified === false
  ) {
    data['emailVerified '] = true;
    data['oneTimeCode'] = null;
  }

  const result = await User.findByIdAndUpdate(user?._id, data, { new: true });
  return result;
};

const updatePassword = async (payload: IUser) => {
  let user;
  if (payload?.userId) {
    user = await User.findById(payload?.userId);
  } else {
    user = await User.isUserExist(payload?.email);
  }

  console.log(user);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.oneTimeCode !== 'verified') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Something went wrong, try forget password again',
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload?.password,
    Number(config.bcrypt_salt_rounds),
  );
  const result = await User.findByIdAndUpdate(
    user?._id,
    {
      password: hashedPassword,
      oneTimeCode: null,
    },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password Update Failed!');
  }

  return result;
};
const changePassword = async (payload: any, userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!(await User.isPasswordMatched(payload?.oldPassword, user.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Old password does not match');
  }

  if (payload?.newPassword !== payload?.confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'New password and confirm password do not match',
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload?.confirmPassword,
    Number(config.bcrypt_salt_rounds),
  );
  const result = await User.findByIdAndUpdate(
    user?._id,
    {
      password: hashedPassword,
      oneTimeCode: null,
    },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password Update Failed!');
  }

  return result;
};
const updateUser = async (id: string, payload: Partial<IUser>) => {
  const user = await User.findByIdAndUpdate(id, payload, { new: true });
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User updating failed');
  }

  return user;
};

// const geUserById = async (id: string) => {
//   const result = await User.findById(id);
//   const subscription = await subscriptionService?.getCurrentPlan(id);
//   if (!result) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   return { ...result?.toObject(), subscription: subscription };
// };

const getUserById = async (id: string) => {
  const [user, subscription] = await Promise.all([
    User.findById(id).lean(),
    subscriptionService.getCurrentPlan(id),
  ]);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return {
    ...user,
    subscription: subscription ?? {},
  };
};
//
const getAllUser = async (query: Record<string, any>) => {
  const userModel = new QueryBuilder(User.find(), query)
    .search(['name', 'email', 'phoneNumber', 'status'])
    .filter()
    .paginate()
    .sort();
  const data: any = await userModel.modelQuery;
  const meta = await userModel.countTotal();
  return {
    data,
    meta,
  };
};

// const deleteUser = async (id: string) => {
//   const user = await User.findByIdAndUpdate(
//     id,
//     { isDeleted: true },
//     { new: true },
//   );

//   if (!user) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
//   }

//   return user;
// };

export const userService = {
  createUser,
  login,
  forgotPassword,
  verifyOtp,
  updatePassword,
  updateUser,
  getUserById,
  changePassword,
  getAllUser,
  signInWithGoogle,
  // deleteUser,
};
