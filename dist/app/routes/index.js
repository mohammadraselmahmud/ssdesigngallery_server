"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = require("../modules/user/user.route");
const category_route_1 = require("../modules/category/category.route");
const products_route_1 = require("../modules/products/products.route");
const wishlist_route_1 = require("../modules/wishlist/wishlist.route");
const slider_route_1 = require("../modules/slider/slider.route");
const productFolder_route_1 = require("../modules/productFolder/productFolder.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
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
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
