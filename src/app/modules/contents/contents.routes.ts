import { Router } from 'express';
import { z } from 'zod';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { USER_ROLE } from '../user/user.constants';
import { getContents, toggleAiGeneration } from './contents.service';

export const toggleAiGenerationSchema = z.object({
  body: z.object({ isAiGenerationEnabled: z.boolean() }).strict(),
});

const router = Router();

router.get(
  '/',
  catchAsync(async (_req, res) => {
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Contents retrieved successfully.',
      data: await getContents(),
    });
  }),
);

router.patch(
  '/toggle',
  auth(USER_ROLE.admin, USER_ROLE.super_admin),
  validateRequest(toggleAiGenerationSchema),
  catchAsync(async (req, res) => {
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'AI generation setting toggled successfully.',
      data: await toggleAiGeneration(req.body.isAiGenerationEnabled),
    });
  }),
);

export const contentsRoutes = router;
