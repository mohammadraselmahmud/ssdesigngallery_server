"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const productsSchema = new mongoose_1.Schema({
    productName: {
        type: String,
        required: [true, 'Product name must be required'],
    },
    productDescription: {
        type: [String],
    },
    productImage: {
        type: String,
        required: [true, 'Product image must be required'],
    },
    productPrice: {
        type: Number,
        required: [true, 'Product price must be required'],
    },
    note: { type: String, default: null },
    categoryId: {
        type: mongoose_1.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
}, {
    timestamps: true,
});
const Products = (0, mongoose_1.model)('Product', productsSchema);
exports.default = Products;
