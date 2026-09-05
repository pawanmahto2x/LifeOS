import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class AuthController {
  constructor(private service: AuthService = authService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.register(req.body);
      sendSuccess(res, user, 'Registration successful.', 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      sendSuccess(res, result, 'Login successful.');
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.service.refreshTokens(refreshToken);
      sendSuccess(res, tokens, 'Token refreshed successfully.');
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      await this.service.logout(req.user.userId);
      sendSuccess(res, null, 'Logged out successfully.');
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await this.service.forgotPassword(email);
      sendSuccess(
        res,
        null,
        'If an account exists with this email, a password reset link has been sent.',
      );
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      await this.service.resetPassword(token, newPassword);
      sendSuccess(res, null, 'Password has been reset successfully. Please log in.');
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
