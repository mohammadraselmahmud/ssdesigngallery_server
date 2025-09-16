"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../error/AppError"));
const fileUpload = (uploadDirectory) => {
    if (!fs_1.default.existsSync(uploadDirectory)) {
        fs_1.default.mkdirSync(uploadDirectory, { recursive: true });
    }
    const storage = multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDirectory);
        },
        filename: function (req, file, cb) {
            const parts = file.originalname.split('.');
            const extension = parts.length > 1 ? '.' + parts.pop() : '';
            const baseName = parts.join('.').replace(/\s+/g, '_');
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${baseName}-${uniqueSuffix}${extension}`);
        },
    });
    const upload = (0, multer_1.default)({
        storage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: function (req, file, cb) {
            const allowedMimeTypes = [
                'image/png',
                'image/jpg',
                'image/jpeg',
                'image/svg+xml',
                'image/webp',
            ];
            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Only png, jpg, jpeg, svg, webp formats are allowed.'));
            }
        },
    });
    return upload;
};
exports.default = fileUpload;
