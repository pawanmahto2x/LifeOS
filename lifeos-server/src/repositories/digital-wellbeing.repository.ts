import { Types } from 'mongoose';
import { UsageLogModel, IUsageLogDocument } from '../models/usage-log.model';
import { DigitalBudgetModel, IDigitalBudgetDocument } from '../models/digital-budget.model';
import {
  UrgeInterventionModel,
  IUrgeInterventionDocument,
} from '../models/urge-intervention.model';
import { DetoxSessionModel, IDetoxSessionDocument } from '../models/detox-session.model';
import { IUsageLog, IUrgeIntervention, IDetoxSession } from '../types/digital-wellbeing.types';

export class DigitalWellbeingRepository {
  async logUsage(data: Omit<IUsageLog, '_id'>): Promise<IUsageLogDocument> {
    return await UsageLogModel.create(data);
  }

  async getUsageLogsForDate(
    userId: string | Types.ObjectId,
    startDate: Date,
    endDate: Date,
  ): Promise<IUsageLogDocument[]> {
    return await UsageLogModel.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).exec();
  }

  async setBudget(
    userId: string | Types.ObjectId,
    dailyTargetMinutes: number,
  ): Promise<IDigitalBudgetDocument> {
    return (await DigitalBudgetModel.findOneAndUpdate(
      { userId },
      { userId, dailyTargetMinutes },
      { upsert: true, new: true },
    ).exec()) as IDigitalBudgetDocument;
  }

  async getBudget(userId: string | Types.ObjectId): Promise<IDigitalBudgetDocument | null> {
    return await DigitalBudgetModel.findOne({ userId }).exec();
  }

  async logUrge(data: Omit<IUrgeIntervention, '_id'>): Promise<IUrgeInterventionDocument> {
    return await UrgeInterventionModel.create(data);
  }

  async getUrges(userId: string | Types.ObjectId): Promise<IUrgeInterventionDocument[]> {
    return await UrgeInterventionModel.find({ userId }).sort({ date: -1 }).exec();
  }

  async startDetoxSession(data: Omit<IDetoxSession, '_id'>): Promise<IDetoxSessionDocument> {
    return await DetoxSessionModel.create(data);
  }

  async getActiveDetoxSession(
    userId: string | Types.ObjectId,
  ): Promise<IDetoxSessionDocument | null> {
    return await DetoxSessionModel.findOne({ userId, endTime: { $exists: false } })
      .sort({ startTime: -1 })
      .exec();
  }

  async endDetoxSession(
    sessionId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    completed: boolean,
    endedEarlyReason?: string,
    endTime?: Date,
  ): Promise<IDetoxSessionDocument | null> {
    return await DetoxSessionModel.findOneAndUpdate(
      { _id: sessionId, userId },
      {
        $set: {
          completed,
          endedEarlyReason,
          endTime: endTime || new Date(),
        },
      },
      { new: true },
    ).exec();
  }
}
