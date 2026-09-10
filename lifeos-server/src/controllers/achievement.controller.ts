import { Request, Response, NextFunction } from 'express';
import { AchievementService } from '../services/achievement.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class AchievementController {
  constructor(private service: AchievementService = new AchievementService()) {}

  getAchievements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const summary = await this.service.getUserAchievements(req.user.userId);
      sendSuccess(res, summary, 'Achievements retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  getAchievementById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const achievementId = Array.isArray(req.params.achievementId)
        ? req.params.achievementId[0]
        : req.params.achievementId;
      const achievement = await this.service.getAchievementById(achievementId, req.user.userId);
      sendSuccess(res, achievement, 'Achievement details retrieved.');
    } catch (error) {
      next(error);
    }
  };
}
