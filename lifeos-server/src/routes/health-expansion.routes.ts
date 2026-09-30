import { Router } from 'express';
import { HealthExpansionController } from '../controllers/health-expansion.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const controller = new HealthExpansionController();

router.use(authenticateUser);

router.post('/body-metrics', controller.addBodyMetric);
router.get('/body-metrics', controller.getBodyMetrics);

router.post('/activity', controller.addActivityLog);
router.get('/activity/summary', controller.getActivitySummary);

router.post('/mindfulness', controller.addMindfulnessSession);
router.get('/mindfulness/insight', controller.getMindfulnessInsight);

export default router;
