import { Router } from 'express';
import { productFolderController } from './productFolder.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post(
  '/create-folder',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  productFolderController.createProductFolder,
);

router.get(
  '/user/folders',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  productFolderController.getMyProductFolder,
);

router.get(
  '/folders/:folderId',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  productFolderController.getProductFolderById,
);

router.put(
  '/folders/:folderId',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  productFolderController.updateProductFolder,
);

router.put(
  '/folders/:folderId/products/:productId',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  productFolderController.updateNote,
);

router.delete(
  '/folders/:folderId/products/:productId',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  productFolderController.deleteProductFromFolder,
);

router.delete(
  '/folders/:folderId',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  productFolderController.deleteProductFolder,
);

export const productFolderRoutes = router;
