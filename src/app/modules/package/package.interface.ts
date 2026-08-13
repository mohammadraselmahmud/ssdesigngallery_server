import { Model, ObjectId } from 'mongoose';

export interface IPackage {
  _id?: string;
  title: string;
  productId: string;
  description: string;
  price: number;
  isRecommended: boolean;
  totalDays: number;
  limit: number;
  isDeleted: boolean;
}

export type IPackageModules = Model<IPackage, Record<string, unknown>>;
