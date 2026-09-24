import { Router } from 'express';
import { aiControllers } from './ai.controller';
import { USER_ROLE } from '../user/user.constants';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { aiValidation } from './ai.validation';

const router = Router();

const allowedRoles = [
  USER_ROLE.user,
  USER_ROLE.vendor,
  USER_ROLE.admin,
  USER_ROLE.sub_admin,
  USER_ROLE.super_admin,
];

router.post(
  '/ss-preview',
  auth(...allowedRoles),
  validateRequest(aiValidation.generatePreviewSchema),
  aiControllers.ssPreview,
);

router.get(
  '/ss-preview/:predictionId',
  auth(...allowedRoles),
  aiControllers.ssPreviewStatus,
);
export const aiRoutes = router;
