import { Request, Response, NextFunction } from 'express';
import { LifeReplayService } from '../services/life-replay.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';
import { ReplayPeriod } from '../types/life-replay.types';

export class LifeReplayController {
  constructor(private service: LifeReplayService = new LifeReplayService()) {}

  generateReplay = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const period = req.params.period as ReplayPeriod;
      const refDate = req.query.date ? new Date(req.query.date as string) : undefined;
      const replay = await this.service.generateReplay(req.user.userId, period, refDate);
      sendSuccess(res, replay, 'Replay generated successfully');
    } catch (error) {
      next(error);
    }
  };

  saveReflection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const replay = await this.service.saveUserReflection(req.user.userId, id, req.body);
      sendSuccess(res, replay, 'Reflection saved successfully');
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const period = req.params.period as ReplayPeriod;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const history = await this.service.getReplayHistory(req.user.userId, period, limit);
      sendSuccess(res, history, 'History retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
