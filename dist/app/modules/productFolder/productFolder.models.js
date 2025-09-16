"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    note: {
        type: String,
        required: true,
    },
});
const productFolderSchema = new mongoose_1.Schema({
    folderName: {
        type: String,
        required: true,
    },
    products: [ProductSchema],
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
const ProductFolder = (0, mongoose_1.model)('ProductFolder', productFolderSchema);
exports.default = ProductFolder;
