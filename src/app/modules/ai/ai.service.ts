import Replicate from 'replicate';
// import { GeneratePreviewInput } from './ai.interface';
import config from '../../config';
import Subscription from '../subscription/subscription.models';
import { IPackage } from '../package/package.interface';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { User } from '../user/user.models';
import { GeneratePreviewInput, GeneratePreviewResponse } from './ai.interface';
import { buildSsDesignPrompt, getOutputUrl } from './ai.utils';

// const replicate = new Replicate({
//   auth: config?.replicate_api_key,
// });
// // export const REPLICATE_MODEL = 'black-forest-labs/flux-2-pro';
// export const REPLICATE_MODEL = 'prunaai/p-image-edit';

// export interface GeneratePreviewResponse {
//   generatedUrl: string;
//   subscriptionId?: string;
//   totalCredit?: number;
//   usedCredit?: number;
//   remainingCredit?: number;
//   freeAiImageCount?: number;
//   freeAiImageLimit?: number;
//   unlimited?: boolean;
// }
const replicate = new Replicate({
  auth: config?.replicate_api_key,
});

export const REPLICATE_MODEL = 'prunaai/p-image-edit';

export const generateSsDesignPreview = async (
  payload: GeneratePreviewInput,
  userId?: string,
    userRole?: string,
    replicateClient?: { run: (...args: any[]) => Promise<any> },
): Promise<GeneratePreviewResponse> => {
  try {
  const client = replicateClient || replicate;

  if (!replicateClient && !config.replicate_api_key) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'REPLICATE_API_TOKEN is not configured.',
    );
  }

  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'User authentication required to generate AI preview.',
    );
  }

  const isUnlimitedUser = ['admin', 'sub_admin', 'super_admin'].includes(
    userRole || '',
  );

  const now = new Date();
  const subscription = isUnlimitedUser
    ? null
    : await (async () => {
        await Subscription.updateMany(
          {
            user: userId,
            status: 'active',
            endDate: { $lte: now },
            isDeleted: false,
          },
          { $set: { status: 'expired' } },
        );

        return Subscription.findOne({
          user: userId,
          status: 'active',
          endDate: { $gt: now },
          isDeleted: false,
        }).populate('package');
      })();

  let totalCredit: number | undefined;
  let usedCredit: number | undefined;
  let remainingCredit: number | undefined;
  let freeAiImageCount: number | undefined;
  let freeSlotReserved = false;

  if (subscription) {
    const pkg = subscription.package as IPackage;
    totalCredit =
      subscription.totalCredit !== undefined &&
      subscription.totalCredit !== null
        ? subscription.totalCredit
        : pkg?.limit || 0;
    usedCredit = subscription.usedCredit || 0;
    remainingCredit =
      subscription.remainingCredit !== undefined &&
      subscription.remainingCredit !== null
        ? subscription.remainingCredit
        : Math.max(0, totalCredit - usedCredit);

    if (remainingCredit <= 0) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Your subscription credit limit has been exhausted. Please renew or upgrade your plan.',
      );
    }
  } else if (!isUnlimitedUser) {
    const freeUser = await User.findOneAndUpdate(
      {
        _id: userId,
        $or: [
          { freeAiImageCount: { $lt: 2 } },
          { freeAiImageCount: { $exists: false } },
        ],
      },
      { $inc: { freeAiImageCount: 1 } },
      { new: true, projection: { freeAiImageCount: 1 } },
    ).lean();

    if (!freeUser) {
      throw new AppError(
        httpStatus.PAYMENT_REQUIRED,
        'You have used your 2 free AI images. Please subscribe to continue generating images.',
      );
    }

    freeAiImageCount = freeUser.freeAiImageCount;
    freeSlotReserved = true;
  }




    //=================================================================================
    const {
      userImageUrl: customerImageUrl,
      ssDesignUrl:designImageUrl,
      promptInstruction,
      category,
    } = payload;

    if (!customerImageUrl) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Customer image is required.');
    }

    if (!designImageUrl) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Selected SS design image is required.',
      );
    }

    if (!category) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'SS design category is required.',
      );
    }

    const prompt = buildSsDesignPrompt(category);

    const output = await replicate.run(REPLICATE_MODEL, {
      input: {
        // Main/customer image MUST be first
        images: [customerImageUrl, designImageUrl],

        prompt,

        // Maintain customer's photo ratio
        aspect_ratio: 'match_input_image',

        // SS placement is a complex architectural edit.
        // false generally gives the model more room for quality.
        turbo: false,

        no_op: false,

        // Keep safety checker enabled
        disable_safety_checker: false,
      },
    });

    const generatedUrl = getOutputUrl(output);

    return {
      generatedUrl,
    };
  } catch (error: any) {
    console.error('SS AI preview generation failed:', {
      message: error?.message,
      response: error?.response?.data,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error?.message || 'Failed to generate SS design preview.',
    );
  }
};

