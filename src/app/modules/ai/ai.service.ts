import Replicate from 'replicate';
import { GeneratePreviewInput } from './ai.interface';
import config from '../../config';

const replicate = new Replicate({
  auth: config?.replicate_api_key,
});
const REPLICATE_MODEL = 'black-forest-labs/flux-2-pro';

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
): Promise<string> {
  if (!config.replicate_api_key) {
    throw new Error('REPLICATE_API_TOKEN is not configured.');
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

  return getOutputUrl(output);
}
