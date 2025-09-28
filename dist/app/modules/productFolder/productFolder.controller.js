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
exports.productFolderController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const productFolder_service_1 = require("./productFolder.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createProductFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body['userId'] = req.user.userId;
    const result = yield productFolder_service_1.productFolderService.createProductFolder(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'ProductFolder created successfully',
        data: result,
    });
}));
const getAllProductFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield productFolder_service_1.productFolderService.getAllProductFolder(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All productFolder fetched successfully',
        data: result,
    });
}));
const getMyProductFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.query['userId'] = req.user.userId;
    const result = yield productFolder_service_1.productFolderService.getAllProductFolder(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All productFolder fetched successfully',
        data: result,
    });
}));
const getProductFolderById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield productFolder_service_1.productFolderService.getProductFolderById(req.params.folderId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'ProductFolder fetched successfully',
        data: result,
    });
}));
const updateProductFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield productFolder_service_1.productFolderService.updateProductFolder(req.params.folderId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'ProductFolder updated successfully',
        data: result,
    });
}));
const updateNote = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield productFolder_service_1.productFolderService.updateNote(req.params, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Product note update successfully',
        data: result,
    });
}));
const deleteProductFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield productFolder_service_1.productFolderService.deleteProductFolder(req.params.folderId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'ProductFolder deleted successfully',
        data: result,
    });
}));
const deleteProductFromFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield productFolder_service_1.productFolderService.deleteProductFromFolder(req.params);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'ProductFolder deleted successfully',
        data: result,
    });
}));
exports.productFolderController = {
    createProductFolder,
    getAllProductFolder,
    getProductFolderById,
    updateProductFolder,
    deleteProductFolder,
    deleteProductFromFolder,
    updateNote,
    getMyProductFolder,
};
