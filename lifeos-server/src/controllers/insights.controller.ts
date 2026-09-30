import { Request, Response, NextFunction } from 'express';
import { InsightsService } from '../services/insights.service';
import { InsightsRepository } from '../repositories/insights.repository';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';
import { BaselinePeriod } from '../types/insights.types';

export class InsightsController {
  constructor(
    private service: InsightsService = new InsightsService(),
    private repo: InsightsRepository = new InsightsRepository(),
  ) {}

  getBaseline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const period = (req.query.period as BaselinePeriod) || '7d';
      const baseline = await this.repo.findBaseline(req.user.userId, period);
      sendSuccess(res, baseline, 'Baseline retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  refreshBaseline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const period = (req.query.period as BaselinePeriod) || '7d';
      const result = await this.service.computeBaseline(req.user.userId, period);
      sendSuccess(res, result, 'Baseline computed successfully.');
    } catch (error) {
      next(error);
    }
  };

  getPatterns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const patterns = await this.repo.findActiveInsights(req.user.userId);
      sendSuccess(res, patterns, 'Patterns retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  getTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const trends = await this.service.detectTrends(req.user.userId);
      sendSuccess(res, trends, 'Trends retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  getAttentionAreas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const areas = await this.service.getAttentionAreas(req.user.userId);
      sendSuccess(res, areas, 'Attention areas retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  getFullInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.getFullInsights(req.user.userId);
      sendSuccess(res, result, 'Full insights retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };
}
