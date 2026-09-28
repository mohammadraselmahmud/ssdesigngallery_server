import { Router } from 'express';
import { z } from 'zod';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { USER_ROLE } from '../user/user.constants';
import { getContents, updateContents } from './contents.service';

export const updateContentsSchema = z.object({
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
  '/',
  auth(USER_ROLE.admin, USER_ROLE.super_admin),
  validateRequest(updateContentsSchema),
  catchAsync(async (req, res) => {
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Contents updated successfully.',
      data: await updateContents(req.body.turnOffAiOption),
    });
  }),
);

export const contentsRoutes = router;
