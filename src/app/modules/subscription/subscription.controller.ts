import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { subscriptionService } from './subscription.service';
import sendResponse from '../../utils/sendResponse';

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  req.body.user = req?.user?.userId;
  const result = await subscriptionService.createSubscription(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Subscription created successfully',
    data: result,
  });
});

const getAllSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.getAllSubscription(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All subscription fetched successfully',
    data: result,
  });
});

const getSubscriptionById = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.getSubscriptionById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscription fetched successfully',
    data: result,
  });
});
const getCurrentPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.getCurrentPlan(req.user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Current plan fetched successfully',
    data: result,
  });
});

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.updateSubscription(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscription updated successfully',
    data: result,
  });
});

const deleteSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.deleteSubscription(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscription deleted successfully',
    data: result,
  });
});

export const subscriptionController = {
  createSubscription,
  getAllSubscription,
  getSubscriptionById,
  updateSubscription,getCurrentPlan,
  deleteSubscription,
};
