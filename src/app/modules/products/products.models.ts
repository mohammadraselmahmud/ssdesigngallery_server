import { model, Schema, Types } from 'mongoose';
import { IProducts, IProductsModules } from './products.interface';

const productsSchema = new Schema<IProducts>(
  {
    productName: {
      type: String,
      required: [true, 'Product name must be required'],
    },
    productDescription: {
      type: [String],
    },
    productImage: {
      type: String,
      required: [true, 'Product image must be required'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    productPrice: {
      type: Number,
      required: [true, 'Product price must be required'],
    },
    note: { type: String, default: null },
    categoryId: {
      type: Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Products = model<IProducts, IProductsModules>('Product', productsSchema);
export default Products;
