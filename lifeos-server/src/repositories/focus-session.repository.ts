import { FocusSession, FocusSessionDocument } from '../models/focus-session.model';
import { ICreateFocusSessionDto, IFocusSessionFilterOptions } from '../types/focus.types';

export interface IUpdateFocusSessionDto {
  duration?: number;
  completed?: boolean;
  distractions?: number;
  endedAt?: Date;
  notes?: string;
}

export class FocusSessionRepository {
  async create(data: ICreateFocusSessionDto): Promise<FocusSessionDocument> {
    const session = new FocusSession({
      ...data,
      startedAt: data.startedAt || new Date(),
      completed: false,
    });
    return session.save();
  }

  async findById(id: string): Promise<FocusSessionDocument | null> {
    return FocusSession.findById(id).populate('taskId', 'title priority status').exec();
  }

  async findActiveSession(userId: string): Promise<FocusSessionDocument | null> {
    return FocusSession.findOne({
      userId,
      completed: false,
      endedAt: { $exists: false },
    })
      .populate('taskId', 'title priority status')
      .sort({ startedAt: -1 })
      .exec();
  }

  async findByUser(options: IFocusSessionFilterOptions): Promise<{
    sessions: FocusSessionDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { userId, taskId, completed, startDate, endDate, page = 1, limit = 20 } = options;

    const filter: Record<string, unknown> = { userId };

    if (taskId) {
      filter.taskId = taskId;
    }

    if (completed !== undefined) {
      filter.completed = completed;
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      filter.startedAt = dateFilter;
    }

    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      FocusSession.find(filter)
        .populate('taskId', 'title priority status')
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      FocusSession.countDocuments(filter).exec(),
    ]);

    return {
      sessions,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FocusSessionDocument[]> {
    return FocusSession.find({
      userId,
      startedAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ startedAt: -1 })
      .exec();
  }

  async update(id: string, data: IUpdateFocusSessionDto): Promise<FocusSessionDocument | null> {
    return FocusSession.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .populate('taskId', 'title priority status')
      .exec();
  }

  async delete(id: string): Promise<FocusSessionDocument | null> {
    return FocusSession.findByIdAndDelete(id).exec();
  }
}
