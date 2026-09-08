import { ScreenTimeLog, ScreenTimeLogDocument } from '../models/screen-time-log.model';
import { ILogScreenTimeDto } from '../types/digital-detox.types';

export class ScreenTimeLogRepository {
  async create(data: ILogScreenTimeDto): Promise<ScreenTimeLogDocument> {
    const log = new ScreenTimeLog({
      ...data,
      loggedDate: data.loggedDate || new Date(),
    });
    return log.save();
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ScreenTimeLogDocument[]> {
    return ScreenTimeLog.find({
      userId,
      loggedDate: { $gte: startDate, $lte: endDate },
    })
      .sort({ loggedDate: -1 })
      .exec();
  }

  async findByUser(userId: string, limit = 50): Promise<ScreenTimeLogDocument[]> {
    return ScreenTimeLog.find({ userId }).sort({ loggedDate: -1 }).limit(limit).exec();
  }

  async delete(id: string): Promise<ScreenTimeLogDocument | null> {
    return ScreenTimeLog.findByIdAndDelete(id).exec();
  }
}
