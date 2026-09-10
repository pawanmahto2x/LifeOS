import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class AIController {
  constructor(private service: AIService = new AIService()) {}

  getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const settings = await this.service.getSettings(req.user.userId);
      sendSuccess(res, settings, 'AI settings retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  saveSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const settings = await this.service.saveSettings(req.user.userId, req.body);
      sendSuccess(res, settings, 'AI settings saved successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const settings = await this.service.updateSettings(req.user.userId, req.body);
      sendSuccess(res, settings, 'AI settings updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  deleteSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      await this.service.deleteSettings(req.user.userId);
      sendSuccess(res, null, 'AI settings deleted successfully.');
    } catch (error) {
      next(error);
    }
  };

  generateWeeklyReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const report = await this.service.generateWeeklyAIReport(req.user.userId);
      sendSuccess(res, report, 'Weekly AI report generated successfully.');
    } catch (error) {
      next(error);
    }
  };

  askCoach = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const response = await this.service.askAICoach(req.user.userId, req.body.question);
      sendSuccess(res, response, 'AI coach response generated.');
    } catch (error) {
      next(error);
    }
  };

  getHealthAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const analysis = await this.service.getHealthAnalysis(req.user.userId);
      sendSuccess(res, analysis, 'AI health analysis retrieved.');
    } catch (error) {
      next(error);
    }
  };
}
