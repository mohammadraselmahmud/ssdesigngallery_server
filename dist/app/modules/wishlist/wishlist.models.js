"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const wishlistSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productId: {
        type: mongoose_1.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
}, {
    timestamps: true,
});
const Wishlist = (0, mongoose_1.model)('Wishlist', wishlistSchema);
exports.default = Wishlist;
