"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = require("../modules/user/user.route");
const category_route_1 = require("../modules/category/category.route");
const products_route_1 = require("../modules/products/products.route");
const wishlist_route_1 = require("../modules/wishlist/wishlist.route");
const slider_route_1 = require("../modules/slider/slider.route");
const productFolder_route_1 = require("../modules/productFolder/productFolder.route");
const ads_route_1 = require("../modules/ads/ads.route");
const subscription_route_1 = require("../modules/subscription/subscription.route");
const payment_route_1 = require("../modules/payment/payment.route");
const package_route_1 = require("../modules/package/package.route");
const coupon_route_1 = require("../modules/coupon/coupon.route");
const adminDashboard_route_1 = require("../modules/adminDashboard/adminDashboard.route");
const ai_routes_1 = require("../modules/ai/ai.routes");
const route_1 = __importDefault(require("../modules/uploads/route"));
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/upload',
        route: route_1.default,
    },
    {
        path: '/ai',
        route: ai_routes_1.aiRoutes,
    },
    {
        path: '/users',
        route: user_route_1.userRoutes,
    },
    {
        path: '/category',
        route: category_route_1.categoryRoutes,
    },
    {
        path: '/product',
        route: products_route_1.productsRoutes,
    },
    {
        path: '/wishlist',
        route: wishlist_route_1.wishlistRoutes,
    },
    {
        path: '/slider',
        route: slider_route_1.sliderRoutes,
    },
    {
        path: '/product-folder',
        route: productFolder_route_1.productFolderRoutes,
    },
    {
        path: '/ads',
        route: ads_route_1.adsRoutes,
    },
    {
        path: '/package',
        route: package_route_1.packageRoutes,
    },
    {
        path: '/subscription',
        route: subscription_route_1.subscriptionRoutes,
    },
    {
        path: '/coupon',
        route: coupon_route_1.couponRoutes,
    },
    {
        path: '/admin-dashboard',
        route: adminDashboard_route_1.adminDashboardRoutes,
    },
    {
        path: '/payment',
        route: payment_route_1.paymentRoutes,
    },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
