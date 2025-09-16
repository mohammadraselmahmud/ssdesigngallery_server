import { model, Schema, Types } from 'mongoose';
import {
  IProductFolder,
  IProductFolderModules,
} from './productFolder.interface';

const ProductSchema = new Schema({
  productId: {
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
});

const productFolderSchema = new Schema<IProductFolder>(
  {
    folderName: {
      type: String,
      required: true,
    },
    products: [ProductSchema],
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ProductFolder = model<IProductFolder, IProductFolderModules>(
  'ProductFolder',
  productFolderSchema,
);
export default ProductFolder;
