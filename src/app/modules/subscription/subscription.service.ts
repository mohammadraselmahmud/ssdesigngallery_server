import httpStatus from 'http-status';
import { ISubscription } from './subscription.interface';
import Subscription from './subscription.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import Package from '../package/package.models';
import Coupon from '../coupon/coupon.models';
import { claimCoupon, getValidCoupon } from '../coupon/coupon.service';
import { Types } from 'mongoose';
const subscriptionPopulate = [
  {
    path: 'user',
    select: 'name email phoneNumber profile',
  },
  {
    path: 'package',
    select: 'title productId description price totalDays limit isRecommended',
  },
];

type CreateSubscriptionPayload = ISubscription & { couponCode?: string };

const createSubscription = async (payload: CreateSubscriptionPayload) => {
  const pkg = await Package.findById(payload.package);
  if (!pkg || pkg?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  let pricing = {
    originalPrice: pkg.price,
    discountAmount: 0,
    payableAmount: pkg.price,
  };
  let couponId: Types.ObjectId | undefined;
  let couponCode: string | undefined;
  if (payload.couponCode) {
    const applied = await getValidCoupon(
      payload.couponCode,
      pkg._id.toString(),
      payload.user.toString(),
    );
    const claimed = await claimCoupon(
      applied.coupon._id,
      payload.user.toString(),
    );
    if (!claimed)
      throw new AppError(httpStatus.BAD_REQUEST, 'Coupon usage limit reached');
    pricing = {
      originalPrice: applied.originalPrice,
      discountAmount: applied.discountAmount,
      payableAmount: applied.payableAmount,
    };
    couponId = applied.coupon._id;
    couponCode = applied.coupon.code;
  }

  let result;
  try {
    result = await Subscription.create({
      ...payload,
      coupon: couponId,
      couponCode,
      ...pricing,
      startDate,
      endDate,
      status: 'pending',
    });
    if (couponId)
      await Coupon.updateOne(
        { _id: couponId },
        { $set: { 'usages.$[usage].subscription': result._id } },
        {
          arrayFilters: [
            {
              'usage.user': payload.user,
              'usage.subscription': { $exists: false },
            },
          ],
        },
      );
  } catch (error) {
    if (couponId)
      await Coupon.findByIdAndUpdate(couponId, {
        $inc: { usedCount: -1 },
        $pop: { usages: 1 },
      });
    throw error;
  }
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create subscription');
  }
  return result;
};

const getAllSubscription = async (query: Record<string, any>) => {
  query['isDeleted'] = false;
  const subscriptionModel = new QueryBuilder(
    Subscription.find().populate(subscriptionPopulate),
    query,
  )
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
  const result = await Subscription.findOne({
    _id: id,
    isDeleted: false,
  }).populate(subscriptionPopulate);
  if (!result || result?.isDeleted) {
    throw new Error('Subscription not found!');
  }
  return result;
};

const getCurrentPlan = async (userId: string) => {
  const now = new Date();
  await Subscription.updateMany(
    {
      user: userId,
      status: 'active',
      endDate: { $lte: now },
      isDeleted: false,
    },
    { $set: { status: 'expired' } },
  );

  const result = await Subscription.findOne({
    user: userId,
    isDeleted: false,
    status: 'active',
    endDate: { $gt: now },
  }).populate(subscriptionPopulate);
  // if (!result) {
  //   throw new Error('Current plan not found!');
  // }
  return result ?? {};
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
