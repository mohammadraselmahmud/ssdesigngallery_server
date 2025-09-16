import { Model } from 'mongoose';

export interface ICategory {
  _id: string;
  name: string;
  categoryImage: string;
}

export interface ICategoryModel
  extends Model<ICategory, Record<string, unknown>> {
  isExistByName(name: string): Promise<ICategory>;
}
