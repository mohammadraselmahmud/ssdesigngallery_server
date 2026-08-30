"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistRoutes = void 0;
const express_1 = require("express");
const wishlist_controller_1 = require("./wishlist.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const router = (0, express_1.Router)();
router.post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.user, user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.sub_admin, user_constants_1.USER_ROLE.super_admin), wishlist_controller_1.wishlistController.createWishlist);
router.post('/remove', (0, auth_1.default)(user_constants_1.USER_ROLE.user, user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.sub_admin, user_constants_1.USER_ROLE.super_admin), wishlist_controller_1.wishlistController.createWishlist);
router.patch('/:id', wishlist_controller_1.wishlistController.updateWishlist);
router.delete('/:id', wishlist_controller_1.wishlistController.deleteWishlist);
router.get('/wishlist', (0, auth_1.default)(user_constants_1.USER_ROLE.user, user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.sub_admin, user_constants_1.USER_ROLE.super_admin), wishlist_controller_1.wishlistController.getMyWishlist);
router.get('/:id', wishlist_controller_1.wishlistController.getWishlistById);
router.get('/', wishlist_controller_1.wishlistController.getAllWishlist);
exports.wishlistRoutes = router;
