import Replicate from 'replicate';
import { GeneratePreviewInput } from './ai.interface';
import config from '../../config';
import Subscription from '../subscription/subscription.models';
import { IPackage } from '../package/package.interface';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

const replicate = new Replicate({
  auth: config?.replicate_api_key,
});
const REPLICATE_MODEL = 'black-forest-labs/flux-2-pro';

export interface GeneratePreviewResponse {
  generatedUrl: string;
  subscriptionId?: string;
  totalCredit: number;
  usedCredit: number;
  remainingCredit: number;
}

const getOutputUrl = (output: unknown): string => {
  const value = Array.isArray(output) ? output[0] : output;

  if (typeof value === 'string') {
    return value;
  }

  if (
    value &&
    typeof value === 'object' &&
    'url' in value &&
    typeof value.url === 'function'
  ) {
    return String(value.url());
  }

  throw new Error('AI model did not return an image URL.');
};

export async function generateSSPreview(
  data: GeneratePreviewInput,
  userId?: string,
): Promise<GeneratePreviewResponse> {
  if (!config.replicate_api_key) {
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

  const now = new Date();
  await Subscription.updateMany(
    {
      user: userId,
      status: 'active',
      endDate: { $lte: now },
      isDeleted: false,
    },
    { $set: { status: 'expired' } },
  );

  const subscription = await Subscription.findOne({
    user: userId,
    status: 'active',
    endDate: { $gt: now },
    isDeleted: false,
  }).populate('package');

  if (!subscription) {
    throw new AppError(
      httpStatus.PAYMENT_REQUIRED,
      'Active subscription required to generate AI images. Please subscribe to a package.',
    );
  }

  const pkg = subscription.package as IPackage;
  const totalCredit =
    subscription.totalCredit !== undefined && subscription.totalCredit !== null
      ? subscription.totalCredit
      : pkg?.limit || 0;
  const usedCredit = subscription.usedCredit || 0;
  const remainingCredit =
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

  const basePrompt =
    'Edit image 1 by fitting the stainless steel grill design from image 2 into the existing window or door frame. Preserve the exact room, wall, frame geometry, perspective, and lighting from image 1. Preserve the grill pattern and proportions from image 2. Make the installation photorealistic with a natural metallic finish.';

  const finalPrompt = data.promptInstruction
    ? `${basePrompt}, ${data.promptInstruction}`
    : basePrompt;

  const output: unknown = await replicate.run(REPLICATE_MODEL, {
    input: {
      input_images: [data.userImageUrl, data.ssDesignUrl],
      prompt: finalPrompt,
      aspect_ratio: 'match_input_image',
      resolution: '1 MP',
      output_format: 'jpg',
      output_quality: 80,
      safety_tolerance: 2,
      prompt_upsampling: false,
    },
  });

  const generatedUrl = getOutputUrl(output);

  // Deduct credit upon successful image generation
  const updatedUsedCredit = usedCredit + 1;
  const updatedRemainingCredit = Math.max(0, totalCredit - updatedUsedCredit);

  subscription.totalCredit = totalCredit;
  subscription.usedCredit = updatedUsedCredit;
  subscription.remainingCredit = updatedRemainingCredit;
  await subscription.save();

  return {
    generatedUrl,
    subscriptionId: subscription._id?.toString(),
    totalCredit,
    usedCredit: updatedUsedCredit,
    remainingCredit: updatedRemainingCredit,
  };
}
