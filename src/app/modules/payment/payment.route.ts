import { Router } from 'express';
import { paymentController } from './payment.controller';
import { USER_ROLE } from '../user/user.constants';
import auth from '../../middleware/auth';

import validateRequest from '../../middleware/validateRequest';
import { paymentValidation } from './payment.validation';

const router = Router();

router.post(
  '/init',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  paymentController.initPayment,
);
router.post('/verify', paymentController.verifyPayment);
router.get('/success', paymentController.handlePaymentSuccess);
router.get('/cancel', paymentController.handlePaymentCancel);

router.post(
  '/google-pay/verify',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  validateRequest(paymentValidation.googlePayVerifySchema),
  paymentController.handleGooglePayWebhook,
);

router.post(
  '/google-pay/webhook',
  validateRequest(paymentValidation.googlePayVerifySchema),
  paymentController.handleGooglePayWebhook,
);

export const paymentRoutes = router;
