import { DailyMission, IDailyMissionDocument } from '../models/daily-mission.model';
import { IDailyReview } from '../types/daily-mission.types';

export class DailyMissionRepository {
  async findByDate(userId: string, date: Date): Promise<IDailyMissionDocument | null> {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return DailyMission.findOne({
      userId,
      date: targetDate,
    }).exec();
  }

  async findToday(userId: string): Promise<IDailyMissionDocument | null> {
    return this.findByDate(userId, new Date());
  }

  async upsertMission(
    userId: string,
    date: Date,
    data: Partial<IDailyMissionDocument>,
  ): Promise<IDailyMissionDocument> {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return DailyMission.findOneAndUpdate(
      { userId, date: targetDate },
      { $set: { ...data, userId, date: targetDate } },
      { new: true, upsert: true },
    ).exec();
  }

  async updateReview(
    userId: string,
    missionId: string,
    review: IDailyReview,
  ): Promise<IDailyMissionDocument | null> {
    return DailyMission.findOneAndUpdate(
      { _id: missionId, userId },
      { $set: { review, status: 'completed' } },
      { new: true },
    ).exec();
  }

  async findHistory(userId: string, limit: number): Promise<IDailyMissionDocument[]> {
    return DailyMission.find({ userId }).sort({ date: -1 }).limit(limit).exec();
  }
}
