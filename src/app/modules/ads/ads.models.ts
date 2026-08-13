import { model, Schema } from 'mongoose';
import { IAds, IAdsModules } from './ads.interface';

const adsSchema = new Schema<IAds>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    video: { type: String, default: '' },
    link: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    expiredAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);
 

const Ads = model<IAds, IAdsModules>('Ads', adsSchema);
export default Ads;
