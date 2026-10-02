import { DailyMission, IDailyMissionDocument } from '../models/daily-mission.model';
import { IDailyReview } from '../types/daily-mission.types';

export class DailyMissionRepository {
  async findByDate(userId: string, date: Date): Promise<IDailyMissionDocument | null> {
    return DailyMission.findOne({
      userId,
      date: date,
    }).exec();
  }

  async upsertMission(
    userId: string,
    date: Date,
    data: Partial<IDailyMissionDocument>,
  ): Promise<IDailyMissionDocument> {
    return DailyMission.findOneAndUpdate(
      { userId, date },
      { $set: { ...data, userId, date } },
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
