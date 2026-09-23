import {
  FocusSessionRepository,
  IUpdateFocusSessionDto,
} from '../repositories/focus-session.repository';
import { TaskRepository } from '../repositories/task.repository';
import { FocusSessionDocument } from '../models/focus-session.model';
import {
  ICreateFocusSessionDto,
  IEndFocusSessionDto,
  IFocusSessionFilterOptions,
  FocusAnalyticsSummary,
} from '../types/focus.types';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class FocusService {
  private focusRepo: FocusSessionRepository;
  private taskRepo: TaskRepository;

  constructor(focusRepo?: FocusSessionRepository, taskRepo?: TaskRepository) {
    this.focusRepo = focusRepo || new FocusSessionRepository();
    this.taskRepo = taskRepo || new TaskRepository();
  }

  async startSession(
    userId: string,
    data: { taskId?: string; duration: number; startedAt?: Date },
  ): Promise<FocusSessionDocument> {
    if (data.taskId) {
      const task = await this.taskRepo.findById(data.taskId);
      if (!task || task.isDeleted) {
        throw new NotFoundError('Task not found');
      }
      if (task.userId.toString() !== userId) {
        throw new ForbiddenError('You do not have permission to attach this task');
      }
    }

    const createData: ICreateFocusSessionDto = {
      userId,
      taskId: data.taskId,
      duration: data.duration,
      startedAt: data.startedAt || new Date(),
    };

    return this.focusRepo.create(createData);
  }

  async getCurrentSession(userId: string): Promise<FocusSessionDocument | null> {
    return this.focusRepo.findActiveSession(userId);
  }

  async endSession(userId: string, data: IEndFocusSessionDto): Promise<FocusSessionDocument> {
    const session = await this.focusRepo.findById(data.sessionId);
    if (!session) {
      throw new NotFoundError('Focus session not found');
    }
    if (session.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to end this focus session');
    }

    const now = new Date();
    const elapsedMinutes = Math.max(
      1,
      Math.round((now.getTime() - new Date(session.startedAt).getTime()) / (1000 * 60)),
    );

    const updateData: IUpdateFocusSessionDto = {
      endedAt: now,
      completed: data.completed !== undefined ? data.completed : true,
      duration: data.completed ? session.duration : elapsedMinutes,
      distractions: data.distractions !== undefined ? data.distractions : session.distractions,
      notes: data.notes !== undefined ? data.notes : session.notes,
    };

    const updated = await this.focusRepo.update(data.sessionId, updateData);
    if (!updated) {
      throw new NotFoundError('Focus session not found');
    }
    return updated;
  }

  async getSessions(
    userId: string,
    options: {
      taskId?: string;
      completed?: boolean;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    sessions: FocusSessionDocument[];
    total: number;
    page: number;
    totalPages: number;
    analytics: FocusAnalyticsSummary;
  }> {
    const filterOptions: IFocusSessionFilterOptions = {
      userId,
      taskId: options.taskId,
      completed: options.completed,
      startDate: options.startDate,
      endDate: options.endDate,
      page: options.page,
      limit: options.limit,
    };

    const paginated = await this.focusRepo.findByUser(filterOptions);

    // Calculate today's analytics
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [todaySessions, activeSession, allUserSessions] = await Promise.all([
      this.focusRepo.findByDateRange(userId, startOfToday, endOfToday),
      this.focusRepo.findActiveSession(userId),
      this.focusRepo.findByUser({ userId, limit: 1000 }),
    ]);

    const todayCompleted = todaySessions.filter((s) => s.completed);
    const todayFocusMinutes = todayCompleted.reduce((sum, s) => sum + s.duration, 0);
    const todayDistractions = todaySessions.reduce((sum, s) => sum + (s.distractions || 0), 0);

    const totalCompleted = allUserSessions.sessions.filter((s) => s.completed);
    const totalFocusMinutes = totalCompleted.reduce((sum, s) => sum + s.duration, 0);

    const analytics: FocusAnalyticsSummary = {
      todayFocusMinutes,
      todayCompletedSessions: todayCompleted.length,
      todayDistractions,
      totalFocusMinutes,
      totalCompletedSessions: totalCompleted.length,
      currentRunningSession: activeSession,
    };

    return {
      ...paginated,
      analytics,
    };
  }

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.focusRepo.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Focus session not found');
    }
    if (session.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to delete this focus session');
    }

    await this.focusRepo.delete(sessionId);
  }
}
