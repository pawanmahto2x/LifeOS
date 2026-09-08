import { habitRepository, HabitRepository } from '../repositories/habit.repository';
import {
  habitHistoryRepository,
  HabitHistoryRepository,
} from '../repositories/habit-history.repository';
import { IHabitDocument } from '../models/habit.model';
import {
  ICreateHabitInput,
  IUpdateHabitInput,
  IQueryHabitsInput,
} from '../validators/habit.validator';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class HabitService {
  constructor(
    private habitRepo: HabitRepository = habitRepository,
    private historyRepo: HabitHistoryRepository = habitHistoryRepository,
  ) {}

  private getTodayDateOnly(): Date {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today;
  }

  async createHabit(userId: string, input: ICreateHabitInput): Promise<IHabitDocument> {
    return this.habitRepo.create({
      userId,
      ...input,
    });
  }

  async getHabits(
    userId: string,
    query: IQueryHabitsInput,
  ): Promise<{ habits: IHabitDocument[]; total: number; page: number; totalPages: number }> {
    return this.habitRepo.findByUser({
      userId,
      ...query,
    });
  }

  async getHabitById(userId: string, habitId: string): Promise<IHabitDocument> {
    const habit = await this.habitRepo.findById(habitId);
    if (!habit || habit.isDeleted) {
      throw new NotFoundError('Habit not found');
    }

    if (habit.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this habit');
    }

    return habit;
  }

  async updateHabit(
    userId: string,
    habitId: string,
    updateData: IUpdateHabitInput,
  ): Promise<IHabitDocument> {
    await this.getHabitById(userId, habitId);

    const updated = await this.habitRepo.updateById(habitId, updateData);
    if (!updated) {
      throw new NotFoundError('Habit not found');
    }

    return updated;
  }

  async completeHabit(userId: string, habitId: string): Promise<IHabitDocument> {
    const habit = await this.getHabitById(userId, habitId);
    const today = this.getTodayDateOnly();

    // 1. Record today's completion entry
    await this.historyRepo.recordEntry(habitId, userId, today, true);

    // 2. Recalculate streak and completion metrics
    const newStreak = habit.currentStreak + 1;
    const newLongest = Math.max(habit.longestStreak, newStreak);

    const totalCompletions = await this.historyRepo.countCompletions(habitId);
    const totalLogs = await this.historyRepo.countTotalLogs(habitId);
    const newCompletionRate =
      totalLogs > 0 ? Math.round((totalCompletions / totalLogs) * 100) : 100;

    const updated = await this.habitRepo.updateById(habitId, {
      currentStreak: newStreak,
      longestStreak: newLongest,
      completionRate: newCompletionRate,
    });

    if (!updated) {
      throw new NotFoundError('Habit not found');
    }

    return updated;
  }

  async skipHabit(userId: string, habitId: string): Promise<IHabitDocument> {
    await this.getHabitById(userId, habitId);
    const today = this.getTodayDateOnly();

    // Record skipped entry (completed: false)
    await this.historyRepo.recordEntry(habitId, userId, today, false);

    // Streak resets on skip, recalculate rate
    const totalCompletions = await this.historyRepo.countCompletions(habitId);
    const totalLogs = await this.historyRepo.countTotalLogs(habitId);
    const newCompletionRate = totalLogs > 0 ? Math.round((totalCompletions / totalLogs) * 100) : 0;

    const updated = await this.habitRepo.updateById(habitId, {
      currentStreak: 0,
      completionRate: newCompletionRate,
    });

    if (!updated) {
      throw new NotFoundError('Habit not found');
    }

    return updated;
  }

  async pauseHabit(userId: string, habitId: string): Promise<IHabitDocument> {
    await this.getHabitById(userId, habitId);

    const updated = await this.habitRepo.updateById(habitId, { isPaused: true });
    if (!updated) {
      throw new NotFoundError('Habit not found');
    }

    return updated;
  }

  async resumeHabit(userId: string, habitId: string): Promise<IHabitDocument> {
    await this.getHabitById(userId, habitId);

    const updated = await this.habitRepo.updateById(habitId, { isPaused: false });
    if (!updated) {
      throw new NotFoundError('Habit not found');
    }

    return updated;
  }

  async deleteHabit(userId: string, habitId: string): Promise<void> {
    await this.getHabitById(userId, habitId);
    await this.habitRepo.softDeleteById(habitId);
  }
}

export const habitService = new HabitService();
