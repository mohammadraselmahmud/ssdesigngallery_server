import { Router } from 'express';
import { subscriptionController } from './subscription.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { subscriptionValidation } from './subscription.validation';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(subscriptionValidation.createSubscriptionSchema),
  subscriptionController.createSubscription,
);
router.patch(
  '/:id',
  auth(USER_ROLE.user),
  subscriptionController.updateSubscription,
);
router.delete(
  '/:id',
  auth(USER_ROLE.user),
  subscriptionController.deleteSubscription,
);
router.get(
  '/current-plan',
  auth(USER_ROLE.user),
  subscriptionController.getCurrentPlan,
);
router.get(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  subscriptionController.getSubscriptionById,
);
router.get(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  subscriptionController.getAllSubscription,
);

export const subscriptionRoutes = router;
