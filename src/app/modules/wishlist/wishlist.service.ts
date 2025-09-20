import httpStatus from 'http-status';
import { IWishlist } from './wishlist.interface';
import Wishlist from './wishlist.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createWishlist = async (payload: IWishlist) => {
  const isExist = await Wishlist.findOne({
    userId: payload?.userId,
    productId: payload.productId,
  });

  if (isExist) {
    const result = await Wishlist.findByIdAndDelete(isExist._id);
    if (!result)
      throw new AppError(httpStatus.BAD_REQUEST, 'Wish list remove success!');
    return;
  }
  const result = await Wishlist.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create wishlist');
  }
  return result;
};

const getAllWishlist = async (query: Record<string, any>) => {
  const wishlistModel = new QueryBuilder(
    Wishlist.find().populate('productId'),
    query,
  )
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await wishlistModel.modelQuery;
  const meta = await wishlistModel.countTotal();

  return {
    data,
    meta,
  };
};

const getWishlistById = async (id: string) => {
  const result = await Wishlist.findById(id).populate('productId');
  if (!result) {
    throw new Error('Wishlist not found!');
  }
  return result;
};

const updateWishlist = async (id: string, payload: Partial<IWishlist>) => {
  const result = await Wishlist.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Wishlist');
  }
  return result;
};

const deleteWishlist = async (id: string) => {
  const result = await Wishlist.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete wishlist');
  }
  return result;
};

export const wishlistService = {
  createWishlist,
  getAllWishlist,
  getWishlistById,
  updateWishlist,
  deleteWishlist,
};
