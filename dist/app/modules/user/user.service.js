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
exports.userService = void 0;
const fs_1 = __importDefault(require("fs"));
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("./user.models");
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const user_utils_1 = require("./user.utils");
const path_1 = __importDefault(require("path"));
const mailSender_1 = require("../../utils/mailSender");
const subscription_service_1 = require("../subscription/subscription.service");
const login = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield user_models_1.User.isUserExist(payload === null || payload === void 0 ? void 0 : payload.email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user === null || user === void 0 ? void 0 : user.registerWithGoogle) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'this user registered with Google not manually');
    }
    if (!(yield user_models_1.User.isPasswordMatched(payload.password, user.password))) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password does not match');
    }
    const jwtPayload = {
        userId: (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString(),
        role: user === null || user === void 0 ? void 0 : user.role,
    };
    const accessToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        user,
        accessToken,
        refreshToken,
    };
});
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_models_1.User.isUserExist(payload.email);
    if (isExist) {
        throw new AppError_1.default(http_status_1.default.BAD_GATEWAY, 'User already exists! Please login');
    }
    const user = yield user_models_1.User.create(payload);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User creation failed');
    }
    return user;
});
const signInWithGoogle = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = yield user_models_1.User.isUserExist(payload.email);
    if (!user) {
        const userData = {
            email: payload.email,
            name: payload.name,
            emailVerified: true,
            registerWithGoogle: true,
        };
        const user = yield user_models_1.User.create(userData);
        if (!user) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'user register failed!');
        }
        const jwtPayload = {
            userId: (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString(),
            role: user === null || user === void 0 ? void 0 : user.role,
        };
        const accessToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
        const refreshToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
        return {
            user,
            accessToken,
            refreshToken,
        };
    }
    if (!(user === null || user === void 0 ? void 0 : user.registerWithGoogle)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'this user register with email and password.');
    }
    const jwtPayload = {
        userId: (_b = user === null || user === void 0 ? void 0 : user._id) === null || _b === void 0 ? void 0 : _b.toString(),
        role: user === null || user === void 0 ? void 0 : user.role,
    };
    const accessToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        user,
        accessToken,
        refreshToken,
    };
});
const forgotPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.isUserExist(payload === null || payload === void 0 ? void 0 : payload.email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'user not found!');
    }
    const oneTimeCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const result = yield user_models_1.User.findByIdAndUpdate(user === null || user === void 0 ? void 0 : user._id, { oneTimeCode }, { new: true });
    const otpEmailPath = path_1.default.join(__dirname, '../../../../public/view/otp_mail.html');
    yield (0, mailSender_1.sendEmail)(user === null || user === void 0 ? void 0 : user.email, 'Your reset password OTP is', fs_1.default
        .readFileSync(otpEmailPath, 'utf8')
        .replace('{{otp}}', oneTimeCode.toString())
        .replace('{{email}}', user === null || user === void 0 ? void 0 : user.email));
    return user;
});
const verifyOtp = (query, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const requestType = !query.requestType ? 'resetPassword' : query.requestType;
    const user = yield user_models_1.User.isUserExist(payload === null || payload === void 0 ? void 0 : payload.email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user.oneTimeCode !== (payload === null || payload === void 0 ? void 0 : payload.oneTimeCode)) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invalid OTP code');
    }
    const data = {};
    if (requestType === 'resetPassword') {
        data['oneTimeCode'] = 'verified';
    }
    else if (requestType === 'verifyEmail' &&
        user.oneTimeCode !== null &&
        user.emailVerified === false) {
        data['emailVerified '] = true;
        data['oneTimeCode'] = null;
    }
    const result = yield user_models_1.User.findByIdAndUpdate(user === null || user === void 0 ? void 0 : user._id, data, { new: true });
    return result;
});
const updatePassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let user;
    if (payload === null || payload === void 0 ? void 0 : payload.userId) {
        user = yield user_models_1.User.findById(payload === null || payload === void 0 ? void 0 : payload.userId);
    }
    else {
        user = yield user_models_1.User.isUserExist(payload === null || payload === void 0 ? void 0 : payload.email);
    }
    console.log(user);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user.oneTimeCode !== 'verified') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Something went wrong, try forget password again');
    }
    const hashedPassword = yield bcrypt_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.password, Number(config_1.default.bcrypt_salt_rounds));
    const result = yield user_models_1.User.findByIdAndUpdate(user === null || user === void 0 ? void 0 : user._id, {
        password: hashedPassword,
        oneTimeCode: null,
    }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password Update Failed!');
    }
    return result;
});
const changePassword = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (!(yield user_models_1.User.isPasswordMatched(payload === null || payload === void 0 ? void 0 : payload.oldPassword, user.password))) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Old password does not match');
    }
    if ((payload === null || payload === void 0 ? void 0 : payload.newPassword) !== (payload === null || payload === void 0 ? void 0 : payload.confirmPassword)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'New password and confirm password do not match');
    }
    const hashedPassword = yield bcrypt_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.confirmPassword, Number(config_1.default.bcrypt_salt_rounds));
    const result = yield user_models_1.User.findByIdAndUpdate(user === null || user === void 0 ? void 0 : user._id, {
        password: hashedPassword,
        oneTimeCode: null,
    }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password Update Failed!');
    }
    return result;
});
const updateUser = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.findByIdAndUpdate(id, payload, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User updating failed');
    }
    return user;
});
// const geUserById = async (id: string) => {
//   const result = await User.findById(id);
//   const subscription = await subscriptionService?.getCurrentPlan(id);
//   if (!result) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   return { ...result?.toObject(), subscription: subscription };
// };
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [user, subscription] = yield Promise.all([
        user_models_1.User.findById(id).lean(),
        subscription_service_1.subscriptionService.getCurrentPlan(id),
    ]);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return Object.assign(Object.assign({}, user), { subscription: subscription !== null && subscription !== void 0 ? subscription : {} });
});
//
const getAllUser = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const userModel = new QueryBuilder_1.default(user_models_1.User.find(), query)
        .search(['name', 'email', 'phoneNumber', 'status'])
        .filter()
        .paginate()
        .sort();
    const data = yield userModel.modelQuery;
    const meta = yield userModel.countTotal();
    return {
        data,
        meta,
    };
});
// const deleteUser = async (id: string) => {
//   const user = await User.findByIdAndUpdate(
//     id,
//     { isDeleted: true },
//     { new: true },
//   );
//   if (!user) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
//   }
//   return user;
// };
exports.userService = {
    createUser,
    login,
    forgotPassword,
    verifyOtp,
    updatePassword,
    updateUser,
    getUserById,
    changePassword,
    getAllUser,
    signInWithGoogle,
    // deleteUser,
};
