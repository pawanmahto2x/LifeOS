import { MoodLog, MoodLogDocument } from '../models/mood-log.model';
import { MoodType } from '../types/health.types';

export interface ICreateMoodLogDto {
  userId: string;
  mood: MoodType;
  moodScore: number;
  note?: string;
  loggedAt?: Date;
}

export interface IUpdateMoodLogDto {
  mood?: MoodType;
  moodScore?: number;
  note?: string;
  loggedAt?: Date;
}

export interface IMoodLogFilterOptions {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  mood?: MoodType;
  page?: number;
  limit?: number;
}

export class MoodLogRepository {
  async create(data: ICreateMoodLogDto): Promise<MoodLogDocument> {
    const log = new MoodLog(data);
    return log.save();
  }

  async findById(id: string): Promise<MoodLogDocument | null> {
    return MoodLog.findById(id).exec();
  }

  async findLatest(userId: string): Promise<MoodLogDocument | null> {
    return MoodLog.findOne({ userId }).sort({ loggedAt: -1 }).exec();
  }

  async findByUser(
    options: IMoodLogFilterOptions,
  ): Promise<{ logs: MoodLogDocument[]; total: number; page: number; totalPages: number }> {
    const { userId, startDate, endDate, mood, page = 1, limit = 20 } = options;

    const filter: Record<string, unknown> = { userId };

    if (mood) {
      filter.mood = mood;
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      filter.loggedAt = dateFilter;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      MoodLog.find(filter).sort({ loggedAt: -1 }).skip(skip).limit(limit).exec(),
      MoodLog.countDocuments(filter).exec(),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MoodLogDocument[]> {
    return MoodLog.find({
      userId,
      loggedAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ loggedAt: -1 })
      .exec();
  }

  async update(id: string, data: IUpdateMoodLogDto): Promise<MoodLogDocument | null> {
    return MoodLog.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<MoodLogDocument | null> {
    return MoodLog.findByIdAndDelete(id).exec();
  }
}
