import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/health.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';
import { MoodType, SleepQuality, WaterUnit } from '../types/health.types';

export class HealthController {
  constructor(private service: HealthService = new HealthService()) {}

  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const summary = await this.service.getHealthSummary(req.user.userId);
      sendSuccess(res, summary, 'Health summary retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // WATER CONTROLLERS
  // ==========================================

  logWater = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { amount, unit, loggedAt } = req.body as {
        amount: number;
        unit: WaterUnit;
        loggedAt?: string;
      };
      const log = await this.service.logWater(req.user.userId, {
        amount,
        unit,
        loggedAt,
      });
      sendSuccess(res, log, 'Water intake logged successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  getWaterLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { startDate, endDate, page, limit } = req.query as {
        startDate?: string;
        endDate?: string;
        page?: string;
        limit?: string;
      };

      const result = await this.service.getWaterLogs(req.user.userId, {
        startDate,
        endDate,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });

      sendSuccess(res, result, 'Water logs retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  updateWaterLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { amount, unit, loggedAt } = req.body as {
        amount?: number;
        unit?: WaterUnit;
        loggedAt?: string;
      };

      const updated = await this.service.updateWaterLog(req.user.userId, id, {
        amount,
        unit,
        loggedAt: loggedAt ? new Date(loggedAt) : undefined,
      });

      sendSuccess(res, updated, 'Water log updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  deleteWaterLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.service.deleteWaterLog(req.user.userId, id);
      sendSuccess(res, null, 'Water log deleted successfully.');
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // SLEEP CONTROLLERS
  // ==========================================

  logSleep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { sleepTime, wakeTime, quality, notes } = req.body as {
        sleepTime: string;
        wakeTime: string;
        quality: SleepQuality;
        notes?: string;
      };

      const log = await this.service.logSleep(req.user.userId, {
        sleepTime,
        wakeTime,
        quality,
        notes,
      });

      sendSuccess(res, log, 'Sleep log recorded successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  getSleepLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { startDate, endDate, page, limit } = req.query as {
        startDate?: string;
        endDate?: string;
        page?: string;
        limit?: string;
      };

      const result = await this.service.getSleepLogs(req.user.userId, {
        startDate,
        endDate,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });

      sendSuccess(res, result, 'Sleep logs retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  updateSleepLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { sleepTime, wakeTime, quality, notes } = req.body as {
        sleepTime?: string;
        wakeTime?: string;
        quality?: SleepQuality;
        notes?: string;
      };

      const updated = await this.service.updateSleepLog(req.user.userId, id, {
        sleepTime,
        wakeTime,
        quality,
        notes,
      });

      sendSuccess(res, updated, 'Sleep log updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  deleteSleepLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.service.deleteSleepLog(req.user.userId, id);
      sendSuccess(res, null, 'Sleep log deleted successfully.');
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // MOOD CONTROLLERS
  // ==========================================

  logMood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { mood, moodScore, note, loggedAt } = req.body as {
        mood: MoodType;
        moodScore: number;
        note?: string;
        loggedAt?: string;
      };

      const log = await this.service.logMood(req.user.userId, {
        mood,
        moodScore,
        note,
        loggedAt,
      });

      sendSuccess(res, log, 'Mood log recorded successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  getMoodLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { startDate, endDate, mood, page, limit } = req.query as {
        startDate?: string;
        endDate?: string;
        mood?: MoodType;
        page?: string;
        limit?: string;
      };

      const result = await this.service.getMoodLogs(req.user.userId, {
        startDate,
        endDate,
        mood,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });

      sendSuccess(res, result, 'Mood logs retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  updateMoodLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { mood, moodScore, note, loggedAt } = req.body as {
        mood?: MoodType;
        moodScore?: number;
        note?: string;
        loggedAt?: string;
      };

      const updated = await this.service.updateMoodLog(req.user.userId, id, {
        mood,
        moodScore,
        note,
        loggedAt,
      });

      sendSuccess(res, updated, 'Mood log updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  deleteMoodLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.service.deleteMoodLog(req.user.userId, id);
      sendSuccess(res, null, 'Mood log deleted successfully.');
    } catch (error) {
      next(error);
    }
  };
}
