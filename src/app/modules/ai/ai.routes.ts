import { Router } from 'express';
import { aiControllers } from './ai.controller';
import { USER_ROLE } from '../user/user.constants';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { aiValidation } from './ai.validation';

const router = Router();

router.post(
  '/ss-preview',
  //   auth(USER_ROLE.vendor),
  validateRequest(aiValidation.generatePreviewSchema),
  aiControllers.ssPreview,
);

export const aiRoutes = router;
