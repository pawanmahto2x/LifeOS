import { Request, Response, NextFunction } from 'express';
import { DailyMissionService } from '../services/daily-mission.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';
import {
  submitReviewSchema,
  missionHistoryQuerySchema,
} from '../validators/daily-mission.validator';

export class DailyMissionController {
  constructor(private service: DailyMissionService = new DailyMissionService()) {}

  generateMission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.generateMission(req.user.userId);
      sendSuccess(res, result, 'Daily mission generated successfully.');
    } catch (error) {
      next(error);
    }
  };

  getTodayMission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.getTodayMission(req.user.userId);
      sendSuccess(res, result, "Today's mission fetched successfully.");
    } catch (error) {
      next(error);
    }
  };

  submitReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const validatedData = submitReviewSchema.parse(req.body);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.service.submitReview(req.user.userId, id, validatedData);
      sendSuccess(res, result, 'Daily review submitted successfully.');
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { limit } = missionHistoryQuerySchema.parse(req.query);
      const result = await this.service.getMissionHistory(req.user.userId, limit);
      sendSuccess(res, result, 'Mission history fetched successfully.');
    } catch (error) {
      next(error);
    }
  };

  deleteMission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      // Optimistic/simple delete using model directly since service doesn't have it
      const { DailyMission } = await import('../models/daily-mission.model');
      await DailyMission.findOneAndDelete({ _id: id, userId: req.user.userId });
      sendSuccess(res, null, 'Mission rejected successfully.');
    } catch (error) {
      next(error);
    }
  };

  getWeeklyMissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.getWeeklyMissions(req.user.userId);
      sendSuccess(res, result, 'Weekly missions fetched successfully.');
    } catch (error) {
      next(error);
    }
  };

  getCommunityMissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.getCommunityMissions(req.user.userId);
      sendSuccess(res, result, 'Community missions fetched successfully.');
    } catch (error) {
      next(error);
    }
  };

  toggleMissionItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.toggleMissionItem(req.user.userId, req.body);
      sendSuccess(res, result, 'Mission item updated successfully.');
    } catch (error) {
      next(error);
    }
  };
}
