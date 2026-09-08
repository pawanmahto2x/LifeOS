import { Router } from 'express';
import { DigitalDetoxController } from '../controllers/digital-detox.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  updateDigitalDetoxSettingsSchema,
  logScreenTimeSchema,
} from '../validators/digital-detox.validator';

const router = Router();
export const digitalDetoxController = new DigitalDetoxController();

// All digital detox endpoints require authentication
router.use(authenticateUser);

router.get('/settings', digitalDetoxController.getSettings);
router.patch(
  '/settings',
  validateRequest({ body: updateDigitalDetoxSettingsSchema }),
  digitalDetoxController.updateSettings,
);

router.get('/usage', digitalDetoxController.getUsage);
router.post(
  '/usage',
  validateRequest({ body: logScreenTimeSchema }),
  digitalDetoxController.logScreenTime,
);

router.get('/opportunity-cost', digitalDetoxController.getOpportunityCost);

export default router;
