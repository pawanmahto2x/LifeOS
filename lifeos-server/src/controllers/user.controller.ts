import { Request, Response, NextFunction } from 'express';
import { userService, UserService } from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class UserController {
  constructor(private service: UserService = userService) {}

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      const user = await this.service.getProfile(req.user.userId);
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

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      await this.service.changePassword(req.user.userId, req.body);
      sendSuccess(res, null, 'Password changed successfully.');
    } catch (error) {
      next(error);
    }
  };

  exportData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      const data = await this.service.exportUserData(req.user.userId);
      sendSuccess(res, data, 'User data exported successfully.');
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
