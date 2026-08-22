import { Router } from 'express';
import { productsController } from './products.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middleware/parseData';
const router = Router();
const storage = memoryStorage();
const upload = multer({ storage });
router.post(
  '/',
  auth(USER_ROLE.admin),
  upload.single('image'),
  parseData(),
  productsController.createProducts,
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  upload.single('image'),
  parseData(),
  productsController.updateProducts,
);
router.delete('/:id', auth(USER_ROLE.admin), productsController.deleteProducts);

router.get('/keywords', productsController?.getByKeyWords);
router.get('/related', productsController.getRelatedProducts);
router.get('/search', productsController.getAllProducts);
router.get('/category-wise/:id', productsController.getCategoryWiseProduct);

router.get('/:id', productsController.getProductsById);
router.get('/', productsController.getAllProducts);

export const productsRoutes = router;
