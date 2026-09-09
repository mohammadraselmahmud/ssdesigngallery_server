import payStationService from '../../class/payment/paystation';
import Subscription from '../subscription/subscription.models';
import {
  PaymentInitRequest,
  PaymentVerifyPayload,
} from '../../class/payment/payment.interface';
import { IPackage } from '../package/package.interface';
import { IUser } from '../user/user.interface';
import Package from '../package/package.models';
import Coupon from '../coupon/coupon.models';
import { claimCoupon, getValidCoupon } from '../coupon/coupon.service';
import { User } from '../user/user.models';
import { Types } from 'mongoose';
import config from '../../config';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

type PaymentInitPayload = PaymentInitRequest & {
  provider: 'paystation';
  subscriptionId?: string;
  redirectUrl?: string;
};

const CURRENCY_BY_PROVIDER: Record<string, string> = {
  paystation: 'BDT',
};

const initializePayment = async (payload: PaymentInitPayload) => {
  const { provider, subscriptionId, redirectUrl } = payload;

  if (!subscriptionId) {
    throw new Error('subscriptionId is required');
  }

  const subscription = await Subscription.findById(subscriptionId).populate([
    { path: 'package' },
    { path: 'user' },
  ]);

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  const packageData = subscription.package as IPackage & { _id?: string };
  const userData = subscription.user as IUser & { _id?: string };
  const dbOrderId = subscription._id?.toString() || '';

  if (!dbOrderId) {
    throw new Error('Unable to resolve orderId for subscription');
  }

  // Unique per attempt — gateway tran_id/order_id must never repeat,
  // even for the same subscription (retries, abandoned payments, etc).
  const transactionRef = `${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

  subscription.tranId = transactionRef;
  subscription.paymentProvider = 'paystation';
  subscription.currency = 'BDT';
  subscription.status = 'pending';
  await subscription.save();

  const frontendRedirectUrl =
    redirectUrl ||
    payload.successUrl ||
    process.env.CLIENT_URL ||
    'http://localhost:3000/payment/success';

  const successUrl = `${config?.server_url}/payment/success?subscriptionId=${dbOrderId}&tranId=${transactionRef}&provider=${provider}`;
  const cancelUrl = `${config?.server_url}/payment/cancel?subscriptionId=${dbOrderId}&tranId=${transactionRef}`;

  const paymentPayload: PaymentInitRequest = {
    amount: subscription.payableAmount ?? packageData.price,
    currency: payload.currency || CURRENCY_BY_PROVIDER[provider],
    orderId: transactionRef,
    customerName: userData.name,
    customerEmail: userData.email,
    customerPhone: userData?.phoneNumber || '01700000000',
    successUrl,
    cancelUrl,
    subscriptionId: dbOrderId,
    metadata: {
      ...(payload.metadata || {}),
      subscriptionId: dbOrderId,
      userId: userData._id || '',
      packageId: packageData._id || '',
      description: 'Subscription payment',
      redirectUrl: frontendRedirectUrl,
    },
  };

  if (provider === 'paystation') {
    return payStationService.initializePayment(paymentPayload);
  }

  throw new Error('Unsupported payment provider');
};

const verifyPayment = async (payload: PaymentVerifyPayload) => {
  if (payload.provider === 'paystation' && payload.paymentId) {
    return payStationService.verifyPayment(payload.paymentId);
  }

  throw new Error('Unsupported payment provider');
};

// TODO: point this at whatever field your Package schema actually stores
// (durationInMonths / billingCycle / interval). Defaulting to 1 month is
// only a safe fallback, not correct for yearly/weekly plans.
const getSubscriptionDurationInMonths = (
  packageData: IPackage & { durationInMonths?: number },
) => {
  return packageData?.durationInMonths || 1;
};

const handlePaymentSuccess = async (query: Record<string, any>) => {
  const {
    subscriptionId,
    tranId,
    provider,
    invoice_number: payStationInvoiceNumber,
    invoice,
    order_id: callbackOrderId,
  } = query;

  const rawProvider = typeof provider === 'string' ? provider : '';
  const [normalizedProvider, appendedQuery] = rawProvider.split('?');
  const appendedParams = new URLSearchParams(appendedQuery);
  const gatewayOrderId =
    (typeof payStationInvoiceNumber === 'string' &&
    payStationInvoiceNumber !== '{invoice_number}'
      ? payStationInvoiceNumber
      : undefined) ||
    (typeof invoice === 'string' ? invoice : undefined) ||
    (typeof callbackOrderId === 'string' ? callbackOrderId : undefined) ||
    appendedParams.get('invoice_number') ||
    appendedParams.get('order_id');

  if (!subscriptionId || !tranId || !normalizedProvider || !gatewayOrderId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Missing required query parameters for payment success',
    );
  }

  const subscription =
    await Subscription.findById(subscriptionId).populate('package');

  if (!subscription) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Subscription not found for this order',
    );
  }

  if (normalizedProvider !== 'paystation' || subscription.tranId !== tranId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment invoice does not match',
    );
  }

  // Idempotency guard — duplicate callback (double redirect, retried
  // webhook) shouldn't reprocess an already-active subscription.
  if (subscription.status === 'active') {
    throw new AppError(httpStatus.OK, 'Subscription already active');
  }

  let verification;
  try {
    verification = await verifyPayment({
      provider: normalizedProvider as 'paystation',
      orderId: tranId,
      paymentId: gatewayOrderId,
      requestBody: query,
    });
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Payment verification error: ${(error as Error).message}`,
    );
  }

  if (!verification.success) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment verification failed');
  }
  const payStationResponse = verification.rawResponse as Record<
    string,
    unknown
  >;
  if (
    verification.orderId !== tranId ||
    Number(payStationResponse.payment_amount).toFixed(2) !==
      Number(subscription.payableAmount).toFixed(2)
  )
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'PayStation payment details do not match this subscription',
    );
  await Subscription.updateMany(
    {
      user: subscription.user,
      _id: { $ne: subscription._id },
      status: 'active',
      isDeleted: false,
    },
    { $set: { status: 'expired' } },
  );
  const packageData = subscription.package as IPackage & {
    durationInMonths?: number;
  };
  const now = new Date();
  const endDate = new Date(now);
  if (packageData.totalDays && packageData.totalDays > 0) {
    endDate.setDate(endDate.getDate() + packageData.totalDays);
  } else {
    endDate.setMonth(
      endDate.getMonth() + getSubscriptionDurationInMonths(packageData),
    );
  }

  const totalCredit = packageData.limit || 0;

  subscription.startDate = now;
  subscription.endDate = endDate;
  subscription.totalCredit = totalCredit;
  subscription.usedCredit = 0;
  subscription.remainingCredit = totalCredit;
  subscription.status = 'active';
  subscription.tranId = verification.paymentId || gatewayOrderId;
  subscription.paymentProvider = normalizedProvider as 'paystation';
  subscription.currency = CURRENCY_BY_PROVIDER[normalizedProvider];
  subscription.paidAt = now;
  subscription.isDeleted = false;
  await subscription.save();

  return {
    success: true,
    orderId: gatewayOrderId,
    message: 'Subscription activated successfully',
  };
};

