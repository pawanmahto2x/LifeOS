import { Request, Response, NextFunction } from 'express';
import { journalService, JournalService } from '../services/journal.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class JournalController {
  constructor(private service: JournalService = journalService) {}

  getJournals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.getJournals(
        req.user.userId,
        req.query as unknown as Parameters<JournalService['getJournals']>[1],
      );
      sendSuccess(res, result, 'Journal entries retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  searchJournals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.searchJournals(
        req.user.userId,
        req.query as unknown as Parameters<JournalService['searchJournals']>[1],
      );
      sendSuccess(res, result, 'Search results retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  getJournalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const journalId = Array.isArray(req.params.journalId)
        ? req.params.journalId[0]
        : req.params.journalId;
      const journal = await this.service.getJournalById(req.user.userId, journalId);
      sendSuccess(res, journal, 'Journal entry retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  createJournal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const journal = await this.service.createJournal(req.user.userId, req.body);
      sendSuccess(res, journal, 'Journal entry created successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  updateJournal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const journalId = Array.isArray(req.params.journalId)
        ? req.params.journalId[0]
        : req.params.journalId;
      const journal = await this.service.updateJournal(req.user.userId, journalId, req.body);
      sendSuccess(res, journal, 'Journal entry updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  deleteJournal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const journalId = Array.isArray(req.params.journalId)
        ? req.params.journalId[0]
        : req.params.journalId;
      await this.service.deleteJournal(req.user.userId, journalId);
      sendSuccess(res, null, 'Journal entry deleted successfully.');
    } catch (error) {
      next(error);
    }
  };
}

export const journalController = new JournalController();
