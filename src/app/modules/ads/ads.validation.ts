import { z } from 'zod';

const createAdsSchema = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional(),
    image: z.union([z.string(), z.array(z.string())]).optional(),
    video: z.union([z.string(), z.array(z.string())]).optional(),
    link: z.string().optional(),
    isActive: z.boolean().optional(),
    expiredAt: z.union([z.string(), z.date(), z.null()]).optional(),
  }),
});

const updateAdsSchema = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }).optional(),
    description: z.string().optional(),
    image: z.union([z.string(), z.array(z.string())]).optional(),
    video: z.union([z.string(), z.array(z.string())]).optional(),
    link: z.string().optional(),
    isActive: z.boolean().optional(),
    expiredAt: z.union([z.string(), z.date(), z.null()]).optional(),
  }),
});

export const adsValidation = {
  createAdsSchema,
  updateAdsSchema,
};
