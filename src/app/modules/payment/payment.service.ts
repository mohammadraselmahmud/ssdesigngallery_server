import aamarpayService from '../../class/payment/aamarpay';
import cashfreeService from '../../class/payment/cashfree';
import Subscription from '../subscription/subscription.models';
import {
  PaymentInitRequest,
  PaymentVerifyPayload,
} from '../../class/payment/payment.interface';
import { IPackage } from '../package/package.interface';
import { IUser } from '../user/user.interface';
import config from '../../config';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

type PaymentInitPayload = PaymentInitRequest & {
  provider: 'aamarpay' | 'cashfree';
  subscriptionId?: string;
  redirectUrl?: string;
};

const CURRENCY_BY_PROVIDER: Record<string, string> = {
  aamarpay: 'BDT',
  cashfree: 'INR',
};

// const initializePayment = async (payload: PaymentInitPayload) => {
//   const { provider, subscriptionId, redirectUrl } = payload;

//   if (!subscriptionId) {
//     throw new Error('subscriptionId is required');
//   }

//   const subscription = await Subscription.findById(subscriptionId).populate([
//     { path: 'package' },
//     { path: 'user' },
//   ]);

//   if (!subscription) {
//     throw new Error('Subscription not found');
//   }

//   const packageData = subscription.package as IPackage & { _id?: string };
//   const userData = subscription.user as IUser & { _id?: string };
//   const orderId = subscription._id?.toString() || '';

//   if (!orderId) {
//     throw new Error('Unable to resolve orderId for subscription');
//   }

//   const frontendRedirectUrl =
//     redirectUrl ||
//     payload.successUrl ||
//     process.env.CLIENT_URL ||
//     'http://localhost:3000/payment/success';

//   const serverBaseUrl = process.env.SERVER_URL || 'http://localhost:5000';
//   const callbackBaseUrl = `${serverBaseUrl}/api/payment`;

//   // userId/packageId are intentionally NOT put in the URL anymore —
//   // handlePaymentSuccess looks the subscription up by orderId instead,
//   // so a tampered query string can no longer redirect activation to a
//   // different user/package.
//   const successUrl = `${callbackBaseUrl}/success?orderId=${orderId}&provider=${provider}&redirectUrl=${encodeURIComponent(frontendRedirectUrl)}`;
//   const cancelUrl = `${callbackBaseUrl}/cancel?orderId=${orderId}&redirectUrl=${encodeURIComponent(frontendRedirectUrl)}`;

//   const paymentPayload: PaymentInitRequest = {
//     amount: packageData.price,
//     currency: payload.currency || CURRENCY_BY_PROVIDER[provider],
//     orderId,
//     customerName: userData.name,
//     customerEmail: userData.email,
//     customerPhone: userData?.phoneNumber || '01700000000',
//     successUrl,
//     cancelUrl,
//     metadata: {
//       ...(payload.metadata || {}),
//       subscriptionId: subscription._id?.toString(),
//       userId: userData._id || '',
//       packageId: packageData._id || '',
//       description: 'Subscription payment',
//       redirectUrl: frontendRedirectUrl,
//     },
//   };

//   if (provider === 'aamarpay') {
//     return aamarpayService.initializePayment(paymentPayload);
//   }

//   if (provider === 'cashfree') {
//     return cashfreeService.initializePayment(paymentPayload);
//   }

//   throw new Error('Unsupported payment provider');
// };

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
  const transactionRef = `${dbOrderId}-${Date.now()}`;

  const frontendRedirectUrl =
    redirectUrl ||
    payload.successUrl ||
    process.env.CLIENT_URL ||
    'http://localhost:3000/payment/success';

  //   const serverBaseUrl = process.env.SERVER_URL || 'http://localhost:5000/api';
  //   const callbackBaseUrl = `${serverBaseUrl}/payment`;

  // subscriptionId -> used to look up the Subscription doc
  // orderId        -> the unique gateway transaction ref, used to verify
  const successUrl = `${config?.server_url}/payment/success?subscriptionId=${dbOrderId}&tranId=${transactionRef}&provider=${provider}&redirectUrl=${encodeURIComponent(frontendRedirectUrl)}`;
  const cancelUrl = `${config?.server_url}/payment/cancel?subscriptionId=${dbOrderId}&tranId=${transactionRef}&redirectUrl=${encodeURIComponent(frontendRedirectUrl)}`;

  const paymentPayload: PaymentInitRequest = {
    amount: packageData.price,
    currency: payload.currency || CURRENCY_BY_PROVIDER[provider],
    orderId: transactionRef,
    customerName: userData.name,
    customerEmail: userData.email,
    customerPhone: userData?.phoneNumber || '01700000000',
    successUrl,
    cancelUrl,
    metadata: {
      ...(payload.metadata || {}),
      subscriptionId: dbOrderId,
      userId: userData._id || '',
      packageId: packageData._id || '',
      description: 'Subscription payment',
      redirectUrl: frontendRedirectUrl,
    },
  };

  if (provider === 'aamarpay') {
    return aamarpayService.initializePayment(paymentPayload);
  }

  if (provider === 'cashfree') {
    return cashfreeService.initializePayment(paymentPayload);
  }

  throw new Error('Unsupported payment provider');
};

const verifyPayment = async (payload: PaymentVerifyPayload) => {
  if (payload.provider === 'aamarpay') {
    return aamarpayService.verifyPayment(payload);
  }

  if (payload.provider === 'cashfree') {
    return cashfreeService.verifyPayment(payload);
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
  const { subscriptionId, tranId, provider } = query;
  const orderId = typeof query.orderId === 'string' ? query.orderId : tranId;

  if (!subscriptionId || !tranId || !provider) {
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

  // Idempotency guard — duplicate callback (double redirect, retried
  // webhook) shouldn't reprocess an already-active subscription.
  if (subscription.status === 'active' && subscription.isActive) {
    throw new AppError(httpStatus.OK, 'Subscription already active');
  }

  let verification;
  try {
    verification = await verifyPayment({
      provider: provider as 'aamarpay' | 'cashfree',
      orderId: tranId,
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
  const oldSubscription = await Subscription.findOneAndDelete(
    {
      user: subscription.user,
      isActive: true,
      isDeleted: false,
    },
    {
      isActive: false,
      isExpired: true,
    },
  );
  const packageData = subscription.package as IPackage & {
    durationInMonths?: number;
  };
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(
    endDate.getMonth() + getSubscriptionDurationInMonths(packageData),
  );

  subscription.startDate = now;
  subscription.endDate = endDate;
  subscription.status = 'active';
  subscription.isActive = true;
  subscription.isExpired = false;
  subscription.isDeleted = false;
  await subscription.save();

  return {
    success: true,
    orderId,
    message: 'Subscription activated successfully',
  };
};

export const paymentService = {
  initializePayment,
  verifyPayment,
  handlePaymentSuccess,
};
