"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productFolderRoutes = void 0;
const express_1 = require("express");
const productFolder_controller_1 = require("./productFolder.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const router = (0, express_1.Router)();
router.post('/create-folder', (0, auth_1.default)(user_constants_1.USER_ROLE.user, user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.sub_admin, user_constants_1.USER_ROLE.super_admin), productFolder_controller_1.productFolderController.createProductFolder);
router.get('/user/folders', (0, auth_1.default)(user_constants_1.USER_ROLE.user, user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.sub_admin, user_constants_1.USER_ROLE.super_admin), productFolder_controller_1.productFolderController.getMyProductFolder);
router.get('/folders/:folderId', (0, auth_1.default)(user_constants_1.USER_ROLE.user, user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.sub_admin, user_constants_1.USER_ROLE.super_admin), productFolder_controller_1.productFolderController.getProductFolderById);
router.put('/folders/:folderId', (0, auth_1.default)(user_constants_1.USER_ROLE.user, user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.sub_admin, user_constants_1.USER_ROLE.super_admin), productFolder_controller_1.productFolderController.updateProductFolder);
router.put('/folders/:folderId/products/:productId', (0, auth_1.default)(user_constants_1.USER_ROLE.user, user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.sub_admin, user_constants_1.USER_ROLE.super_admin), productFolder_controller_1.productFolderController.updateNote);
router.delete('/folders/:folderId/products/:productId', (0, auth_1.default)(user_constants_1.USER_ROLE.user, user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.sub_admin, user_constants_1.USER_ROLE.super_admin), productFolder_controller_1.productFolderController.deleteProductFromFolder);
router.delete('/folders/:folderId', (0, auth_1.default)(user_constants_1.USER_ROLE.user, user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.sub_admin, user_constants_1.USER_ROLE.super_admin), productFolder_controller_1.productFolderController.deleteProductFolder);
exports.productFolderRoutes = router;
