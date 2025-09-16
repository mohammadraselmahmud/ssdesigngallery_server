import { Model, Types, ObjectId } from 'mongoose';
import { Schema } from 'zod';
import { IProducts } from '../products/products.interface';

interface IProd {
  productId: ObjectId | IProducts;
  note: string;
}
export interface IProductFolder {
  folderName: string;
  products: IProd[];
  userId: ObjectId;
}

export type IProductFolderModules = Model<
  IProductFolder,
  Record<string, unknown>
>;
