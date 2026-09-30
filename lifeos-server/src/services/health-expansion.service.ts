import { Types } from 'mongoose';
import { HealthExpansionRepository } from '../repositories/health-expansion.repository';
import { IBodyMetric, IActivityLog, IMindfulnessSession, MoodType } from '../types/health.types';
import { BadRequestError } from '../utils/errors';

export class HealthExpansionService {
  constructor(private repository: HealthExpansionRepository = new HealthExpansionRepository()) {}

  async addBodyMetric(
    userId: string | Types.ObjectId,
    height: number,
    weight: number,
  ): Promise<IBodyMetric> {
    if (height <= 0 || weight <= 0) throw new BadRequestError('Invalid height or weight');
    const heightInMeters = height / 100;
    const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(2));

    return await this.repository.createBodyMetric({
      userId: new Types.ObjectId(userId.toString()),
      height,
      weight,
      bmi,
      recordedAt: new Date(),
    });
  }

  async getBodyMetrics(userId: string | Types.ObjectId) {
    return await this.repository.getBodyMetrics(userId);
  }

  async addActivityLog(
    userId: string | Types.ObjectId,
    data: Partial<IActivityLog>,
  ): Promise<IActivityLog> {
    return await this.repository.createActivityLog({
      ...data,
      userId: new Types.ObjectId(userId.toString()),
    });
  }

  async getActivitySummary(userId: string | Types.ObjectId) {
    const logs = await this.repository.getActivityLogs(userId);
    if (!logs.length) return { message: 'Not enough data' };

    const summary: Record<string, number> = {};
    logs.forEach((log) => {
      summary[log.type] = (summary[log.type] || 0) + log.duration;
    });

    return { totalDurationByType: summary };
  }

  async addMindfulnessSession(
    userId: string | Types.ObjectId,
    data: Partial<IMindfulnessSession>,
  ): Promise<IMindfulnessSession> {
    return await this.repository.createMindfulnessSession({
      ...data,
      userId: new Types.ObjectId(userId.toString()),
    });
  }

  async getMindfulnessInsight(userId: string | Types.ObjectId) {
    const sessions = await this.repository.getMindfulnessSessions(userId);
    if (sessions.length === 0) return { insight: 'Not enough data' };

    const moodScores: Record<MoodType, number> = {
      Excellent: 7,
      Happy: 6,
      Calm: 5,
      Neutral: 4,
      Stressed: 3,
      Sad: 2,
      Angry: 1,
    };

    let improvedCount = 0;
    sessions.forEach((session) => {
      if (session.moodBefore && session.moodAfter) {
        const before = moodScores[session.moodBefore];
        const after = moodScores[session.moodAfter];
        if (after > before) {
          improvedCount++;
        }
      }
    });

    return {
      insight: `Your recorded mood was higher after ${improvedCount} of these sessions.`,
      improvedSessions: improvedCount,
      totalSessionsWithMoods: sessions.filter((s) => s.moodBefore && s.moodAfter).length,
    };
  }
}
