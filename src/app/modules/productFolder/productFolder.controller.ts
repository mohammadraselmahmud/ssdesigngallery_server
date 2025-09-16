import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { productFolderService } from './productFolder.service';
import sendResponse from '../../utils/sendResponse';
import { storeFile } from '../../utils/fileHelper';
import { uploadToS3 } from '../../utils/s3';

const createProductFolder = catchAsync(async (req: Request, res: Response) => {
  const result = await productFolderService.createProductFolder(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'ProductFolder created successfully',
    data: result,
  });
});

const getAllProductFolder = catchAsync(async (req: Request, res: Response) => {
  const result = await productFolderService.getAllProductFolder(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All productFolder fetched successfully',
    data: result,
  });
});
const getMyProductFolder = catchAsync(async (req: Request, res: Response) => {
  req.query['userId'] = req.user.userId;
  const result = await productFolderService.getAllProductFolder(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All productFolder fetched successfully',
    data: result,
  });
});

const getProductFolderById = catchAsync(async (req: Request, res: Response) => {
  const result = await productFolderService.getProductFolderById(
    req.params.folderId,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ProductFolder fetched successfully',
    data: result,
  });
});

const updateProductFolder = catchAsync(async (req: Request, res: Response) => {
  const result = await productFolderService.updateProductFolder(
    req.params.folderId,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ProductFolder updated successfully',
    data: result,
  });
});

const updateNote = catchAsync(async (req: Request, res: Response) => {
  const result = await productFolderService.updateNote(req.params, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product note update successfully',
    data: result,
  });
});

const deleteProductFolder = catchAsync(async (req: Request, res: Response) => {
  const result = await productFolderService.deleteProductFolder(
    req.params.folderId,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ProductFolder deleted successfully',
    data: result,
  });
});

const deleteProductFromFolder = catchAsync(
  async (req: Request, res: Response) => {
    const result = await productFolderService.deleteProductFromFolder(
      req.params,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'ProductFolder deleted successfully',
      data: result,
    });
  },
);

export const productFolderController = {
  createProductFolder,
  getAllProductFolder,
  getProductFolderById,
  updateProductFolder,
  deleteProductFolder,
  deleteProductFromFolder,
  updateNote,
  getMyProductFolder,
};
