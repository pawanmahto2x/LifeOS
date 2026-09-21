import { HabitHistory, IHabitHistoryDocument } from '../models/habit-history.model';

export class HabitHistoryRepository {
  async recordEntry(
    habitId: string,
    userId: string,
    completionDate: Date,
    completed: boolean,
  ): Promise<IHabitHistoryDocument> {
    // Upsert entry for the given calendar day
    return HabitHistory.findOneAndUpdate(
      { habitId, userId, completionDate },
      { $set: { completed } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();
  }

  async getHistoryForHabit(habitId: string, limit = 60): Promise<IHabitHistoryDocument[]> {
    return HabitHistory.find({ habitId }).sort({ completionDate: -1 }).limit(limit).exec();
  }

  async countCompletions(habitId: string): Promise<number> {
    return HabitHistory.countDocuments({ habitId, completed: true }).exec();
  }

  async countTotalLogs(habitId: string): Promise<number> {
    return HabitHistory.countDocuments({ habitId }).exec();
  }

  async getRecentLogs(habitId: string, days = 30): Promise<IHabitHistoryDocument[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    return HabitHistory.find({ habitId, completionDate: { $gte: sinceDate } })
      .sort({ completionDate: 1 })
      .exec();
  }

  async getLatestCompletedEntry(
    habitId: string,
    since: Date,
  ): Promise<IHabitHistoryDocument | null> {
    return HabitHistory.findOne({
      habitId,
      completed: true,
      completionDate: { $gte: since },
    }).exec();
  }

  async getRecentCompletionsForHabits(
    habitIds: (string | import('mongoose').Types.ObjectId)[],
    since: Date,
  ): Promise<IHabitHistoryDocument[]> {
    return HabitHistory.find({
      habitId: { $in: habitIds },
      completed: true,
      completionDate: { $gte: since },
    }).exec();
  }

  async deleteEntry(habitId: string, since: Date): Promise<IHabitHistoryDocument | null> {
    return HabitHistory.findOneAndDelete({
      habitId,
      completionDate: { $gte: since },
    }).exec();
  }
}

export const habitHistoryRepository = new HabitHistoryRepository();
