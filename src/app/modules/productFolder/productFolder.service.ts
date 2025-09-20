import httpStatus from 'http-status';
import { IProductFolder } from './productFolder.interface';
import ProductFolder from './productFolder.models';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createProductFolder = async (payload: any) => {
  const { folderName, productId, note } = payload;

  let user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isExist = await ProductFolder.findOne({
    folderName: payload.folderName,
    userId: user?._id,
  });

  if (isExist) {
    const productExists = isExist.products.some(
      p => p.productId.toString() === payload.productId,
    );
    if (!productExists) {
      payload.products.push({ productId, note }); // Add the product with its note
      await isExist.save();
    }

    return isExist;
  }

  const result = await ProductFolder.create({
    folderName,
    userId: user._id,
    products: [{ productId, note }],
  });

  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to create productFolder',
    );
  }
  return result;
};

const getAllProductFolder = async (query: Record<string, any>) => {
  const productFolderModel = new QueryBuilder(
    ProductFolder.find({}).populate('products.productId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .fields();

  const data = await productFolderModel.modelQuery;

  return data;
};

const getProductFolderById = async (id: string) => {
  const result = await ProductFolder.findById(id);
  if (!result) {
    throw new Error('ProductFolder not found!');
  }
  return result;
};

const updateProductFolder = async (
  id: string,
  payload: Partial<IProductFolder>,
) => {
  const result = await ProductFolder.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new Error('Failed to update ProductFolder');
  }
  return result;
};
const updateNote = async (params: Record<string, any>, payload: any) => {
  const { folderId, productId } = params;
  const { note } = payload;

  if (!note) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Note must be provided');
  }

  const result = await ProductFolder.findOneAndUpdate(
    {
      _id: folderId,
      'products.productId': productId,
    },
    {
      $set: {
        'products.$.note': note,
      },
    },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Folder or product not found');
  }
};

const deleteProductFolder = async (id: string) => {
  const result = await ProductFolder.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to delete productFolder',
    );
  }
  return result;
};

const deleteProductFromFolder = async (params: Record<string, any>) => {
  const { folderId, productId } = params;
  console.log(params);
  const folder = await ProductFolder.findOneAndUpdate(
    { _id: folderId, 'products.productId': productId },
    { $pull: { products: { productId } } },
    { new: true },
  );
  console.log('🚀 ~ deleteProductFromFolder ~ folder:', folder);

  if (!folder) {
    new AppError(404, 'Folder or product not found');
  }

  return folder;
};

export const productFolderService = {
  createProductFolder,
  getAllProductFolder,
  getProductFolderById,
  updateProductFolder,
  deleteProductFolder,
  updateNote,
  deleteProductFromFolder,
};
