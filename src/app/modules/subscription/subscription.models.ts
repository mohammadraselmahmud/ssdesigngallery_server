import { model, Schema, Types } from 'mongoose';
import { ISubscription, ISubscriptionModules } from './subscription.interface';

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true },
    package: { type: Types.ObjectId, ref: 'Package', required: true },
    tranId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled', 'failed'],
      default: 'pending',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    isExpired: { type: Boolean, default: false },
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
