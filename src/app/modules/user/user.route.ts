import { Router } from 'express';
import { userController } from './user.controller';
import validateRequest from '../../middleware/validateRequest';
import { userValidation } from './user.validation';
import auth from '../../middleware/auth';
import { USER_ROLE } from './user.constants';

const router = Router();

router.post(
  '/sign-up',
  validateRequest(userValidation?.guestValidationSchema),
  userController.createUser,
);
router.post(
  '/sign-in',
  validateRequest(userValidation?.loginZodValidationSchema),
  userController.login,
);
router.post('/update-password', userController.updatePassword);
router.post(
  '/change-password',
  auth(USER_ROLE.admin, USER_ROLE.user),
  userController.changePassword,
);
router.get(
  '/my-profile',
  auth(
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
    USER_ROLE.user,
  ),
  userController.getMyProfile,
);

router.post('/forget-password', userController.forgotPassword);

router.put(
  '/updateUser',
  auth(
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
    USER_ROLE.user,
  ),
  userController.updateUser,
);

router.post('/verify', userController.verifyOtp);

router.get('/', auth(USER_ROLE.admin), userController.getAllUser);

export const userRoutes = router;
