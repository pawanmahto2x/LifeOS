import { Router } from 'express';
import { GoalController } from '../controllers/goal.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  createGoalSchema,
  updateGoalSchema,
  applyAIPlanSchema,
} from '../validators/goal.validator';

const router = Router();
const controller = new GoalController();

router.use(authenticateUser);

router.get('/', controller.findAll);
router.post('/', validateRequest({ body: createGoalSchema }), controller.create);
router.get('/:id', controller.findById);
router.put('/:id', validateRequest({ body: updateGoalSchema }), controller.update);
router.post('/:id/ai-plan', controller.generateAIPlan);
router.post(
  '/:id/apply-plan',
  validateRequest({ body: applyAIPlanSchema }),
  controller.applyAIPlan,
);
router.get('/:id/report', controller.generateGoalReport);

export default router;
