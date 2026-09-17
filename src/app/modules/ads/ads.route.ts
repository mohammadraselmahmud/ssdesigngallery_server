import { Router } from 'express';
import { adsController } from './ads.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { adsValidation } from './ads.validation';
import multer from 'multer';
import parseData from '../../middleware/parseData';
import uploadMultiple from '../../middleware/uploadMulti';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const uploadFields = [
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
];

const adminRoles = [
  USER_ROLE.admin,
  USER_ROLE.super_admin,
  USER_ROLE.sub_admin,
];

router.post(
  '/',
  auth(...adminRoles),
  upload.fields(uploadFields),
  parseData(),
  uploadMultiple(uploadFields),
  validateRequest(adsValidation.createAdsSchema),
  adsController.createAds,
);

router.patch(
  '/:id',
  auth(...adminRoles),
  upload.fields(uploadFields),
  parseData(),
  uploadMultiple(uploadFields),
  validateRequest(adsValidation.updateAdsSchema),
  adsController.updateAds,
);

router.delete('/:id', auth(...adminRoles), adsController.deleteAds);

router.get('/', adsController.getAllAds);
router.get('/public', adsController.getPublicAds);
router.get('/:id', adsController.getAdsById);

export const adsRoutes = router;
