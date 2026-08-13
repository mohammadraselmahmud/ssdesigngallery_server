import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { paymentService } from './payment.service';

const initPayment = catchAsync(async (req: Request, res: Response) => {
  req.body.userId = req.user?._id; // Assuming you have user information in the request object
  const result = await paymentService.initializePayment(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment initialized successfully',
    data: result,
  });
});

const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.verifyPayment(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment verified successfully',
    data: result,
  });
});

const handlePaymentSuccess = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.handlePaymentSuccess(req.query);
  //   const redirectUrl =
  //     typeof req.query.redirectUrl === 'string' && req.query.redirectUrl
  //       ? req.query.redirectUrl
  //       : `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success`;

  //   res.redirect(
  //     `${redirectUrl}?status=${result.success ? 'success' : 'failed'}&orderId=${result.orderId || ''}`,
  //   );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment completed successfully',
    data: result,
  });
});
const handlePaymentCancel = catchAsync(async (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment is failed or canceled by user',
    data: {
      status: 'cancelled',
      orderId: req.query.orderId || '',
    },
  });
});

export const paymentController = {
  initPayment,
  verifyPayment,
  handlePaymentSuccess,
  handlePaymentCancel,
};
