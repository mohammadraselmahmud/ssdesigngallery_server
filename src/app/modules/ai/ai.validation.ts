import { z } from 'zod';
import config from '../../config';

const getHostname = (value?: string): string | undefined => {
  if (!value) return undefined;

  try {
    return new URL(value).hostname;
  } catch {
    return undefined;
  }
};

const allowedImageHosts = [
  getHostname(config.aws.s3BaseUrl),
  getHostname(config.aws.img_base_url),
].filter((host): host is string => Boolean(host));

const imageUrlSchema = z
  .string({ required_error: 'Image URL is required' })
  .url('Image URL must be valid')
  .refine(value => new URL(value).protocol === 'https:', {
    message: 'Image URL must use HTTPS',
  })
  .refine(value => allowedImageHosts.includes(new URL(value).hostname), {
    message: 'Image URL must be a direct URL from the configured S3 image host',
  });

const generatePreviewSchema = z.object({
  body: z.object({
    userImageUrl: imageUrlSchema,
    ssDesignUrl: imageUrlSchema,
    promptInstruction: z.string().trim().max(1000).optional(),
  }),
});

export const aiValidation = {
  generatePreviewSchema,
};
