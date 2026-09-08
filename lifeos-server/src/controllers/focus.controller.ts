import { Request, Response, NextFunction } from 'express';
import { FocusService } from '../services/focus.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class FocusController {
  constructor(private service: FocusService = new FocusService()) {}

  startSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { taskId, duration, startedAt } = req.body as {
        taskId?: string;
        duration: number;
        startedAt?: string;
      };

      const session = await this.service.startSession(req.user.userId, {
        taskId,
        duration,
        startedAt: startedAt ? new Date(startedAt) : undefined,
      });

      sendSuccess(res, session, 'Focus session started successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  getCurrentSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const session = await this.service.getCurrentSession(req.user.userId);
      sendSuccess(res, session, 'Current focus session retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  endSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { sessionId, distractions, notes, completed } = req.body as {
        sessionId: string;
        distractions?: number;
        notes?: string;
        completed?: boolean;
      };

      const session = await this.service.endSession(req.user.userId, {
        sessionId,
        distractions,
        notes,
        completed,
      });

      sendSuccess(res, session, 'Focus session ended successfully.');
    } catch (error) {
      next(error);
    }
  };

  getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { taskId, completed, startDate, endDate, page, limit } = req.query as {
        taskId?: string;
        completed?: string;
        startDate?: string;
        endDate?: string;
        page?: string;
        limit?: string;
      };

      const result = await this.service.getSessions(req.user.userId, {
        taskId,
        completed: completed !== undefined ? completed === 'true' : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });

      sendSuccess(res, result, 'Focus sessions retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  deleteSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.service.deleteSession(req.user.userId, id);
      sendSuccess(res, null, 'Focus session deleted successfully.');
    } catch (error) {
      next(error);
    }
  };
}
