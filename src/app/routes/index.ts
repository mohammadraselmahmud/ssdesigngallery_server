import { Router } from 'express';
import { userRoutes } from '../modules/user/user.route';
import { categoryRoutes } from '../modules/category/category.route';
import { productsRoutes } from '../modules/products/products.route';
import { wishlistRoutes } from '../modules/wishlist/wishlist.route';
import { sliderRoutes } from '../modules/slider/slider.route';
import { productFolderRoutes } from '../modules/productFolder/productFolder.route';

const router = Router();
const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/category',
    route: categoryRoutes,
  },
  {
    path: '/product',
    route: productsRoutes,
  },
  {
    path: '/wishlist',
    route: wishlistRoutes,
  },
  {
    path: '/slider',
    route: sliderRoutes,
  },
  {
    path: '/product-folder',
    route: productFolderRoutes,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
