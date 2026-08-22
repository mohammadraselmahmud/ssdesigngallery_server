import { model, Schema, Types } from 'mongoose';
import { ICoupon, ICouponModules } from './coupon.interface';

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minPurchase: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    usageLimit: { type: Number, min: 1 },
    perUserLimit: { type: Number, default: 1, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    applicablePackages: [{ type: Types.ObjectId, ref: 'Package' }],
    usages: [{
      user: { type: Types.ObjectId, ref: 'User', required: true },
      subscription: { type: Types.ObjectId, ref: 'Subscription' },
      usedAt: { type: Date, default: Date.now },
    }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Coupon = model<ICoupon, ICouponModules>('Coupon', couponSchema);
export default Coupon;
