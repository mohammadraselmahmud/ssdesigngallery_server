import { Router } from 'express';
import { wishlistController } from './wishlist.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post(
  '/',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  wishlistController.createWishlist,
);
router.post(
  '/remove',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  wishlistController.createWishlist,
);

router.patch('/:id', wishlistController.updateWishlist);
router.delete('/:id', wishlistController.deleteWishlist);

router.get(
  '/wishlist',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  wishlistController.getMyWishlist,
);
router.get('/:id', wishlistController.getWishlistById);
router.get('/', wishlistController.getAllWishlist);

export const wishlistRoutes = router;
