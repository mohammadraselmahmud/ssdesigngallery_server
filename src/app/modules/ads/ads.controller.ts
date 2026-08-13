import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { adsService } from './ads.service';
import sendResponse from '../../utils/sendResponse';

const createAds = catchAsync(async (req: Request, res: Response) => {
  const result = await adsService.createAds(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Ads created successfully',
    data: result,
  });
});

const getAllAds = catchAsync(async (req: Request, res: Response) => {
  const result = await adsService.getAllAds(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All ads fetched successfully',
    data: result,
  });
});

const getPublicAds = catchAsync(async (req: Request, res: Response) => {
  const result = await adsService.getPublicAds(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Public ads fetched successfully',
    data: result,
  });
});

const getAdsById = catchAsync(async (req: Request, res: Response) => {
  const result = await adsService.getAdsById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Ads fetched successfully',
    data: result,
  });
});

const updateAds = catchAsync(async (req: Request, res: Response) => {
  const result = await adsService.updateAds(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Ads updated successfully',
    data: result,
  });
});

const deleteAds = catchAsync(async (req: Request, res: Response) => {
  const result = await adsService.deleteAds(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Ads deleted successfully',
    data: result,
  });
});

export const adsController = {
  createAds,
  getAllAds,
  getPublicAds,
  getAdsById,
  updateAds,
  deleteAds,
};
