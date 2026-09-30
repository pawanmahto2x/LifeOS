import { Request, Response, NextFunction } from 'express';
import { HealthExpansionService } from '../services/health-expansion.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class HealthExpansionController {
  constructor(private service: HealthExpansionService = new HealthExpansionService()) {}

  addBodyMetric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { height, weight } = req.body;
      const result = await this.service.addBodyMetric(req.user.userId, height, weight);
      sendSuccess(res, result, 'Body metric added successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getBodyMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.getBodyMetrics(req.user.userId);
      sendSuccess(res, result, 'Body metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  addActivityLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.addActivityLog(req.user.userId, req.body);
      sendSuccess(res, result, 'Activity log added successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getActivitySummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.getActivitySummary(req.user.userId);
      sendSuccess(res, result, 'Activity summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  addMindfulnessSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.addMindfulnessSession(req.user.userId, req.body);
      sendSuccess(res, result, 'Mindfulness session added successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getMindfulnessInsight = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.getMindfulnessInsight(req.user.userId);
      sendSuccess(res, result, 'Mindfulness insight retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
