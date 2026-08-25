import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constants';
import { couponController } from './coupon.controller';
import { couponValidation } from './coupon.validation';

const router = Router();
const admins = [USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin];
router.post('/validate', auth(USER_ROLE.user,USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin), validateRequest(couponValidation.validateCouponSchema), couponController.validateCoupon);
router.post('/', auth(...admins), validateRequest(couponValidation.createCouponSchema), couponController.createCoupon);
router.get('/', auth(...admins), couponController.getAllCoupons);
router.get('/:id', auth(...admins), couponController.getCouponById);
router.patch('/:id', auth(...admins), validateRequest(couponValidation.updateCouponSchema), couponController.updateCoupon);
router.delete('/:id', auth(...admins), couponController.deleteCoupon);
export const couponRoutes = router;
