import { z } from 'zod';

const code = z.string().trim().min(1).transform(value => value.toUpperCase());
const baseFields = {
  code,
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  minPurchase: z.number().nonnegative().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date(),
  applicablePackages: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
};

const percentageIsValid = (data: { discountType?: string; discountValue?: number }) =>
  data.discountType !== 'percentage' || !data.discountValue || data.discountValue <= 100;

const createCouponSchema = z.object({
  body: z.object(baseFields)
    .refine(percentageIsValid, { message: 'Percentage discount cannot exceed 100', path: ['discountValue'] })
    .refine(data => !data.startsAt || data.expiresAt > data.startsAt, { message: 'Expiry must be after start date', path: ['expiresAt'] }),
});
const updateCouponSchema = z.object({
  body: z.object({
    code: code.optional(), discountType: baseFields.discountType.optional(), discountValue: baseFields.discountValue.optional(),
    minPurchase: baseFields.minPurchase, maxDiscount: baseFields.maxDiscount, usageLimit: baseFields.usageLimit,
    perUserLimit: baseFields.perUserLimit, startsAt: baseFields.startsAt, expiresAt: baseFields.expiresAt.optional(),
    applicablePackages: baseFields.applicablePackages, isActive: baseFields.isActive,
  }).refine(percentageIsValid, { message: 'Percentage discount cannot exceed 100', path: ['discountValue'] }),
});
const validateCouponSchema = z.object({ body: z.object({ code, packageId: z.string().min(1) }) });

export const couponValidation = { createCouponSchema, updateCouponSchema, validateCouponSchema };
