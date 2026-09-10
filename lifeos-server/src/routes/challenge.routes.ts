import { Router } from 'express';
import { ChallengeController } from '../controllers/challenge.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  createChallengeSchema,
  updateChallengeSchema,
  updateChallengeProgressSchema,
} from '../validators/challenge.validator';

const router = Router();
export const challengeController = new ChallengeController();

// All challenge endpoints require authentication
router.use(authenticateUser);

router.post(
  '/',
  validateRequest({ body: createChallengeSchema }),
  challengeController.createChallenge,
);
router.get('/', challengeController.getChallenges);

router.get('/:challengeId', challengeController.getChallengeDetails);
router.patch(
  '/:challengeId',
  validateRequest({ body: updateChallengeSchema }),
  challengeController.updateChallenge,
);
router.delete('/:challengeId', challengeController.deleteChallenge);

router.post('/:challengeId/join', challengeController.joinChallenge);
router.post('/:challengeId/leave', challengeController.leaveChallenge);

router.patch(
  '/:challengeId/progress',
  validateRequest({ body: updateChallengeProgressSchema }),
  challengeController.updateProgress,
);

router.get('/:challengeId/leaderboard', challengeController.getLeaderboard);

export default router;
