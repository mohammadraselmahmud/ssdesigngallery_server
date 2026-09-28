import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import {
  generateSsDesignPreview,
  getSsDesignPreviewStatus,
} from './ai.service';

const ssPreview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId || req.user?.id;
  const result = await generateSsDesignPreview(req.body, userId, req.user?.role);

  sendResponse(res, {
    statusCode: httpStatus.ACCEPTED,
    success: true,
    message: 'Image generation started. Check the prediction status endpoint.',
    data: result,
  });
});

const ssPreviewStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await getSsDesignPreviewStatus(req.params.predictionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:
      result.status === 'succeeded'
        ? 'Image generated successfully.'
        : result.status === 'failed' || result.status === 'canceled'
          ? 'Image generation failed.'
          : 'Image generation is still processing.',    data: result,
  });
});

export const aiControllers = {
  ssPreview,
  ssPreviewStatus,
};