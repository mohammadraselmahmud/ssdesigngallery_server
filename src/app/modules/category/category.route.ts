import { Router } from 'express';
import { categoryController } from './category.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import multer, { memoryStorage } from 'multer';

const router = Router();
const storage = memoryStorage();
const upload = multer({ storage });


router.post(
  '/add',
  auth(USER_ROLE.admin),
  upload.single('image'),
  parseData(),
  categoryController.createCategory,
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  upload.single('image'),
  parseData(),
  categoryController.updateCategory,
);

router.delete('/:id', auth(USER_ROLE.admin), categoryController.deleteCategory);

router.get('/:id', categoryController.getCategoryById);
router.get('/', categoryController.getAllCategory);

export const categoryRoutes = router;
