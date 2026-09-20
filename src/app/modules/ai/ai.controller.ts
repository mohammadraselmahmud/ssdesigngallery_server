import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { generateSsDesignPreview } from './ai.service';

const ssPreview = catchAsync(async (req: Request, res: Response) => { 
  const userId = req.user?.userId || req.user?.id;

  const result = await generateSsDesignPreview(
    req.body,
    userId,
    req.user?.role,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Image generated successfully',
    data: result,
  });
});

export const aiControllers = {
  ssPreview,
};
// export async function handleSSPreview(req: Request, res: Response) {
//   try {
//     if (!userImageBase64 || !ssDesignUrl) {
//       return res.status(400).json({
//         success: false,
//         error: 'Both userImageBase64 and ssDesignUrl are required.',
//       } as ApiResponse);
//     }

//     // ১. ইমেজ অটোমেটিক রিসাইজ ও ক্লিন করা

//     // ২. AI ইনপেইন্টিং রান করা

//     return res.status(200).json({
//       success: true,
//       resultUrl: generatedUrl,
//     } as ApiResponse);
//   } catch (error: any) {
//     console.error('AI Generation Error:', error.message || error);
//     return res.status(500).json({
//       success: false,
//       error: error.message || 'Internal Server Error',
//     } as ApiResponse);
//   }
// }
