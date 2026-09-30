import { Request, Response, NextFunction } from 'express';
import { DigitalWellbeingService } from '../services/digital-wellbeing.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class DigitalWellbeingController {
  constructor(private service: DigitalWellbeingService = new DigitalWellbeingService()) {}

  logUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { appName, durationMinutes, category, reason } = req.body;
      const result = await this.service.logUsage(
        req.user.userId,
        appName,
        durationMinutes,
        category,
        reason,
      );
      sendSuccess(res, result, 'Usage logged successfully.');
    } catch (error) {
      next(error);
    }
  };

  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.getSummary(req.user.userId);
      sendSuccess(res, result, 'Digital wellbeing summary retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  setBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { dailyTargetMinutes } = req.body;
      const result = await this.service.setBudget(req.user.userId, dailyTargetMinutes);
      sendSuccess(res, result, 'Budget set successfully.');
    } catch (error) {
      next(error);
    }
  };

  logUrge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { redirectedAction, outcome } = req.body;
      const result = await this.service.logUrge(req.user.userId, redirectedAction, outcome);
      sendSuccess(res, result, 'Urge logged successfully.');
    } catch (error) {
      next(error);
    }
  };

  getUrgeInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.getUrgeInsights(req.user.userId);
      sendSuccess(res, result, 'Urge insights retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  startDetox = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { targetDuration } = req.body;
      const result = await this.service.startDetox(req.user.userId, targetDuration);
      sendSuccess(res, result, 'Detox session started successfully.');
    } catch (error) {
      next(error);
    }
  };

  endDetox = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { completed, endedEarlyReason } = req.body;
      const result = await this.service.endDetox(req.user.userId, completed, endedEarlyReason);
      sendSuccess(res, result, 'Detox session ended successfully.');
    } catch (error) {
      next(error);
    }
  };
}
