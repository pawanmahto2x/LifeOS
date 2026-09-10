import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  saveAISettingsSchema,
  updateAISettingsSchema,
  aiCoachPromptSchema,
} from '../validators/ai.validator';

const router = Router();
export const aiController = new AIController();

// All AI endpoints require authentication
router.use(authenticateUser);

// BYOK Settings
router.get('/settings', aiController.getSettings);
router.post(
  '/settings',
  validateRequest({ body: saveAISettingsSchema }),
  aiController.saveSettings,
);
router.patch(
  '/settings',
  validateRequest({ body: updateAISettingsSchema }),
  aiController.updateSettings,
);
router.delete('/settings', aiController.deleteSettings);

// AI Features
router.post('/reports/weekly', aiController.generateWeeklyReport);
router.post('/coach', validateRequest({ body: aiCoachPromptSchema }), aiController.askCoach);
router.post('/health-analysis', aiController.getHealthAnalysis);

export default router;
