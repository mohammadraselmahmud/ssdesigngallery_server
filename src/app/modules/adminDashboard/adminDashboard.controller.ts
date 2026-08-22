import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { adminDashboardService } from './adminDashboard.service';

const getOverview = catchAsync(async (req: Request, res: Response) => sendResponse(res, {
  statusCode: 200,
  success: true,
  message: 'Admin income overview fetched successfully',
  data: await adminDashboardService.getOverview(req.query),
}));

const getIncomeHistory = catchAsync(async (req: Request, res: Response) => sendResponse(res, {
  statusCode: 200,
  success: true,
  message: 'Income history fetched successfully',
  data: await adminDashboardService.getIncomeHistory(req.query),
}));

export const adminDashboardController = { getOverview, getIncomeHistory };
