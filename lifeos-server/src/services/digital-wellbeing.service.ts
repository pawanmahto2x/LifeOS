import { Types } from 'mongoose';
import { DigitalWellbeingRepository } from '../repositories/digital-wellbeing.repository';

import { BadRequestError, NotFoundError } from '../utils/errors';

export class DigitalWellbeingService {
  constructor(private repository: DigitalWellbeingRepository = new DigitalWellbeingRepository()) {}

  async logUsage(
    userId: string,
    appName: string,
    durationMinutes: number,
    category: string,
    reason: string,
  ): Promise<any> {
    return await this.repository.logUsage({
      userId: new Types.ObjectId(userId),
      appName,
      durationMinutes,
      category,
      reason,
      date: new Date(),
    });
  }

  async setBudget(userId: string, dailyTargetMinutes: number): Promise<any> {
    if (dailyTargetMinutes < 0) {
      throw new BadRequestError('Budget cannot be negative');
    }
    return await this.repository.setBudget(userId, dailyTargetMinutes);
  }

  async logUrge(
    userId: string,
    redirectedAction: string,
    outcome: 'completed' | 'abandoned',
  ): Promise<any> {
    return await this.repository.logUrge({
      userId: new Types.ObjectId(userId),
      date: new Date(),
      redirectedAction,
      outcome,
    });
  }

  async startDetox(userId: string, targetDuration: number): Promise<any> {
    if (targetDuration <= 0) {
      throw new BadRequestError('Target duration must be greater than zero');
    }

    const active = await this.repository.getActiveDetoxSession(userId);
    if (active) {
      throw new BadRequestError('A detox session is already active');
    }

    return await this.repository.startDetoxSession({
      userId: new Types.ObjectId(userId),
      startTime: new Date(),
      targetDuration,
      completed: false,
    });
  }

  async endDetox(userId: string, completed: boolean, endedEarlyReason?: string): Promise<any> {
    const active = await this.repository.getActiveDetoxSession(userId);
    if (!active) {
      throw new NotFoundError('No active detox session found');
    }

    return await this.repository.endDetoxSession(
      active._id as Types.ObjectId,
      userId,
      completed,
      endedEarlyReason,
    );
  }

  async getSummary(userId: string): Promise<any> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const logs = await this.repository.getUsageLogsForDate(userId, todayStart, todayEnd);
    const totalUsageMinutes = logs.reduce((sum, log) => sum + log.durationMinutes, 0);

    const budget = await this.repository.getBudget(userId);
    const targetMinutes = budget ? budget.dailyTargetMinutes : 0;

    let progressPercentage = 0;
    if (targetMinutes > 0) {
      progressPercentage = Math.min((totalUsageMinutes / targetMinutes) * 100, 100);
    }

    return {
      totalUsageMinutes,
      targetMinutes,
      progressPercentage,
    };
  }

  async getUrgeInsights(userId: string): Promise<any> {
    const urges = await this.repository.getUrges(userId);
    if (urges.length === 0) {
      return { message: 'Not enough data' };
    }

    const totalUrges = urges.length;
    const completed = urges.filter((u) => u.outcome === 'completed').length;

    return {
      totalUrges,
      redirectedCompleted: completed,
      message: `You logged ${totalUrges} urges, ${completed} were redirected.`,
    };
  }
}
