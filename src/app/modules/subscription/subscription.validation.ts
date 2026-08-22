import { z } from 'zod';

const createSubscriptionSchema = z.object({
  body: z.object({ package: z.string().min(1), couponCode: z.string().trim().min(1).optional() }),
});
export const subscriptionValidation = { createSubscriptionSchema };
