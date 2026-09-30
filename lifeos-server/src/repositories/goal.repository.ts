import { Goal, IGoalDocument } from '../models/goal.model';

export class GoalRepository {
  async create(data: Partial<IGoalDocument>): Promise<IGoalDocument> {
    const goal = new Goal(data);
    return await goal.save();
  }

  async findById(id: string, userId: string): Promise<IGoalDocument | null> {
    return await Goal.findOne({ _id: id, userId }).exec();
  }

  async findAllByUser(userId: string): Promise<IGoalDocument[]> {
    return await Goal.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async update(
    id: string,
    userId: string,
    data: Partial<IGoalDocument>,
  ): Promise<IGoalDocument | null> {
    return await Goal.findOneAndUpdate({ _id: id, userId }, data, { new: true }).exec();
  }

  async delete(id: string, userId: string): Promise<IGoalDocument | null> {
    return await Goal.findOneAndDelete({ _id: id, userId }).exec();
  }

  async updateMilestone(
    id: string,
    userId: string,
    milestoneId: string,
    data: Partial<any>,
  ): Promise<IGoalDocument | null> {
    const updateQuery: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      updateQuery[`milestones.$.${key}`] = value;
    }
    return await Goal.findOneAndUpdate(
      { _id: id, userId, 'milestones._id': milestoneId },
      { $set: updateQuery },
      { new: true },
    ).exec();
  }
}