// export const getOutputUrl = (output: unknown): string => {
//   const value = Array.isArray(output) ? output[0] : output;

//   if (typeof value === 'string') {
//     return value;
//   }

//   if (value && typeof value === 'object') {
//     if ('url' in value) {
//       if (typeof (value as any).url === 'function') {
//         return String((value as any).url());
//       }
//       if (typeof (value as any).url === 'string') {
//         return (value as any).url;
//       }
//     }
//     if (typeof value.toString === 'function') {
//       const str = value.toString();
//       if (str && str !== '[object Object]') {
//         return str;
//       }
//     }
//   }

//   throw new AppError(
//     httpStatus.INTERNAL_SERVER_ERROR,
//     'AI model did not return an image URL.',
//   );
// };

// export async function generateSSPreview(
//   data: GeneratePreviewInput,
//   userId?: string,
//   userRole?: string,
//   replicateClient?: { run: (...args: any[]) => Promise<any> },
// ): Promise<GeneratePreviewResponse> {
//   const client = replicateClient || replicate;

//   if (!replicateClient && !config.replicate_api_key) {
//     throw new AppError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       'REPLICATE_API_TOKEN is not configured.',
//     );
//   }

//   if (!userId) {
//     throw new AppError(
//       httpStatus.UNAUTHORIZED,
//       'User authentication required to generate AI preview.',
//     );
//   }

//   const isUnlimitedUser = ['admin', 'sub_admin', 'super_admin'].includes(
//     userRole || '',
//   );

//   const now = new Date();
//   const subscription = isUnlimitedUser
//     ? null
//     : await (async () => {
//         await Subscription.updateMany(
//           {
//             user: userId,
//             status: 'active',
//             endDate: { $lte: now },
//             isDeleted: false,
//           },
//           { $set: { status: 'expired' } },
//         );

//         return Subscription.findOne({
//           user: userId,
//           status: 'active',
//           endDate: { $gt: now },
//           isDeleted: false,
//         }).populate('package');
//       })();

//   let totalCredit: number | undefined;
//   let usedCredit: number | undefined;
//   let remainingCredit: number | undefined;
//   let freeAiImageCount: number | undefined;
//   let freeSlotReserved = false;

//   if (subscription) {
//     const pkg = subscription.package as IPackage;
//     totalCredit =
//       subscription.totalCredit !== undefined &&
//       subscription.totalCredit !== null
//         ? subscription.totalCredit
//         : pkg?.limit || 0;
//     usedCredit = subscription.usedCredit || 0;
//     remainingCredit =
//       subscription.remainingCredit !== undefined &&
//       subscription.remainingCredit !== null
//         ? subscription.remainingCredit
//         : Math.max(0, totalCredit - usedCredit);

//     if (remainingCredit <= 0) {
//       throw new AppError(
//         httpStatus.FORBIDDEN,
//         'Your subscription credit limit has been exhausted. Please renew or upgrade your plan.',
//       );
//     }
//   } else if (!isUnlimitedUser) {
//     const freeUser = await User.findOneAndUpdate(
//       {
//         _id: userId,
//         $or: [
//           { freeAiImageCount: { $lt: 2 } },
//           { freeAiImageCount: { $exists: false } },
//         ],
//       },
//       { $inc: { freeAiImageCount: 1 } },
//       { new: true, projection: { freeAiImageCount: 1 } },
//     ).lean();

