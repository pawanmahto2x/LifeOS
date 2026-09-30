import { Router } from 'express';
import { LifeReplayController } from '../controllers/life-replay.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const controller = new LifeReplayController();

router.use(authenticateUser);

router.get('/history/:period', controller.getHistory);

router.get('/:period', controller.generateReplay);

router.post('/:id/reflection', controller.saveReflection);

export default router;
