import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { adminDashboardController } from './adminDashboard.controller';

const router = Router();
const admins = [USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin];

router.get('/overview', auth(...admins), adminDashboardController.getOverview);
router.get('/income-history', auth(...admins), adminDashboardController.getIncomeHistory);

export const adminDashboardRoutes = router;
