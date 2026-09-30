import { Types } from 'mongoose';
import { PersonalBaseline } from '../models/personal-baseline.model';
import { BehaviourInsight } from '../models/behaviour-insight.model';
import { BaselinePeriod, IPersonalBaseline, IBehaviourInsight } from '../types/insights.types';

export class InsightsRepository {
  async upsertBaseline(
    userId: Types.ObjectId | string,
    period: BaselinePeriod,
    data: Partial<IPersonalBaseline>,
  ) {
    return PersonalBaseline.findOneAndUpdate(
      { userId, period },
      { $set: data },
      { new: true, upsert: true },
    ).exec();
  }

  async findBaseline(userId: Types.ObjectId | string, period: BaselinePeriod) {
    return PersonalBaseline.findOne({ userId, period }).exec();
  }

  async findAllBaselines(userId: Types.ObjectId | string) {
    return PersonalBaseline.find({ userId }).exec();
  }

  async saveInsights(userId: Types.ObjectId | string, insights: Partial<IBehaviourInsight>[]) {
    await this.deactivateOldInsights(userId);
    return BehaviourInsight.insertMany(insights.map((i) => ({ ...i, userId })));
  }

  async findActiveInsights(userId: Types.ObjectId | string) {
    return BehaviourInsight.find({ userId, isActive: true }).exec();
  }

  async deactivateOldInsights(userId: Types.ObjectId | string) {
    return BehaviourInsight.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false } },
    ).exec();
  }
}
