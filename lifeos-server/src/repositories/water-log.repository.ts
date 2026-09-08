import { WaterLog, WaterLogDocument } from '../models/water-log.model';
import { WaterUnit } from '../types/health.types';

export interface ICreateWaterLogDto {
  userId: string;
  amount: number;
  unit: WaterUnit;
  loggedAt?: Date;
}

export interface IUpdateWaterLogDto {
  amount?: number;
  unit?: WaterUnit;
  loggedAt?: Date;
}

export interface IWaterLogFilterOptions {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class WaterLogRepository {
  async create(data: ICreateWaterLogDto): Promise<WaterLogDocument> {
    const log = new WaterLog(data);
    return log.save();
  }

  async findById(id: string): Promise<WaterLogDocument | null> {
    return WaterLog.findById(id).exec();
  }

  async findByUser(
    options: IWaterLogFilterOptions,
  ): Promise<{ logs: WaterLogDocument[]; total: number; page: number; totalPages: number }> {
    const { userId, startDate, endDate, page = 1, limit = 20 } = options;

    const filter: Record<string, unknown> = { userId };

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      filter.loggedAt = dateFilter;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      WaterLog.find(filter).sort({ loggedAt: -1 }).skip(skip).limit(limit).exec(),
      WaterLog.countDocuments(filter).exec(),
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
  ): Promise<WaterLogDocument[]> {
    return WaterLog.find({
      userId,
      loggedAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ loggedAt: -1 })
      .exec();
  }

  async update(id: string, data: IUpdateWaterLogDto): Promise<WaterLogDocument | null> {
    return WaterLog.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    ).exec();
  }

  async delete(id: string): Promise<WaterLogDocument | null> {
    return WaterLog.findByIdAndDelete(id).exec();
  }
}
