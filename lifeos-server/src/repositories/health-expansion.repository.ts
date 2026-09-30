import { Types } from 'mongoose';
import { BodyMetric, IBodyMetricDocument } from '../models/body-metric.model';
import { ActivityLog, IActivityLogDocument } from '../models/activity-log.model';
import {
  MindfulnessSession,
  IMindfulnessSessionDocument,
} from '../models/mindfulness-session.model';
import { IBodyMetric, IActivityLog, IMindfulnessSession } from '../types/health.types';

export class HealthExpansionRepository {
  // Body Metrics
  async createBodyMetric(data: Partial<IBodyMetric>): Promise<IBodyMetricDocument> {
    const metric = new BodyMetric(data);
    return await metric.save();
  }

  async getBodyMetrics(userId: string | Types.ObjectId): Promise<IBodyMetricDocument[]> {
    return await BodyMetric.find({ userId }).sort({ recordedAt: -1 }).exec();
  }

  // Activity Log
  async createActivityLog(data: Partial<IActivityLog>): Promise<IActivityLogDocument> {
    const log = new ActivityLog(data);
    return await log.save();
  }

  async getActivityLogs(userId: string | Types.ObjectId): Promise<IActivityLogDocument[]> {
    return await ActivityLog.find({ userId }).sort({ date: -1 }).exec();
  }

  // Mindfulness Session
  async createMindfulnessSession(
    data: Partial<IMindfulnessSession>,
  ): Promise<IMindfulnessSessionDocument> {
    const session = new MindfulnessSession(data);
    return await session.save();
  }

  async getMindfulnessSessions(
    userId: string | Types.ObjectId,
  ): Promise<IMindfulnessSessionDocument[]> {
    return await MindfulnessSession.find({ userId }).sort({ date: -1 }).exec();
  }
}
