import { Router } from 'express';
import { sliderController } from './slider.controller';
import { USER_ROLE } from '../user/user.constants';
import auth from '../../middleware/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middleware/parseData';
const router = Router();
const storage = memoryStorage();
const upload = multer({ storage });

router.post(
  '/',
  auth(USER_ROLE.admin),
  upload.single('image'),
  parseData(),
  sliderController.createSlider,
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  upload.single('image'),
  parseData(),
  sliderController.updateSlider,
);
router.delete('/:id', auth(USER_ROLE.admin), sliderController.deleteSlider);
router.get('/:id', sliderController.getSliderById);
router.get('/', sliderController.getAllSlider);

export const sliderRoutes = router;
