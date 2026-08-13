import { model, Schema } from 'mongoose';
import { IPackage, IPackageModules } from './package.interface';

const packageSchema = new Schema<IPackage>(
  {
    title: { type: 'string', required: true },
    productId: { type: 'string', required: true },
    description: { type: 'string' },
    price: { type: 'number', required: true },
    isRecommended: { type: 'boolean', default: false },
    totalDays: { type: 'number', required: true },
    limit: { type: 'number', required: true },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  },
);

const Package = model<IPackage, IPackageModules>('Package', packageSchema);
export default Package;
