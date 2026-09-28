import { z } from 'zod';
import config from '../../config';

export const getAllowedImageHosts = (): string[] => {
  const configuredUrls = [
    config.aws.img_base_url,
    config.aws.s3BaseUrl,
    config.aws.s3_api,
    process.env.IMG_BASE_URL,
    process.env.S3_BASE_URL,
    process.env.S3_API,
  ];

  const hosts = new Set<string>();

  for (const urlStr of configuredUrls) {
    if (!urlStr) continue;
    try {
      const url = new URL(
        urlStr.startsWith('http://') || urlStr.startsWith('https://')
          ? urlStr
          : `https://${urlStr}`,
      );
      if (url.hostname) {
        hosts.add(url.hostname.toLowerCase());
      }
    } catch {
      // ignore invalid URLs in env
    }
  }

  if (config.aws.bucket) {
    if (config.aws.region) {
      hosts.add(
        `${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com`.toLowerCase(),
      );
      hosts.add(`s3.${config.aws.region}.amazonaws.com`.toLowerCase());
    }
    hosts.add(`${config.aws.bucket}.s3.amazonaws.com`.toLowerCase());
  }

  return Array.from(hosts);
};

const imageUrlSchema = z
  .string({ required_error: 'Image URL is required' })
  .url({ message: 'Image URL must be valid' })
  .refine(
    value => {
      try {
        return new URL(value).protocol === 'https:';
      } catch {
        return false;
      }
    },
    {
      message: 'Image URL must use HTTPS',
    },
  )
  .refine(
    value => {
      try {
        const hostname = new URL(value).hostname.toLowerCase();
        return getAllowedImageHosts().includes(hostname);
      } catch {
        return false;
      }
    },
    {
      message:
        'Image URL must be a direct URL from the configured S3 image host',
    },
  );

const generatePreviewSchema = z.object({
  body: z.object({
    userImageUrl: imageUrlSchema,
    ssDesignUrl: imageUrlSchema,
    category: z
      .string({ required_error: 'SS design category is required' })
      .trim()
      .min(1, { message: 'SS design category is required' })
      .max(100),
    promptInstruction: z.string().trim().max(1000).optional(),
  }),
});

const cardText = z.string().trim().min(1).max(300);

const generateVisitingCardSchema = z.object({
  body: z
    .object({
      demoImageUrl: imageUrlSchema,
      information: z
        .object({
          name: cardText,
          designation: cardText.optional(),
          companyName: cardText.optional(),
          phone: cardText.optional(),
          email: z.string().trim().email().max(254).optional(),
          website: cardText.optional(),
          address: z.string().trim().min(1).max(600).optional(),
          tagline: cardText.optional(),
          additionalDetails: z.string().trim().min(1).max(1500).optional(),
        })
        .strict(),
      promptInstruction: z.string().trim().max(1000).optional(),
    })
    .strict(),
});

export type GenerateVisitingCardInput = z.infer<
  typeof generateVisitingCardSchema
>['body'];

export const aiValidation = {
  generateVisitingCardSchema,
  generatePreviewSchema,
  getAllowedImageHosts,
};
