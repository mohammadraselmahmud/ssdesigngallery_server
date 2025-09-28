"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const wishlist_models_1 = __importDefault(require("./wishlist.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const createWishlist = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield wishlist_models_1.default.findOne({
        userId: payload === null || payload === void 0 ? void 0 : payload.userId,
        productId: payload.productId,
    });
    if (isExist) {
        const result = yield wishlist_models_1.default.findByIdAndDelete(isExist._id);
        if (!result)
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Wish list remove success!');
        return;
    }
    const result = yield wishlist_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create wishlist');
    }
    return result;
});
const getAllWishlist = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const wishlistModel = new QueryBuilder_1.default(wishlist_models_1.default.find().populate([{ path: 'productId' }]), query)
        .search([''])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield wishlistModel.modelQuery;
    const meta = yield wishlistModel.countTotal();
    return {
        data,
        meta,
    };
});
const getWishlistById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wishlist_models_1.default.findById(id).populate([{ path: 'productId' }]);
    if (!result) {
        throw new Error('Wishlist not found!');
    }
    return result;
});
const updateWishlist = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wishlist_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new Error('Failed to update Wishlist');
    }
    return result;
});
const deleteWishlist = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wishlist_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete wishlist');
    }
    return result;
});
exports.wishlistService = {
    createWishlist,
    getAllWishlist,
    getWishlistById,
    updateWishlist,
    deleteWishlist,
};
