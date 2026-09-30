import { Request, Response, NextFunction } from 'express';
import { JournalAnalysisService } from '../services/journal-analysis.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class JournalAnalysisController {
  constructor(private service: JournalAnalysisService = new JournalAnalysisService()) {}

  analyzeEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const journalId = Array.isArray(req.params.journalId)
        ? req.params.journalId[0]
        : req.params.journalId;
      const result = await this.service.analyzeEntry(req.user.userId, journalId);
      sendSuccess(res, { analysis: result }, 'Journal analyzed successfully');
    } catch (error) {
      next(error);
    }
  };

  getAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const journalId = Array.isArray(req.params.journalId)
        ? req.params.journalId[0]
        : req.params.journalId;
      const result = await this.service.getAnalysis(req.user.userId, journalId);
      sendSuccess(res, { analysis: result }, 'Journal analysis retrieved');
    } catch (error) {
      next(error);
    }
  };

  getRecurringThemes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
      const result = await this.service.getRecurringThemes(req.user.userId, limit);
      sendSuccess(res, result, 'Recurring themes retrieved');
    } catch (error) {
      next(error);
    }
  };
}
