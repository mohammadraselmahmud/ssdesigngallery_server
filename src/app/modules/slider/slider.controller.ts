import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sliderService } from './slider.service';
import sendResponse from '../../utils/sendResponse'; 
import { uploadToS3 } from '../../utils/s3';

const createSlider = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    req.body.sliderImage = await uploadToS3({
      file: req.file,
      fileName: `images/products/${Math.floor(100000 + Math.random() * 900000)}`,
    });
  }

  const result = await sliderService.createSlider(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Slider created successfully',
    data: result,
  });
});

const getAllSlider = catchAsync(async (req: Request, res: Response) => {
  const result = await sliderService.getAllSlider(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All slider fetched successfully',
    data: result,
  });
});

const getSliderById = catchAsync(async (req: Request, res: Response) => {
  const result = await sliderService.getSliderById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Slider fetched successfully',
    data: result,
  });
});
const updateSlider = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    req.body.sliderImage = await uploadToS3({
      file: req.file,
      fileName: `images/products/${Math.floor(100000 + Math.random() * 900000)}`,
    });
  }

  const result = await sliderService.updateSlider(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Slider updated successfully',
    data: result,
  });
});

const deleteSlider = catchAsync(async (req: Request, res: Response) => {
  const result = await sliderService.deleteSlider(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Slider deleted successfully',
    data: result,
  });
});

export const sliderController = {
  createSlider,
  getAllSlider,
  getSliderById,
  updateSlider,
  deleteSlider,
};
