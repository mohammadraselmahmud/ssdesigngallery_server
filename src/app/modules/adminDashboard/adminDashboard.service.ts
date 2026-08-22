import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import Subscription from '../subscription/subscription.models';

const successfulPaymentMatch = {
  isDeleted: false,
  $or: [
    { paidAt: { $exists: true, $ne: null } },
    { status: { $in: ['active', 'expired'] } },
  ],
};

const getMonthStart = (offset = 0) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offset, 1);
};

const getOverview = async (query: Record<string, any>) => {
  const currency = String(query.currency || 'BDT').toUpperCase();
  const currencyMatch = currency === 'BDT'
    ? { $or: [{ currency: 'BDT' }, { currency: { $exists: false } }] }
    : { currency };
  const incomeMatch = { $and: [successfulPaymentMatch, currencyMatch] };
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonthStart = getMonthStart();
  const nextMonthStart = getMonthStart(1);
  const lastMonthStart = getMonthStart(-1);
  const chartStart = getMonthStart(-11);

  const [incomeResult, statusResult, monthlyIncome, topPackages] = await Promise.all([
    Subscription.aggregate([
      { $match: incomeMatch },
      { $addFields: { effectiveAmount: { $ifNull: ['$payableAmount', { $ifNull: ['$originalPrice', 0] }] }, effectivePaidAt: { $ifNull: ['$paidAt', '$updatedAt'] } } },
      { $group: {
        _id: null,
        totalIncome: { $sum: '$effectiveAmount' },
        totalDiscount: { $sum: { $ifNull: ['$discountAmount', 0] } },
        totalPaidSubscriptions: { $sum: 1 },
        todayIncome: { $sum: { $cond: [{ $gte: ['$effectivePaidAt', todayStart] }, '$effectiveAmount', 0] } },
        thisMonthIncome: { $sum: { $cond: [{ $and: [{ $gte: ['$effectivePaidAt', thisMonthStart] }, { $lt: ['$effectivePaidAt', nextMonthStart] }] }, '$effectiveAmount', 0] } },
        lastMonthIncome: { $sum: { $cond: [{ $and: [{ $gte: ['$effectivePaidAt', lastMonthStart] }, { $lt: ['$effectivePaidAt', thisMonthStart] }] }, '$effectiveAmount', 0] } },
      } },
    ]),
    Subscription.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Subscription.aggregate([
      { $match: incomeMatch },
      { $addFields: { effectiveAmount: { $ifNull: ['$payableAmount', { $ifNull: ['$originalPrice', 0] }] }, effectivePaidAt: { $ifNull: ['$paidAt', '$updatedAt'] } } },
      { $match: { effectivePaidAt: { $gte: chartStart } } },
      { $group: { _id: { year: { $year: '$effectivePaidAt' }, month: { $month: '$effectivePaidAt' } }, income: { $sum: '$effectiveAmount' }, subscriptions: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Subscription.aggregate([
      { $match: incomeMatch },
      { $addFields: { effectiveAmount: { $ifNull: ['$payableAmount', { $ifNull: ['$originalPrice', 0] }] } } },
      { $group: { _id: '$package', income: { $sum: '$effectiveAmount' }, subscriptions: { $sum: 1 } } },
      { $sort: { income: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'packages', localField: '_id', foreignField: '_id', as: 'package' } },
      { $unwind: { path: '$package', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, packageId: '$_id', title: { $ifNull: ['$package.title', 'Deleted package'] }, income: 1, subscriptions: 1 } },
    ]),
  ]);

  const income = incomeResult[0] || { totalIncome: 0, totalDiscount: 0, totalPaidSubscriptions: 0, todayIncome: 0, thisMonthIncome: 0, lastMonthIncome: 0 };
  const growthPercentage = income.lastMonthIncome > 0
    ? Number((((income.thisMonthIncome - income.lastMonthIncome) / income.lastMonthIncome) * 100).toFixed(2))
    : income.thisMonthIncome > 0 ? 100 : 0;
  const subscriptionStatus = statusResult.reduce((result: Record<string, number>, item) => {
    result[item._id] = item.count;
    return result;
  }, {});

  return {
    ...income,
    growthPercentage,
    subscriptionStatus,
    monthlyIncome: monthlyIncome.map(item => ({ year: item._id.year, month: item._id.month, income: item.income, subscriptions: item.subscriptions })),
    topPackages,
    currency,
    generatedAt: now,
  };
};

const parseDate = (value: unknown, field: string) => {
  if (!value) return undefined;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new AppError(httpStatus.BAD_REQUEST, `Invalid ${field}`);
  return date;
};

const getIncomeHistory = async (query: Record<string, any>) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const startDate = parseDate(query.startDate, 'startDate');
  const endDate = parseDate(query.endDate, 'endDate');
  const filter: Record<string, any> = { ...successfulPaymentMatch };
  const currency = String(query.currency || 'BDT').toUpperCase();
  filter.$and = currency === 'BDT'
    ? [{ $or: [{ currency: 'BDT' }, { currency: { $exists: false } }] }]
    : [{ currency }];
  if (query.provider) filter.paymentProvider = query.provider;
  if (query.couponUsed === 'true') filter.coupon = { $exists: true, $ne: null };
  if (query.couponUsed === 'false') filter.coupon = { $exists: false };
  if (query.searchTerm) filter.$and.push({ $or: [{ tranId: { $regex: query.searchTerm, $options: 'i' } }, { couponCode: { $regex: query.searchTerm, $options: 'i' } }] });
  if (startDate || endDate) {
    filter.paidAt = {};
    if (startDate) filter.paidAt.$gte = startDate;
    if (endDate) filter.paidAt.$lte = endDate;
  }

  const [records, total, totals] = await Promise.all([
    Subscription.find(filter)
      .populate('user', 'name email phoneNumber')
      .populate('package', 'title productId price totalDays')
      .populate('coupon', 'code discountType discountValue')
      .sort({ paidAt: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Subscription.countDocuments(filter),
    Subscription.aggregate([
      { $match: filter },
      { $group: { _id: null, income: { $sum: { $ifNull: ['$payableAmount', { $ifNull: ['$originalPrice', 0] }] } }, discount: { $sum: { $ifNull: ['$discountAmount', 0] } } } },
    ]),
  ]);

  return {
    data: records,
    summary: { income: totals[0]?.income || 0, discount: totals[0]?.discount || 0, transactions: total, currency },
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

export const adminDashboardService = { getOverview, getIncomeHistory };
