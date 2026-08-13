import { Router } from 'express';
import { userRoutes } from '../modules/user/user.route';
import { categoryRoutes } from '../modules/category/category.route';
import { productsRoutes } from '../modules/products/products.route';
import { wishlistRoutes } from '../modules/wishlist/wishlist.route';
import { sliderRoutes } from '../modules/slider/slider.route';
import { productFolderRoutes } from '../modules/productFolder/productFolder.route';
import { adsRoutes } from '../modules/ads/ads.route';
import { subscriptionRoutes } from '../modules/subscription/subscription.route';
import { paymentRoutes } from '../modules/payment/payment.route';
import { packageRoutes } from '../modules/package/package.route';

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
  {
    path: '/ads',
    route: adsRoutes,
  },
  {
    path: '/package',
    route: packageRoutes,
  },
  {
    path: '/subscription',
    route: subscriptionRoutes,
  },

  {
    path: '/payment',
    route: paymentRoutes,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
