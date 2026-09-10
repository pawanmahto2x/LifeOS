import { Router } from 'express';
import { AchievementController } from '../controllers/achievement.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();
export const achievementController = new AchievementController();

// All achievement endpoints require authentication and are strictly read-only
router.use(authenticateUser);

router.get('/', achievementController.getAchievements);
router.get('/:achievementId', achievementController.getAchievementById);

export default router;
