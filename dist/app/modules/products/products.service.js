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
exports.productsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const products_models_1 = __importDefault(require("./products.models"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const createProducts = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create products');
    }
    return result;
});
const getAllProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const productsModel = new QueryBuilder_1.default(products_models_1.default.find({}), query)
        .search(['productName', 'productDescription'])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield productsModel.modelQuery;
    const meta = yield productsModel.countTotal();
    return { data, meta };
});
const getProductsById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_models_1.default.findById(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Products not found!');
    }
    return result;
});
const updateProducts = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Failed to update Products');
    }
    return result;
});
const deleteProducts = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_models_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete products');
    }
    return result;
});
const findKeywords = () => __awaiter(void 0, void 0, void 0, function* () {
    const uniqueKeywords = yield products_models_1.default.aggregate([
        { $unwind: '$productDescription' },
        {
            $group: {
                _id: '$productDescription',
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                keyword: '$_id',
                count: 1,
                _id: 0,
            },
        },
        // Sort by keyword alphabetically
        { $sort: { count: -1 } },
    ]);
    return uniqueKeywords;
});
exports.productsService = {
    createProducts,
    getAllProducts,
    getProductsById,
    updateProducts,
    deleteProducts,
    findKeywords,
};
