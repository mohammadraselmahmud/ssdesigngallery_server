import { Model, ObjectId } from 'mongoose';
import { ICategory } from '../category/category.interface';

export interface IProducts {
  productName: string;
  productDescription: string[];
  productImage: string;
  productPrice: number;
  note?: string;
  categoryId: ObjectId | ICategory;
}

export type IProductsModules = Model<IProducts, Record<string, unknown>>;
