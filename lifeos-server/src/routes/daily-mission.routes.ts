import { Router } from 'express';
import { DailyMissionController } from '../controllers/daily-mission.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const controller = new DailyMissionController();

router.use(authenticateUser);

router.post('/generate', controller.generateMission);
router.get('/today', controller.getTodayMission);
router.put('/:id/review', controller.submitReview);
router.get('/history', controller.getHistory);
router.delete('/:id', controller.deleteMission);

export default router;
