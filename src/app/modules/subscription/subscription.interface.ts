import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IPackage } from '../package/package.interface';

export type SubscriptionStatus =
  | 'pending'
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'failed';

export interface ISubscription {
  user: ObjectId | IUser;
  package: ObjectId | IPackage;
  startDate: Date;
  endDate: Date;
  tranId: string;
  status: SubscriptionStatus;
  isActive: Boolean;
  isExpired: Boolean;
  isDeleted: Boolean;
}

export type ISubscriptionModules = Model<
  ISubscription,
  Record<string, unknown>
>;
