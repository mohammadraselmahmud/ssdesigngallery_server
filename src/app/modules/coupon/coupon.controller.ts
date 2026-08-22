import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { couponService } from './coupon.service';

const respond = (res: Response, statusCode: number, message: string, data: any) =>
  sendResponse(res, { statusCode, success: true, message, data });
const createCoupon = catchAsync(async (req: Request, res: Response) => respond(res, 201, 'Coupon created successfully', await couponService.createCoupon(req.body)));
const getAllCoupons = catchAsync(async (req: Request, res: Response) => respond(res, 200, 'Coupons fetched successfully', await couponService.getAllCoupons(req.query)));
const getCouponById = catchAsync(async (req: Request, res: Response) => respond(res, 200, 'Coupon fetched successfully', await couponService.getCouponById(req.params.id)));
const updateCoupon = catchAsync(async (req: Request, res: Response) => respond(res, 200, 'Coupon updated successfully', await couponService.updateCoupon(req.params.id, req.body)));
const deleteCoupon = catchAsync(async (req: Request, res: Response) => respond(res, 200, 'Coupon deleted successfully', await couponService.deleteCoupon(req.params.id)));
const validateCoupon = catchAsync(async (req: Request, res: Response) => respond(res, 200, 'Coupon applied successfully', await couponService.validateCoupon(req.body.code, req.body.packageId, req.user.userId)));
export const couponController = { createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon, validateCoupon };
