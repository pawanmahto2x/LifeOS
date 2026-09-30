import { Types } from 'mongoose';
import { LifeReplay, ILifeReplayDocument } from '../models/life-replay.model';
import { ReplayPeriod, IUserReflection } from '../types/life-replay.types';

export class LifeReplayRepository {
  async findByPeriod(
    userId: string | Types.ObjectId,
    period: ReplayPeriod,
    startDate: Date,
  ): Promise<ILifeReplayDocument | null> {
    return LifeReplay.findOne({ userId, period, startDate }).exec();
  }

  async upsertReplay(
    userId: string | Types.ObjectId,
    data: Partial<ILifeReplayDocument>,
  ): Promise<ILifeReplayDocument> {
    const query = { userId, period: data.period, startDate: data.startDate };
    return LifeReplay.findOneAndUpdate(
      query,
      { $set: data },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).exec();
  }

  async addUserReflection(
    userId: string | Types.ObjectId,
    replayId: string,
    reflection: IUserReflection,
  ): Promise<ILifeReplayDocument | null> {
    return LifeReplay.findOneAndUpdate(
      { _id: replayId, userId },
      { $set: { userReflection: reflection } },
      { new: true },
    ).exec();
  }

  async findRecent(
    userId: string | Types.ObjectId,
    period: ReplayPeriod,
    limit: number,
  ): Promise<ILifeReplayDocument[]> {
    return LifeReplay.find({ userId, period }).sort({ startDate: -1 }).limit(limit).exec();
  }

  async findAll(
    userId: string | Types.ObjectId,
    limit: number,
    skip: number,
  ): Promise<ILifeReplayDocument[]> {
    return LifeReplay.find({ userId }).sort({ generatedAt: -1 }).skip(skip).limit(limit).exec();
  }
}