//     if (!freeUser) {
//       throw new AppError(
//         httpStatus.PAYMENT_REQUIRED,
//         'You have used your 2 free AI images. Please subscribe to continue generating images.',
//       );
//     }

//     freeAiImageCount = freeUser.freeAiImageCount;
//     freeSlotReserved = true;
//   }

//   // const basePrompt =
//   //   'Edit image 1 by fitting the stainless steel grill design from image 2 into the existing window or door frame. Preserve the exact room, wall, frame geometry, perspective, and lighting from image 1. Preserve the grill pattern and proportions from image 2. Make the installation photorealistic with a natural metallic finish.';
//   const basePrompt = `
// Use image 1 as the primary/base image.

// Install the stainless steel grill design from image 2
// inside the existing window or door opening in image 1.

// IMPORTANT:
// - Preserve image 1's room exactly.
// - Preserve the wall and frame geometry.
// - Preserve the original camera angle and perspective.
// - Preserve the grill pattern and proportions from image 2.
// - Scale and perspective-fit the grill into the opening.
// - Make it look physically installed.
// - Use realistic stainless steel material.
// - Match existing lighting and shadows.
// - Keep the result photorealistic.
// - Do not modify unrelated parts of image 1.
// `;

//   const finalPrompt = data.promptInstruction
//     ? `${basePrompt}\nAdditional instruction: ${data.promptInstruction}`
//     : basePrompt;

//   let output: unknown;
//   try {
//     // output = await client.run(REPLICATE_MODEL, {
//     //   input: {
//     //     input_images: [data.userImageUrl, data.ssDesignUrl],
//     //     prompt: finalPrompt,
//     //     aspect_ratio: 'match_input_image',
//     //     resolution: '1 MP',
//     //     output_format: 'jpg',
//     //     output_quality: 80,
//     //     safety_tolerance: 2,
//     //     prompt_upsampling: false,
//     //   },
//     // });
//     output = await client.run(REPLICATE_MODEL, {
//       input: {
//         images: [
//           data.userImageUrl, // image 1 = main room/window image
//           data.ssDesignUrl, // image 2 = grill design
//         ],
//         prompt: finalPrompt,
//         aspect_ratio: 'match_input_image',

//         // Complex architectural editing হলে false better
//         turbo: false,

//         disable_safety_checker: false,
//       },
//     });
//   } catch (error) {
//     if (freeSlotReserved) {
//       await User.updateOne({ _id: userId }, { $inc: { freeAiImageCount: -1 } });
//     }
//     throw error;
//   }

//   let generatedUrl: string;
//   try {
//     generatedUrl = getOutputUrl(output);
//   } catch (error) {
//     if (freeSlotReserved) {
//       await User.updateOne({ _id: userId }, { $inc: { freeAiImageCount: -1 } });
//     }
//     throw error;
//   }

//   // Deduct credit upon successful image generation
//   if (subscription) {
//     const updatedUsedCredit = (usedCredit || 0) + 1;
//     const updatedRemainingCredit = Math.max(
//       0,
//       (totalCredit || 0) - updatedUsedCredit,
//     );

//     subscription.totalCredit = totalCredit || 0;
//     subscription.usedCredit = updatedUsedCredit;
//     subscription.remainingCredit = updatedRemainingCredit;
//     await subscription.save();

//     usedCredit = updatedUsedCredit;
//     remainingCredit = updatedRemainingCredit;
//   }

//   return {
//     generatedUrl,
//     subscriptionId: subscription?._id?.toString(),
//     totalCredit,
//     usedCredit,
//     remainingCredit,
//     freeAiImageCount,
//     freeAiImageLimit: 2,
//     unlimited: isUnlimitedUser,
//   };
// }
