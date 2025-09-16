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
exports.sliderService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const slider_models_1 = __importDefault(require("./slider.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const createSlider = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield slider_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create slider');
    }
    return result;
});
const getAllSlider = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const sliderModel = new QueryBuilder_1.default(slider_models_1.default.find(), query)
        .search([''])
        .filter()
        .sort()
        .fields();
    const data = yield sliderModel.modelQuery;
    const meta = yield sliderModel.countTotal();
    return {
        data,
        meta,
    };
});
const getSliderById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield slider_models_1.default.findById(id);
    if (!result) {
        throw new Error('Slider not found!');
    }
    return result;
});
const updateSlider = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield slider_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new Error('Failed to update Slider');
    }
    return result;
});
const deleteSlider = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield slider_models_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete slider');
    }
    return result;
});
exports.sliderService = {
    createSlider,
    getAllSlider,
    getSliderById,
    updateSlider,
    deleteSlider,
};
