import { Router } from 'express';
import { habitController } from '../controllers/habit.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  createHabitSchema,
  updateHabitSchema,
  queryHabitsSchema,
} from '../validators/habit.validator';

const router = Router();

// All habit endpoints require authentication
router.use(authenticateUser);

router.get('/', validateRequest({ query: queryHabitsSchema }), habitController.getHabits);

router.post('/', validateRequest({ body: createHabitSchema }), habitController.createHabit);

router.get('/:habitId', habitController.getHabitById);

router.patch(
  '/:habitId',
  validateRequest({ body: updateHabitSchema }),
  habitController.updateHabit,
);

router.post('/:habitId/complete', habitController.completeHabit);

router.post('/:habitId/skip', habitController.skipHabit);

router.patch('/:habitId/pause', habitController.pauseHabit);

router.patch('/:habitId/resume', habitController.resumeHabit);

router.delete('/:habitId', habitController.deleteHabit);

export default router;
