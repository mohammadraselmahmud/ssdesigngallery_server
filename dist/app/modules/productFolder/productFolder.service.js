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
exports.productFolderService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const productFolder_models_1 = __importDefault(require("./productFolder.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("../user/user.models");
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const createProductFolder = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { folderName, productId, note } = payload;
    let user = yield user_models_1.User.findById(payload.userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const isExist = yield productFolder_models_1.default.findOne({
        folderName: payload.folderName,
        userId: user === null || user === void 0 ? void 0 : user._id,
    });
    if (isExist) {
        const productExists = isExist.products.some(p => p.productId.toString() === payload.productId);
        if (!productExists) {
            isExist.products.push({ productId, note });
            yield isExist.save();
        }
        return isExist;
    }
    const result = yield productFolder_models_1.default.create({
        folderName,
        userId: user._id,
        products: [{ productId, note }],
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create productFolder');
    }
    return result;
});
const getAllProductFolder = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const productFolderModel = new QueryBuilder_1.default(productFolder_models_1.default.find({}).populate('products.productId'), query)
        .search([''])
        .filter()
        .sort()
        .fields();
    const data = yield productFolderModel.modelQuery;
    return data;
});
const getProductFolderById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield productFolder_models_1.default.findById(id);
    if (!result) {
        throw new Error('ProductFolder not found!');
    }
    return result;
});
const updateProductFolder = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield productFolder_models_1.default.findByIdAndUpdate(id, payload, {
        new: true,
    });
    if (!result) {
        throw new Error('Failed to update ProductFolder');
    }
    return result;
});
const updateNote = (params, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { folderId, productId } = params;
    const { note } = payload;
    if (!note) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Note must be provided');
    }
    const result = yield productFolder_models_1.default.findOneAndUpdate({
        _id: folderId,
        'products.productId': productId,
    }, {
        $set: {
            'products.$.note': note,
        },
    }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Folder or product not found');
    }
});
const deleteProductFolder = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield productFolder_models_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete productFolder');
    }
    return result;
});
const deleteProductFromFolder = (params) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { folderId, productId } = params;
    console.log(params);
    const folder = yield productFolder_models_1.default.findOneAndUpdate({ _id: folderId, 'products.productId': productId }, { $pull: { products: { productId } } }, { new: true });
    if (!folder) {
        new AppError_1.default(404, 'Folder or product not found');
    }
    if (((_a = folder === null || folder === void 0 ? void 0 : folder.products) === null || _a === void 0 ? void 0 : _a.length) === 0) {
        const result = yield (productFolder_models_1.default === null || productFolder_models_1.default === void 0 ? void 0 : productFolder_models_1.default.findByIdAndDelete(folder === null || folder === void 0 ? void 0 : folder._id));
    }
    return folder;
});
exports.productFolderService = {
    createProductFolder,
    getAllProductFolder,
    getProductFolderById,
    updateProductFolder,
    deleteProductFolder,
    updateNote,
    deleteProductFromFolder,
};
