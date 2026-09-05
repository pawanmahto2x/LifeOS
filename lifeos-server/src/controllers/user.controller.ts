import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class UserController {
  constructor(private service: AuthService = authService) {}

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      const user = await this.service.getMe(req.user.userId);
      sendSuccess(res, user, 'Profile retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      const updated = await this.service.updateProfile(req.user.userId, req.body);
      sendSuccess(res, updated, 'Profile updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      await this.service.deleteAccount(req.user.userId);
      sendSuccess(res, null, 'Account permanently deleted.');
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
