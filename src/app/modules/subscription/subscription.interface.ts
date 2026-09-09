import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IPackage } from '../package/package.interface';

export type SubscriptionStatus =
  'pending' | 'active' | 'expired' | 'cancelled' | 'failed';

export interface ISubscription {
  user: ObjectId | IUser;
  package: ObjectId | IPackage;
  startDate: Date;
  endDate: Date;
  tranId: string;
  coupon?: ObjectId;
  couponCode?: string;
  originalPrice: number;
  discountAmount: number;
  payableAmount: number;
  totalCredit?: number;
  usedCredit?: number;
  remainingCredit?: number;
  paymentProvider?:
    'paystation' | 'google_pay' | 'google_play' | 'stripe' | string;
  currency?: string;
  paidAt?: Date;
  status: SubscriptionStatus;
  isDeleted: Boolean;
}

export type ISubscriptionModules = Model<
  ISubscription,
  Record<string, unknown>
>;
