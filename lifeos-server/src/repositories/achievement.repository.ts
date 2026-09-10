import { Achievement, AchievementDocument } from '../models/achievement.model';

export class AchievementRepository {
  async findByUserId(userId: string): Promise<AchievementDocument[]> {
    return Achievement.find({ userId }).sort({ unlockedAt: -1 }).exec();
  }

  async findByBadge(userId: string, badgeId: string): Promise<AchievementDocument | null> {
    return Achievement.findOne({ userId, badgeId }).exec();
  }

  async findById(id: string, userId: string): Promise<AchievementDocument | null> {
    return Achievement.findOne({ _id: id, userId }).exec();
  }

  async unlockBadge(
    userId: string,
    badgeId: string,
    badgeName: string,
    category: string,
  ): Promise<AchievementDocument | null> {
    try {
      const doc = new Achievement({
        userId,
        badgeId,
        badgeName,
        category,
        unlockedAt: new Date(),
      });
      return await doc.save();
    } catch {
      // If already unlocked (duplicate index error), ignore safely
      return null;
    }
  }

  async countUnlocked(userId: string): Promise<number> {
    return Achievement.countDocuments({ userId }).exec();
  }
}
