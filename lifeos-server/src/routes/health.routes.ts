import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  logWaterSchema,
  updateWaterSchema,
  queryHealthLogsSchema,
  logSleepSchema,
  updateSleepSchema,
  logMoodSchema,
  updateMoodSchema,
  queryMoodLogsSchema,
} from '../validators/health.validator';

const router = Router();
export const healthController = new HealthController();

// All health endpoints require authentication
router.use(authenticateUser);

// Overall Health Summary
router.get('/summary', healthController.getSummary);

// Water Endpoints
router.get(
  '/water',
  validateRequest({ query: queryHealthLogsSchema }),
  healthController.getWaterLogs,
);
router.post('/water', validateRequest({ body: logWaterSchema }), healthController.logWater);
router.patch(
  '/water/:id',
  validateRequest({ body: updateWaterSchema }),
  healthController.updateWaterLog,
);
router.delete('/water/:id', healthController.deleteWaterLog);

// Sleep Endpoints
router.get(
  '/sleep',
  validateRequest({ query: queryHealthLogsSchema }),
  healthController.getSleepLogs,
);
router.post('/sleep', validateRequest({ body: logSleepSchema }), healthController.logSleep);
router.patch(
  '/sleep/:id',
  validateRequest({ body: updateSleepSchema }),
  healthController.updateSleepLog,
);
router.delete('/sleep/:id', healthController.deleteSleepLog);

// Mood Endpoints
router.get('/mood', validateRequest({ query: queryMoodLogsSchema }), healthController.getMoodLogs);
router.post('/mood', validateRequest({ body: logMoodSchema }), healthController.logMood);
router.patch(
  '/mood/:id',
  validateRequest({ body: updateMoodSchema }),
  healthController.updateMoodLog,
);
router.delete('/mood/:id', healthController.deleteMoodLog);

export default router;
