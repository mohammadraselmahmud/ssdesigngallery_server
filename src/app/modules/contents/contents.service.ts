import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { Contents } from './contents.models';

export const getContents = async () => {
  const contents = await Contents.findById('global').lean();
  return { isAiGenerationEnabled: contents?.isAiGenerationEnabled ?? false };
};

export const toggleAiGeneration = async (isAiGenerationEnabled: boolean) => {
  const contents = await Contents.findByIdAndUpdate(
    'global',
    { $set: { isAiGenerationEnabled } },
    { new: true, upsert: true, runValidators: true },
  ).lean();
  return { isAiGenerationEnabled: contents!.isAiGenerationEnabled };
};

export const assertAiGenerationEnabled = async () => {
  const contents = await getContents();
  if (!contents.isAiGenerationEnabled) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'AI image generation is currently disabled by the administrator.',
    );
  }
};