export type GooglePayVerifyPayload = {
  packageId?: string;
  package?: string;
  productId?: string;
  subscriptionId?: string;
  orderId?: string;
  tranId?: string;
  purchaseToken?: string;
  token?: string;
  amount?: number;
  currency?: string;
  couponCode?: string;
  userId?: string;
  paymentData?: Record<string, any>;
};

const verifyAndSubscribeGooglePay = async (
  payload: GooglePayVerifyPayload,
  authenticatedUserId?: string,
) => {
  const userId = authenticatedUserId || payload.userId;
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'User ID is required to process subscription',
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const tranId =
    payload.orderId || payload.tranId || payload.purchaseToken || payload.token;

  if (!tranId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment orderId / transaction ID / purchase token is required',
    );
  }

  // Idempotency: check if subscription with this tranId already exists and is active
  const existingActiveSub = await Subscription.findOne({
    tranId,
    status: 'active',
  }).populate([
    { path: 'user', select: 'name email phoneNumber profile' },
    {
      path: 'package',
      select: 'title productId description price totalDays limit isRecommended',
    },
    { path: 'coupon', select: 'code discountType discountValue' },
  ]);

  if (existingActiveSub) {
    return {
      success: true,
      orderId: tranId,
      message: 'Subscription is already active for this payment',
      data: existingActiveSub,
    };
  }

  let pkg: (IPackage & { _id: Types.ObjectId }) | null = null;
  let existingSubDoc: any = null;

  if (payload.subscriptionId) {
    existingSubDoc = await Subscription.findById(
      payload.subscriptionId,
    ).populate('package');
    if (!existingSubDoc) {
      throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
    }
    pkg = existingSubDoc.package as IPackage & { _id: Types.ObjectId };
  }

  if (!pkg) {
    const pkgIdOrProductId =
      payload.packageId || payload.package || payload.productId;
    if (!pkgIdOrProductId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'packageId, productId, or subscriptionId is required',
      );
    }

    if (Types.ObjectId.isValid(pkgIdOrProductId)) {
      pkg = (await Package.findOne({
        _id: pkgIdOrProductId,
        isDeleted: false,
      })) as (IPackage & { _id: Types.ObjectId }) | null;
    }

    if (!pkg && typeof pkgIdOrProductId === 'string') {
      pkg = (await Package.findOne({
        productId: pkgIdOrProductId,
        isDeleted: false,
      })) as (IPackage & { _id: Types.ObjectId }) | null;
    }

    if (!pkg) {
      throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
    }
  }

  let originalPrice = pkg.price;
  let discountAmount = 0;
  let payableAmount = pkg.price;
  let couponId: Types.ObjectId | undefined;
  let couponCode: string | undefined;

  const inputCouponCode = payload.couponCode?.trim();
  if (inputCouponCode) {
    const applied = await getValidCoupon(
      inputCouponCode,
      pkg._id.toString(),
      userId.toString(),
    );
    const claimed = await claimCoupon(applied.coupon._id, userId.toString());
    if (!claimed) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Coupon usage limit reached');
    }
    originalPrice = applied.originalPrice;
    discountAmount = applied.discountAmount;
    payableAmount = applied.payableAmount;
    couponId = applied.coupon._id;
    couponCode = applied.coupon.code;
  }

  const now = new Date();
  const endDate = new Date(now);
  if (pkg.totalDays && pkg.totalDays > 0) {
    endDate.setDate(endDate.getDate() + pkg.totalDays);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  // Expire any other active subscriptions for this user
  await Subscription.updateMany(
    {
      user: userId,
      status: 'active',
      isDeleted: false,
      ...(existingSubDoc?._id ? { _id: { $ne: existingSubDoc._id } } : {}),
    },
    { $set: { status: 'expired' } },
  );

  const totalCredit = pkg.limit || 0;
  const usedCredit = 0;
  const remainingCredit = totalCredit;

  let activeSubscription;
  try {
    if (existingSubDoc) {
      existingSubDoc.startDate = now;
      existingSubDoc.endDate = endDate;
      existingSubDoc.totalCredit = totalCredit;
      existingSubDoc.usedCredit = usedCredit;
      existingSubDoc.remainingCredit = remainingCredit;
      existingSubDoc.status = 'active';
      existingSubDoc.tranId = tranId;
      existingSubDoc.paymentProvider = 'google_pay';
      existingSubDoc.currency = (payload.currency || 'USD').toUpperCase();
      existingSubDoc.paidAt = now;
      existingSubDoc.isDeleted = false;
      if (couponId) {
        existingSubDoc.coupon = couponId;
        existingSubDoc.couponCode = couponCode;
        existingSubDoc.originalPrice = originalPrice;
        existingSubDoc.discountAmount = discountAmount;
        existingSubDoc.payableAmount = payableAmount;
      }
      activeSubscription = await existingSubDoc.save();
    } else {
      activeSubscription = await Subscription.create({
        user: new Types.ObjectId(userId),
        package: pkg._id,
        startDate: now,
        endDate,
        totalCredit,
        usedCredit,
        remainingCredit,
        tranId,
        coupon: couponId,
        couponCode,
        originalPrice,
        discountAmount,
        payableAmount,
        paymentProvider: 'google_pay',
        currency: (payload.currency || 'USD').toUpperCase(),
        paidAt: now,
        status: 'active',
        isDeleted: false,
      });
    }

    if (couponId) {
      await Coupon.updateOne(
        { _id: couponId },
        { $set: { 'usages.$[usage].subscription': activeSubscription._id } },
        {
          arrayFilters: [
            {
              'usage.user': new Types.ObjectId(userId),
              'usage.subscription': { $exists: false },
            },
          ],
        },
      );
    }
  } catch (error) {
    if (couponId) {
      await Coupon.findByIdAndUpdate(couponId, {
        $inc: { usedCount: -1 },
        $pop: { usages: 1 },
      });
    }
    throw error;
  }

  const populatedSubscription = await Subscription.findById(
    activeSubscription._id,
  ).populate([
    { path: 'user', select: 'name email phoneNumber profile' },
    {
      path: 'package',
      select: 'title productId description price totalDays limit isRecommended',
    },
    { path: 'coupon', select: 'code discountType discountValue' },
  ]);

  return {
    success: true,
    orderId: tranId,
    message: 'Subscription activated successfully via Google Pay',
    data: populatedSubscription,
  };
};

export const paymentService = {
  initializePayment,
  verifyPayment,
  handlePaymentSuccess,
  verifyAndSubscribeGooglePay,
};
