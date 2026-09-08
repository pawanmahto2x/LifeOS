import { Request, Response, NextFunction } from 'express';
import { DigitalDetoxService } from '../services/digital-detox.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class DigitalDetoxController {
  constructor(private service: DigitalDetoxService = new DigitalDetoxService()) {}

  getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const settings = await this.service.getSettings(req.user.userId);
      sendSuccess(res, settings, 'Digital detox settings retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const settings = await this.service.updateSettings(req.user.userId, req.body);
      sendSuccess(res, settings, 'Digital detox settings updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  getUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const usage = await this.service.getUsage(req.user.userId);
      sendSuccess(res, usage, 'Digital detox usage report retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  logScreenTime = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { appName, minutesUsed, loggedDate } = req.body as {
        appName?: string;
        minutesUsed: number;
        loggedDate?: string;
      };

      const log = await this.service.logScreenTime(req.user.userId, {
        appName,
        minutesUsed,
        loggedDate: loggedDate ? new Date(loggedDate) : undefined,
      });

      sendSuccess(res, log, 'Screen time usage logged successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  getOpportunityCost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const summary = await this.service.getOpportunityCost(req.user.userId);
      sendSuccess(res, summary, 'Opportunity cost summary retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };
}
