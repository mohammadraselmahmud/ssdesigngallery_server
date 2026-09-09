import { model, Schema, Types } from 'mongoose';
import { ISubscription, ISubscriptionModules } from './subscription.interface';

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true },
    package: { type: Types.ObjectId, ref: 'Package', required: true },
    tranId: { type: String, default: '' },
    coupon: { type: Types.ObjectId, ref: 'Coupon' },
    couponCode: { type: String, trim: true, uppercase: true },
    originalPrice: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    payableAmount: { type: Number, required: true, min: 0 },
    totalCredit: { type: Number, default: 0, min: 0 },
    usedCredit: { type: Number, default: 0, min: 0 },
    remainingCredit: { type: Number, default: 0, min: 0 },
    paymentProvider: {
      type: String,
      enum: ['paystation', 'google_pay', 'google_play', 'stripe'],
    },
    currency: { type: String, trim: true, uppercase: true },
    paidAt: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled', 'failed'],
      default: 'pending',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const Subscription = model<ISubscription, ISubscriptionModules>(
  'Subscription',
  subscriptionSchema,
);
export default Subscription;
