import httpStatus from 'http-status';
import { IProducts } from './products.interface';
import Products from './products.models';
import QueryBuilder from '../../class/builder/QueryBuilder';
import AppError from '../../error/AppError';

const createProducts = async (payload: IProducts) => {
  const result = await Products.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create products');
  }
  return result;
};

const getAllProducts = async (query: Record<string, any>) => {
  const productsModel = new QueryBuilder(
    Products.find({ isDeleted: false }),
    query,
  )
    .search(['productName', 'productDescription'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await productsModel.modelQuery;
  const meta = await productsModel.countTotal();

  return { data, meta };
};

const getProductsById = async (id: string) => {
  const result = await Products.findById(id);
  if (!result || result?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Products not found!');
  }
  return result;
};

const updateProducts = async (id: string, payload: Partial<IProducts>) => {
  const result = await Products.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to update Products');
  }
  return result;
};

const deleteProducts = async (id: string) => {
  const result = await Products.findByIdAndUpdate(id, { isDeleted: true });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete products');
  }
  return result;
};

const findKeywords = async () => {
  const uniqueKeywords = await Products.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    { $unwind: '$productDescription' },

    {
      $group: {
        _id: '$productDescription',
        count: { $sum: 1 },
      },
    },

    {
      $project: {
        keyword: '$_id',
        count: 1,
        _id: 0,
      },
    },
    // Sort by keyword alphabetically
    { $sort: { count: -1 } },
  ]);

  return uniqueKeywords;
};

export const productsService = {
  createProducts,
  getAllProducts,
  getProductsById,
  updateProducts,
  deleteProducts,
  findKeywords,
};
