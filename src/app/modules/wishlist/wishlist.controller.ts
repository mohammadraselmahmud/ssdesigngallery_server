import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { wishlistService } from './wishlist.service';
import sendResponse from '../../utils/sendResponse';

const createWishlist = catchAsync(async (req: Request, res: Response) => {
  req.body['userId'] = req.user.userId;
  const result = await wishlistService.createWishlist(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Wishlist created successfully',
    data: result,
  });
});

const getAllWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await wishlistService.getAllWishlist(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All wishlist fetched successfully',
    data: result,
  });
});

const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  req.query['userId'] = req.user.userId;
  const result = await wishlistService.getAllWishlist(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My wishlist fetched successfully',
    data: result,
  });
});

const getWishlistById = catchAsync(async (req: Request, res: Response) => {
  const result = await wishlistService.getWishlistById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Wishlist fetched successfully',
    data: result,
  });
});

const updateWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await wishlistService.updateWishlist(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Wishlist updated successfully',
    data: result,
  });
});

const deleteWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await wishlistService.deleteWishlist(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Wishlist deleted successfully',
    data: result,
  });
});

export const wishlistController = {
  createWishlist,
  getAllWishlist,
  getWishlistById,
  updateWishlist,
  deleteWishlist,
  getMyWishlist,
};
