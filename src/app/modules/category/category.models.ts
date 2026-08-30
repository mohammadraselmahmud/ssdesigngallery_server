import { model, Schema } from 'mongoose';
import { ICategory, ICategoryModel } from './category.interface';

const categorySchema = new Schema<ICategory>(
  {
    name: { type: 'string', required: true, unique: true },
    categoryImage: { type: 'string', required: false },
    prompt: { type: 'string', required: false },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.statics.isExistByName = async function (name: string) {
  return await Category.findOne({ name });
};

const Category = model<ICategory, ICategoryModel>('Category', categorySchema);
export default Category;
