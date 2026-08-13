import httpStatus from 'http-status';
import { IPackage } from './package.interface';
import Package from './package.models'; 
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createPackage = async (payload: IPackage) => {
  const result = await Package.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create package');
  }
  return result;
};

const getAllPackage = async (query: Record<string, any>) => {
  query['isDeleted'] = false;
  const packageModel = new QueryBuilder<IPackage>(Package.find(), query)
    .search(['product', 'title'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await packageModel.modelQuery;
  const meta = await packageModel.countTotal();

  return {
    data,
    meta,
  };
};

const getPackageById = async (id: string) => {
  const result = await Package.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('Package not found!');
  }
  return result;
};

const updatePackage = async (id: string, payload: Partial<IPackage>) => {
  const result = await Package.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Package');
  }
  return result;
};

const deletePackage = async (id: string) => {
  const result = await Package.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete package');
  }
  return result;
};

export const packageService = {
  createPackage,
  getAllPackage,
  getPackageById,
  updatePackage,
  deletePackage,
};
