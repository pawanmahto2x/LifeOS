import { Router } from 'express';
import { DigitalWellbeingController } from '../controllers/digital-wellbeing.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const controller = new DigitalWellbeingController();

router.use(authenticateUser);

router.post('/usage', controller.logUsage);
router.get('/usage/summary', controller.getSummary);
router.post('/budget', controller.setBudget);
router.post('/urge', controller.logUrge);
router.get('/urge/insights', controller.getUrgeInsights);
router.post('/detox/start', controller.startDetox);
router.post('/detox/end', controller.endDetox);

export default router;
