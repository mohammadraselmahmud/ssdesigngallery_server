"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = __importDefault(require("../config"));
exports.s3Client = new client_s3_1.S3Client({
    region: "auto",
    endpoint: (_a = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.aws) === null || _a === void 0 ? void 0 : _a.s3_api,
    credentials: {
        accessKeyId: `${(_b = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.aws) === null || _b === void 0 ? void 0 : _b.accessKeyId}`,
        secretAccessKey: `${(_c = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.aws) === null || _c === void 0 ? void 0 : _c.secretAccessKey}`,
    },
    forcePathStyle: true,
});
