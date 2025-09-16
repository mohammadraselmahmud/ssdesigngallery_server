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
exports.sliderController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const slider_service_1 = require("./slider.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const s3_1 = require("../../utils/s3");
const createSlider = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        req.body.sliderImage = yield (0, s3_1.uploadToS3)({
            file: req.file,
            fileName: `images/products/${Math.floor(100000 + Math.random() * 900000)}`,
        });
    }
    const result = yield slider_service_1.sliderService.createSlider(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Slider created successfully',
        data: result,
    });
}));
const getAllSlider = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield slider_service_1.sliderService.getAllSlider(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All slider fetched successfully',
        data: result,
    });
}));
const getSliderById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield slider_service_1.sliderService.getSliderById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Slider fetched successfully',
        data: result,
    });
}));
const updateSlider = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        req.body.sliderImage = yield (0, s3_1.uploadToS3)({
            file: req.file,
            fileName: `images/products/${Math.floor(100000 + Math.random() * 900000)}`,
        });
    }
    const result = yield slider_service_1.sliderService.updateSlider(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Slider updated successfully',
        data: result,
    });
}));
const deleteSlider = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield slider_service_1.sliderService.deleteSlider(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Slider deleted successfully',
        data: result,
    });
}));
exports.sliderController = {
    createSlider,
    getAllSlider,
    getSliderById,
    updateSlider,
    deleteSlider,
};
