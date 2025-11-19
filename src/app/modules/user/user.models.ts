import { Error, Schema, model } from 'mongoose';
import config from '../../config';
import bcrypt from 'bcrypt';
import { IUser, UserModel } from './user.interface';
import { Role, USER_ROLE } from './user.constants';

const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
      default: null,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    phoneNumber: {
      type: String,
      required: false,
      default: null,
    },

    password: {
      type: String,
      required: false,
    },
    emailVerified: {
      type: Boolean, 
      default:null
    },
      registerWithGoogle: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: Role,
      default: USER_ROLE.user,
    },
    oneTimeCode: {
      type: String,
      enum: Role,
      default: USER_ROLE.user,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  if (!user?.registerWithGoogle) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds),
    );
  }
  next();
});
// userSchema.pre('save', async function (next) {
//   // eslint-disable-next-line @typescript-eslint/no-this-alias
//   const user = this;
//   if (user) {
//     user.password = await bcrypt.hash(
//       user.password,
//       Number(config.bcrypt_salt_rounds),
//     );
//   }
//   next();
// });

// set '' after saving password
userSchema.post(
  'save',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function (error: Error, doc: any, next: (error?: Error) => void): void {
    doc.password = '';
    next();
  },
);

userSchema.statics.isUserExist = async function (email: string) {
  return await User.findOne({ email: email }).select('+password');
};

userSchema.statics.IsUserExistId = async function (id: string) {
  return await User.findById(id).select('+password');
};
userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const User = model<IUser, UserModel>('User', userSchema);
