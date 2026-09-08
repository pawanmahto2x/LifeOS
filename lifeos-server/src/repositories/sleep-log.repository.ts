import { SleepLog, SleepLogDocument } from '../models/sleep-log.model';
import { SleepQuality } from '../types/health.types';

export interface ICreateSleepLogDto {
  userId: string;
  sleepTime: Date;
  wakeTime: Date;
  duration: number; // in minutes
  quality: SleepQuality;
  notes?: string;
}

export interface IUpdateSleepLogDto {
  sleepTime?: Date;
  wakeTime?: Date;
  duration?: number;
  quality?: SleepQuality;
  notes?: string;
}

export interface ISleepLogFilterOptions {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class SleepLogRepository {
  async create(data: ICreateSleepLogDto): Promise<SleepLogDocument> {
    const log = new SleepLog(data);
    return log.save();
  }

  async findById(id: string): Promise<SleepLogDocument | null> {
    return SleepLog.findById(id).exec();
  }

  async findLatest(userId: string): Promise<SleepLogDocument | null> {
    return SleepLog.findOne({ userId }).sort({ sleepTime: -1 }).exec();
  }

  async findByUser(
    options: ISleepLogFilterOptions,
  ): Promise<{ logs: SleepLogDocument[]; total: number; page: number; totalPages: number }> {
    const { userId, startDate, endDate, page = 1, limit = 20 } = options;

    const filter: Record<string, unknown> = { userId };

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      filter.sleepTime = dateFilter;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      SleepLog.find(filter).sort({ sleepTime: -1 }).skip(skip).limit(limit).exec(),
      SleepLog.countDocuments(filter).exec(),
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
  ): Promise<SleepLogDocument[]> {
    return SleepLog.find({
      userId,
      sleepTime: { $gte: startDate, $lte: endDate },
    })
      .sort({ sleepTime: -1 })
      .exec();
  }

  async update(id: string, data: IUpdateSleepLogDto): Promise<SleepLogDocument | null> {
    return SleepLog.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    ).exec();
  }

  async delete(id: string): Promise<SleepLogDocument | null> {
    return SleepLog.findByIdAndDelete(id).exec();
  }
}
