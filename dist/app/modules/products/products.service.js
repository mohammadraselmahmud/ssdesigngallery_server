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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
const pickQuery_1 = __importDefault(require("../../utils/pickQuery"));
const mongoose_1 = require("mongoose");
const pagination_helpers_1 = require("../../helpers/pagination.helpers");
const createProducts = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create products');
    }
    return result;
});
const getAllProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const productsModel = new QueryBuilder_1.default(products_models_1.default.find({ isDeleted: false }), query)
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
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
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
    const result = yield products_models_1.default.findByIdAndUpdate(id, { isDeleted: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete products');
    }
    return result;
});
const findKeywords = () => __awaiter(void 0, void 0, void 0, function* () {
    const uniqueKeywords = yield products_models_1.default.aggregate([
        {
            $match: {
                isDeleted: false,
            },
        },
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
const findRelatedProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { filters, pagination } = yield (0, pickQuery_1.default)(query);
    const { productDescription, searchTerm } = filters, filtersData = __rest(filters, ["productDescription", "searchTerm"]);
    const pipeline = [];
    if (filtersData === null || filtersData === void 0 ? void 0 : filtersData.categoryId) {
        filtersData['categoryId'] = new mongoose_1.Types.ObjectId(filtersData === null || filtersData === void 0 ? void 0 : filtersData.categoryId);
    }
    if (productDescription) {
        const keywords = productDescription
            .split(',')
            .map((keyword) => keyword.trim())
            .filter(Boolean);
        pipeline.push({
            $match: {
                productDescription: { $in: keywords },
            },
        });
        pipeline.push({
            $addFields: {
                matchCount: {
                    $size: {
                        $setIntersection: ['$productDescription', keywords],
                    },
                },
                randomScore: { $rand: {} },
            },
        });
    }
    if (searchTerm) {
        pipeline.push({
            $match: {
                $or: ['productName', 'productDescription'].map(field => ({
                    [field]: {
                        $regex: searchTerm,
                        $options: 'i',
                    },
                })),
            },
        });
    }
    if (Object.entries(filtersData).length) {
        // Add custom filters (filtersData) to the aggregation pipeline
        Object.entries(filtersData).map(([field, value]) => {
            if (/^\[.*?\]$/.test(value)) {
                const match = value.match(/\[(.*?)\]/);
                const queryValue = match ? match[1] : value;
                pipeline.push({
                    $match: {
                        [field]: { $in: [new mongoose_1.Types.ObjectId(queryValue)] },
                    },
                });
                delete filtersData[field];
            }
        });
        if (Object.entries(filtersData).length) {
            pipeline.push({
                $match: {
                    $and: Object.entries(filtersData).map(([field, value]) => ({
                        isDeleted: false,
                        [field]: value,
                    })),
                },
            });
        }
    }
    // Sorting condition
    const { page, limit, skip, sortBy: sort, } = pagination_helpers_1.paginationHelper.calculatePagination(pagination);
    if (sort) {
        const sortArray = sort.split(',').map(field => {
            const trimmedField = field.trim();
            if (trimmedField.startsWith('-')) {
                return { [trimmedField.slice(1)]: -1 };
            }
            return { [trimmedField]: 1 };
        });
        pipeline.push({
            $sort: productDescription
                ? Object.assign({ matchCount: -1, randomScore: 1 }, ...sortArray)
                : Object.assign({}, ...sortArray),
        });
    }
    else if (productDescription) {
        pipeline.push({ $sort: { matchCount: -1, randomScore: 1 } });
    }
    pipeline.push({
        $facet: {
            totalData: [{ $count: 'total' }],
            paginatedData: [
                { $skip: skip },
                { $limit: limit },
                // Lookups
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'category',
                    },
                },
                {
                    $addFields: {
                        category: { $arrayElemAt: ['$category', 0] },
                    },
                },
            ],
        },
    });
    const [result] = yield products_models_1.default.aggregate(pipeline);
    const total = ((_b = (_a = result === null || result === void 0 ? void 0 : result.totalData) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
    const data = (result === null || result === void 0 ? void 0 : result.paginatedData) || [];
    return {
        meta: { page, limit, total },
        data,
    };
});
exports.productsService = {
    createProducts,
    getAllProducts,
    getProductsById,
    updateProducts,
    deleteProducts,
    findKeywords,
    findRelatedProducts,
};
