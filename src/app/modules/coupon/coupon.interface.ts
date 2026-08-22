import { Model, ObjectId } from 'mongoose';

export type DiscountType = 'percentage' | 'fixed';

export interface ICouponUsage {
  user: ObjectId;
  subscription?: ObjectId;
  usedAt: Date;
}

export interface ICoupon {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit: number;
  usedCount: number;
  startsAt: Date;
  expiresAt: Date;
  applicablePackages: ObjectId[];
  usages: ICouponUsage[];
  isActive: boolean;
  isDeleted: boolean;
}

export type ICouponModules = Model<ICoupon, Record<string, unknown>>;
