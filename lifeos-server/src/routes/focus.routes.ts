import { Router } from 'express';
import { FocusController } from '../controllers/focus.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  startFocusSessionSchema,
  endFocusSessionSchema,
  queryFocusSessionsSchema,
} from '../validators/focus.validator';

const router = Router();
export const focusController = new FocusController();

// All focus endpoints require authentication
router.use(authenticateUser);

router.get('/', validateRequest({ query: queryFocusSessionsSchema }), focusController.getSessions);
router.get('/current', focusController.getCurrentSession);
router.post(
  '/start',
  validateRequest({ body: startFocusSessionSchema }),
  focusController.startSession,
);
router.post('/end', validateRequest({ body: endFocusSessionSchema }), focusController.endSession);
router.delete('/:id', focusController.deleteSession);

export default router;
