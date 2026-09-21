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
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';

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

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getUTCDay(); // 0 is Sunday, 1 is Monday...
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    d.setUTCDate(diff);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  private getStartOfMonth(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
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
    const result = await this.habitRepo.findByUser({
      userId,
      ...query,
    });

    if (result.habits.length === 0) {
      return result;
    }

    const today = this.getTodayDateOnly();
    const startOfWeek = this.getStartOfWeek(today);
    const startOfMonth = this.getStartOfMonth(today);

    const habitIds = result.habits.map((h) => h._id);
    const recentLogs = await this.historyRepo.getRecentCompletionsForHabits(habitIds, startOfMonth);

    const habitsWithStatus = result.habits.map((habit) => {
      const habitDoc = habit.toObject ? habit.toObject() : habit;
      let isCompleted = false;

      if (habit.frequency === 'Daily') {
        isCompleted = recentLogs.some(
          (log) =>
            log.habitId.toString() === habit._id.toString() &&
            log.completed &&
            new Date(log.completionDate).getTime() >= today.getTime(),
        );
      } else if (habit.frequency === 'Weekly') {
        isCompleted = recentLogs.some(
          (log) =>
            log.habitId.toString() === habit._id.toString() &&
            log.completed &&
            new Date(log.completionDate).getTime() >= startOfWeek.getTime(),
        );
      } else if (habit.frequency === 'Monthly') {
        isCompleted = recentLogs.some(
          (log) =>
            log.habitId.toString() === habit._id.toString() &&
            log.completed &&
            new Date(log.completionDate).getTime() >= startOfMonth.getTime(),
        );
      }

      return {
        ...habitDoc,
        isCompletedToday: isCompleted,
      };
    });

    return {
      ...result,
      habits: habitsWithStatus as unknown as IHabitDocument[],
    };
  }

  async getHabitById(userId: string, habitId: string): Promise<IHabitDocument> {
    const habit = await this.habitRepo.findById(habitId);
    if (!habit || habit.isDeleted) {
      throw new NotFoundError('Habit not found');
    }

    if (habit.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this habit');
    }

    const today = this.getTodayDateOnly();
    let periodStart = today;
    if (habit.frequency === 'Weekly') {
      periodStart = this.getStartOfWeek(today);
    } else if (habit.frequency === 'Monthly') {
      periodStart = this.getStartOfMonth(today);
    }

    const completedEntry = await this.historyRepo.getLatestCompletedEntry(habitId, periodStart);
    const habitDoc = habit.toObject ? habit.toObject() : habit;

    return {
      ...habitDoc,
      isCompletedToday: !!completedEntry,
    } as unknown as IHabitDocument;
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

    if (habit.isPaused) {
      throw new BadRequestError('Cannot complete a paused habit. Please resume it first.');
    }

    const today = this.getTodayDateOnly();
    let periodStart = today;
    let periodLabel = 'today';

    if (habit.frequency === 'Weekly') {
      periodStart = this.getStartOfWeek(today);
      periodLabel = 'this week';
    } else if (habit.frequency === 'Monthly') {
      periodStart = this.getStartOfMonth(today);
      periodLabel = 'this month';
    }

    const alreadyCompleted = await this.historyRepo.getLatestCompletedEntry(habitId, periodStart);
    if (alreadyCompleted) {
      throw new BadRequestError(`Habit has already been completed ${periodLabel}`);
    }

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

    const doc = updated.toObject ? updated.toObject() : updated;
    return {
      ...doc,
      isCompletedToday: true,
    } as unknown as IHabitDocument;
  }

  async skipHabit(userId: string, habitId: string): Promise<IHabitDocument> {
    const habit = await this.getHabitById(userId, habitId);
    if (habit.isPaused) {
      throw new BadRequestError('Cannot skip a paused habit.');
    }
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

    const doc = updated.toObject ? updated.toObject() : updated;
    return {
      ...doc,
      isCompletedToday: false,
    } as unknown as IHabitDocument;
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
