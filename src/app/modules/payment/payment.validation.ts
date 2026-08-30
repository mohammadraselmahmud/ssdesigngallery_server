import { z } from 'zod';

const googlePayVerifySchema = z.object({
  body: z.object({
    packageId: z.string().optional(),
    package: z.string().optional(),
    productId: z.string().optional(),
    subscriptionId: z.string().optional(),
    orderId: z.string().optional(),
    tranId: z.string().optional(),
    purchaseToken: z.string().optional(),
    token: z.string().optional(),
    amount: z.number().optional(),
    currency: z.string().optional(),
    couponCode: z.string().trim().optional(),
    userId: z.string().optional(),
    paymentData: z.record(z.any()).optional(),
  }),
});

export const paymentValidation = {
  googlePayVerifySchema,
};
