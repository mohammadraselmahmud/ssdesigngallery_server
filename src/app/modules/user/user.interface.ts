import { Model, Types } from 'mongoose';

export interface IUser {
  userId?: string;
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profile?: string;
  password: string;
  registerWithGoogle: boolean;
  role: string;
  oneTimeCode: string;
  emailVerified: boolean;
  freeAiImageCount: number;
}

export interface UserModel extends Model<IUser> {
  isUserExist(email: string): Promise<IUser>;
  IsUserExistId(id: string): Promise<IUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}

export type QueryObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type TLogin = {
  email: string;
  password: string;
};
export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};
export type TResetPassword = {
  newPassword: string;
  confirmPassword: string;
};

export interface IJwtPayload {
  userId: string;
  role: string;
}
