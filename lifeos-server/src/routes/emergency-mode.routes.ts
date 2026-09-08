import { Router } from 'express';
import { EmergencyModeController } from '../controllers/emergency-mode.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();
export const emergencyModeController = new EmergencyModeController();

// All emergency mode endpoints require authentication
router.use(authenticateUser);

router.get('/status', emergencyModeController.getStatus);
router.post('/enable', emergencyModeController.enable);
router.post('/disable', emergencyModeController.disable);

export default router;
