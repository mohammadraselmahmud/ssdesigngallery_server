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

router.post(
  '/',
  auth(USER_ROLE.admin),
  upload.fields(uploadFields),
  parseData(),
  uploadMultiple(uploadFields),
  validateRequest(adsValidation.createAdsSchema),
  adsController.createAds,
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin),

  upload.fields(uploadFields),
  parseData(),
  validateRequest(adsValidation.updateAdsSchema),
  uploadMultiple(uploadFields),
  adsController.updateAds,
);
router.delete('/:id', auth(USER_ROLE.admin), adsController.deleteAds);
router.get('/public', adsController.getPublicAds);
router.get('/:id', adsController.getAdsById);
router.get('/', adsController.getAllAds);

export const adsRoutes = router;
