import { Router } from 'express';
import { InsightsController } from '../controllers/insights.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const controller = new InsightsController();

router.use(authenticateUser);

router.get('/baseline', controller.getBaseline);
router.post('/baseline', controller.refreshBaseline);
router.get('/patterns', controller.getPatterns);
router.get('/trends', controller.getTrends);
router.get('/attention', controller.getAttentionAreas);
router.get('/', controller.getFullInsights);

export default router;
