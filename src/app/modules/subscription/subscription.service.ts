import httpStatus from 'http-status';
import { ISubscription } from './subscription.interface';
import Subscription from './subscription.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import Package from '../package/package.models';

const createSubscription = async (payload: ISubscription) => {
  const pkg = await Package.findById(payload.package);
  if (!pkg || pkg?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const result = await Subscription.create({
    ...payload,
    startDate,
    endDate,
    status: 'pending',
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create subscription');
  }
  return result;
};

const getAllSubscription = async (query: Record<string, any>) => {
  query['isDeleted'] = false;
  const subscriptionModel = new QueryBuilder(Subscription.find(), query)
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await subscriptionModel.modelQuery;
  const meta = await subscriptionModel.countTotal();

  return {
    data,
    meta,
  };
};

const getSubscriptionById = async (id: string) => {
  const result = await Subscription.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('Subscription not found!');
  }
  return result;
};
const getCurrentPlan = async (userId: string) => {
  console.log(userId);
  const result = await Subscription.findOne({
    user: userId,
    isDeleted: false,
    isActive: true,
    isExpired: false,
    endDate: { $gt: new Date() },
  }).populate('package');
  if (!result) {
    throw new Error('Current plan not found!');
  }
  return result;
};

const updateSubscription = async (
  id: string,
  payload: Partial<ISubscription>,
) => {
  const result = await Subscription.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new Error('Failed to update Subscription');
  }
  return result;
};

const deleteSubscription = async (id: string) => {
  const result = await Subscription.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete subscription');
  }
  return result;
};

export const subscriptionService = {
  createSubscription,
  getAllSubscription,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  getCurrentPlan,
};
