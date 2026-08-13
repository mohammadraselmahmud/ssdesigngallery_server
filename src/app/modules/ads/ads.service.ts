import httpStatus from 'http-status';
import { IAds } from './ads.interface';
import Ads from './ads.models';
import QueryBuilder from '../../class/builder/QueryBuilder';
import AppError from '../../error/AppError';

const createAds = async (payload: IAds) => {
  if (payload?.image) payload.image = payload?.image[0];
  if (payload?.video) payload.video = payload?.video[0];
  const result = await Ads.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create ads');
  }
  return result;
};

const getAllAds = async (query: Record<string, any> = {}) => {
  const queryParams = { ...query, isDeleted: false };
  const adsModel = new QueryBuilder(Ads.find(), queryParams)
    .search(['title', 'description'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await adsModel.modelQuery;
  const meta = await adsModel.countTotal();

  return {
    data,
    meta,
  };
};

const getPublicAds = async (query: Record<string, any> = {}) => {
  const limit = Number(query.limit) || 10;
  const now = new Date();

  const ads = await Ads.find({
    isDeleted: { $ne: true },
    isActive: true,
    $or: [
      { expiredAt: { $exists: false } },
      { expiredAt: null },
      { expiredAt: { $gt: now } },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();

  const randomizedAds = [...ads].sort(() => Math.random() - 0.5);

  return randomizedAds.slice(0, limit);
};

const getAdsById = async (id: string) => {
  const result = await Ads.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ads not found');
  }
  return result;
};

const updateAds = async (id: string, payload: Partial<IAds>) => {
  if (payload?.image) payload.image = payload?.image[0];
  if (payload?.video) payload.video = payload?.video[0];
  const result = await Ads.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    payload,
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ads not found');
  }
  return result;
};

const deleteAds = async (id: string) => {
  const result = await Ads.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ads not found');
  }
  return result;
};

export const adsService = {
  createAds,
  getAllAds,
  getPublicAds,
  getAdsById,
  updateAds,
  deleteAds,
};
