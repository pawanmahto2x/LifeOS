import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { updateProfileSchema } from '../validators/user.validator';

const router = Router();

router.get('/me', authenticateUser, userController.getMe);
router.patch(
  '/me',
  authenticateUser,
  validateRequest({ body: updateProfileSchema }),
  userController.updateProfile,
);
router.delete('/me', authenticateUser, userController.deleteAccount);

export default router;
