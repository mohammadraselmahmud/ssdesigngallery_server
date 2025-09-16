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
exports.wishlistController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const wishlist_service_1 = require("./wishlist.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createWishlist = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body['userId'] = req.user.userId;
    const result = yield wishlist_service_1.wishlistService.createWishlist(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Wishlist created successfully',
        data: result,
    });
}));
const getAllWishlist = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wishlist_service_1.wishlistService.getAllWishlist(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All wishlist fetched successfully',
        data: result,
    });
}));
const getMyWishlist = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.query['userId'] = req.user.userId;
    const result = yield wishlist_service_1.wishlistService.getAllWishlist(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'My wishlist fetched successfully',
        data: result,
    });
}));
const getWishlistById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wishlist_service_1.wishlistService.getWishlistById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Wishlist fetched successfully',
        data: result,
    });
}));
const updateWishlist = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wishlist_service_1.wishlistService.updateWishlist(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Wishlist updated successfully',
        data: result,
    });
}));
const deleteWishlist = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wishlist_service_1.wishlistService.deleteWishlist(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Wishlist deleted successfully',
        data: result,
    });
}));
exports.wishlistController = {
    createWishlist,
    getAllWishlist,
    getWishlistById,
    updateWishlist,
    deleteWishlist,
    getMyWishlist,
};
