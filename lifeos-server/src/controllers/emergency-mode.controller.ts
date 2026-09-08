import { Request, Response, NextFunction } from 'express';
import { EmergencyModeService } from '../services/emergency-mode.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class EmergencyModeController {
  constructor(private service: EmergencyModeService = new EmergencyModeService()) {}

  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const status = await this.service.getStatus(req.user.userId);
      sendSuccess(res, status, 'Emergency mode status retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  enable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.enableEmergencyMode(req.user.userId);
      sendSuccess(res, result, 'Emergency Mode enabled.', 200);
    } catch (error) {
      next(error);
    }
  };

  disable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.disableEmergencyMode(req.user.userId);
      sendSuccess(res, result, 'Emergency Mode disabled. Settings restored.', 200);
    } catch (error) {
      next(error);
    }
  };
}
