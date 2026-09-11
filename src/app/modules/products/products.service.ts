import httpStatus from 'http-status';
import { IProducts } from './products.interface';
import Products from './products.models';
import QueryBuilder from '../../class/builder/QueryBuilder';
import AppError from '../../error/AppError';
import pickQuery from '../../utils/pickQuery';
import { Types } from 'mongoose';
import { paginationHelper } from '../../helpers/pagination.helpers';

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

const findRelatedProducts = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);
  const { productDescription, searchTerm, ...filtersData } = filters;
  const pipeline: any[] = [];

  if (filtersData?.categoryId) {
    filtersData['categoryId'] = new Types.ObjectId(filtersData?.categoryId);
  }

  if (productDescription) {
    const keywords = productDescription
      .split(',')
      .map((keyword: string) => keyword.trim())
      .filter(Boolean);

    pipeline.push({
      $match: {
        productDescription: { $in: keywords },
      },
    });

    pipeline.push({
      $addFields: {
        matchCount: {
          $size: {
            $setIntersection: ['$productDescription', keywords],
          },
        },
        randomScore: { $rand: {} },
      },
    });
  }

  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: ['productName', 'productDescription'].map(field => ({
          [field]: {
            $regex: searchTerm,
            $options: 'i',
          },
        })),
      },
    });
  }

  if (Object.entries(filtersData).length) {
    // Add custom filters (filtersData) to the aggregation pipeline
    Object.entries(filtersData).map(([field, value]) => {
      if (/^\[.*?\]$/.test(value)) {
        const match = value.match(/\[(.*?)\]/);
        const queryValue = match ? match[1] : value;
        pipeline.push({
          $match: {
            [field]: { $in: [new Types.ObjectId(queryValue)] },
          },
        });
        delete filtersData[field];
      }
    });

    if (Object.entries(filtersData).length) {
      pipeline.push({
        $match: {
          $and: Object.entries(filtersData).map(([field, value]) => ({
            isDeleted: false,
            [field]: value,
          })),
        },
      });
    }
  }

  // Sorting condition
  const {
    page,
    limit,
    skip,
    sortBy: sort,
  } = paginationHelper.calculatePagination(pagination);

  if (sort) {
    const sortArray = sort.split(',').map(field => {
      const trimmedField = field.trim();
      if (trimmedField.startsWith('-')) {
        return { [trimmedField.slice(1)]: -1 };
      }
      return { [trimmedField]: 1 };
    });

    pipeline.push({
      $sort: productDescription
        ? Object.assign({ matchCount: -1, randomScore: 1 }, ...sortArray)
        : Object.assign({}, ...sortArray),
    });
  } else if (productDescription) {
    pipeline.push({ $sort: { matchCount: -1, randomScore: 1 } });
  }

  pipeline.push({
    $facet: {
      totalData: [{ $count: 'total' }],
      paginatedData: [
        { $skip: skip },
        { $limit: limit },
        // Lookups
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $addFields: {
            category: { $arrayElemAt: ['$category', 0] },
          },
        },
      ],
    },
  });

  const [result] = await Products.aggregate(pipeline);

  const total = result?.totalData?.[0]?.total || 0;
  const data = result?.paginatedData || [];

  return {
    meta: { page, limit, total },
    data,
  };
};

export const productsService = {
  createProducts,
  getAllProducts,
  getProductsById,
  updateProducts,
  deleteProducts,
  findKeywords,
  findRelatedProducts,
};
