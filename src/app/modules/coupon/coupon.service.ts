import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import Package from '../package/package.models';
import Coupon from './coupon.models';
import { ICoupon } from './coupon.interface';

const normalizeCode = (code: string) => code.trim().toUpperCase();

export const calculateCouponDiscount = (coupon: ICoupon, price: number) => {
  let discount = coupon.discountType === 'percentage'
    ? (price * coupon.discountValue) / 100
    : coupon.discountValue;
  if (coupon.maxDiscount !== undefined) discount = Math.min(discount, coupon.maxDiscount);
  return Math.min(price, Math.max(0, Number(discount.toFixed(2))));
};

export const getValidCoupon = async (code: string, packageId: string, userId: string) => {
  const coupon = await Coupon.findOne({ code: normalizeCode(code), isDeleted: false });
  if (!coupon || !coupon.isActive) throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or inactive coupon');
  const now = new Date();
  if (coupon.startsAt > now || coupon.expiresAt <= now) throw new AppError(httpStatus.BAD_REQUEST, 'Coupon is not currently valid');
  if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) throw new AppError(httpStatus.BAD_REQUEST, 'Coupon usage limit reached');
  if (coupon.applicablePackages.length && !coupon.applicablePackages.some(id => id.toString() === packageId)) throw new AppError(httpStatus.BAD_REQUEST, 'Coupon is not applicable to this package');
  if (coupon.usages.filter(item => item.user.toString() === userId).length >= coupon.perUserLimit) throw new AppError(httpStatus.BAD_REQUEST, 'You have reached the coupon usage limit');

  const pkg = await Package.findById(packageId);
  if (!pkg || pkg.isDeleted) throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
  if (pkg.price < coupon.minPurchase) throw new AppError(httpStatus.BAD_REQUEST, `Minimum purchase amount is ${coupon.minPurchase}`);
  const discountAmount = calculateCouponDiscount(coupon, pkg.price);
  return { coupon, originalPrice: pkg.price, discountAmount, payableAmount: Number((pkg.price - discountAmount).toFixed(2)) };
};

const createCoupon = async (payload: ICoupon) => {
  payload.code = normalizeCode(payload.code);
  if (await Coupon.exists({ code: payload.code })) throw new AppError(httpStatus.CONFLICT, 'Coupon code already exists');
  return Coupon.create(payload);
};
const getAllCoupons = async (query: Record<string, any>) => {
  query.isDeleted = false;
  const builder = new QueryBuilder(Coupon.find(), query).search(['code']).filter().paginate().sort().fields();
  return { data: await builder.modelQuery, meta: await builder.countTotal() };
};
const getCouponById = async (id: string) => {
  const result = await Coupon.findOne({ _id: id, isDeleted: false });
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Coupon not found');
  return result;
};
const updateCoupon = async (id: string, payload: Partial<ICoupon>) => {
  if (payload.code) payload.code = normalizeCode(payload.code);
  const result = await Coupon.findOneAndUpdate({ _id: id, isDeleted: false }, payload, { new: true, runValidators: true });
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Coupon not found');
  return result;
};
const deleteCoupon = async (id: string) => {
  const result = await Coupon.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, isActive: false }, { new: true });
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Coupon not found');
  return result;
};
const validateCoupon = async (code: string, packageId: string, userId: string) => {
  const result = await getValidCoupon(code, packageId, userId);
  return { code: result.coupon.code, discountType: result.coupon.discountType, discountValue: result.coupon.discountValue, originalPrice: result.originalPrice, discountAmount: result.discountAmount, payableAmount: result.payableAmount };
};

export const claimCoupon = async (couponId: Types.ObjectId, userId: string) => Coupon.findOneAndUpdate(
  { _id: couponId, isDeleted: false, isActive: true, $expr: { $or: [{ $eq: [{ $ifNull: ['$usageLimit', null] }, null] }, { $lt: ['$usedCount', '$usageLimit'] }] } } as any,
  { $inc: { usedCount: 1 }, $push: { usages: { user: new Types.ObjectId(userId), usedAt: new Date() } } },
  { new: true },
);

export const couponService = { createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon, validateCoupon };
