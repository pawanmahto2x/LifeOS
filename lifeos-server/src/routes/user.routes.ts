import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { changePasswordSchema, updateProfileSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticateUser);

router.get('/me', userController.getMe);
router.patch('/me', validateRequest({ body: updateProfileSchema }), userController.updateProfile);
router.post(
  '/change-password',
  validateRequest({ body: changePasswordSchema }),
  userController.changePassword,
);
router.get('/export', userController.exportData);
router.delete('/me', userController.deleteAccount);

export default router;
