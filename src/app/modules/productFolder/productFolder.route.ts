import { Router } from 'express';
import { productFolderController } from './productFolder.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post(
  '/create-folder',
  auth(USER_ROLE.user),
  productFolderController.createProductFolder,
);

router.get(
  '/user/folders',
  auth(USER_ROLE.user),
  productFolderController.getMyProductFolder,
);

router.get(
  '/folders/:folderId',
  auth(USER_ROLE.user),
  productFolderController.getProductFolderById,
);

router.put(
  '/folders/:folderId',
  auth(USER_ROLE.user),
  productFolderController.updateProductFolder,
);

router.put(
  '/folders/:folderId/products/:productId',
  auth(USER_ROLE.user),
  productFolderController.updateNote,
);

router.delete(
  '/folders/:folderId/products/:productId',
  auth(USER_ROLE.user),
  productFolderController.deleteProductFromFolder,
);

router.delete(
  '/folders/:folderId',
  auth(USER_ROLE.user),
  productFolderController.deleteProductFolder,
);

export const productFolderRoutes = router;
