import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate';
import { authenticateUser } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateRequest({ body: registerSchema }),
  authController.register,
);

router.post('/login', authLimiter, validateRequest({ body: loginSchema }), authController.login);

router.post(
  '/refresh-token',
  authLimiter,
  validateRequest({ body: refreshTokenSchema }),
  authController.refreshToken,
);

router.post('/logout', authenticateUser, authController.logout);

router.post(
  '/forgot-password',
  authLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);

router.post(
  '/reset-password',
  authLimiter,
  validateRequest({ body: resetPasswordSchema }),
  authController.resetPassword,
);

export default router;
