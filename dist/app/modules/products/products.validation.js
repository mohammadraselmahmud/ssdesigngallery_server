"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productValidation = void 0;
const zod_1 = require("zod");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const createProductSchema = zod_1.z.object({
    images: zod_1.z
        .array(zod_1.z.object({
        key: zod_1.z.string().min(1, { message: 'Image key is required' }),
        url: zod_1.z
            .string()
            .url({ message: 'Invalid URL format' })
            .min(1, { message: 'Image URL is required' }),
    }))
        .min(1, { message: 'At least one image is required' }),
    name: zod_1.z.string().min(1, { message: 'Product name is required' }),
    details: zod_1.z.string().min(1, { message: 'Product details are required' }),
    category: zod_1.z.string().min(1, { message: 'Category is required' }),
    price: zod_1.z.number().min(0, { message: 'Price must be a positive number' }),
    quantity: zod_1.z.string().min(1, { message: 'Quantity is required' }),
    expiredAt: zod_1.z.string().min(1, { message: 'Expiry date is required' }),
    discount: zod_1.z.number().optional(),
    isDeleted: zod_1.z.boolean().default(false),
});
const updateProductSchema = createProductSchema.deepPartial(); // Allow partial updates
exports.productValidation = {
    createProductSchema,
    updateProductSchema,
};
