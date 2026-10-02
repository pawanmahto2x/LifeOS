import { habitRepository, HabitRepository } from '../repositories/habit.repository';
import {
  habitHistoryRepository,
  HabitHistoryRepository,
} from '../repositories/habit-history.repository';
import { IHabitDocument } from '../models/habit.model';
import { TimezoneUtil } from '../utils/timezone.util';
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

    const tz = await TimezoneUtil.getUserTimezone(userId);
    const today = TimezoneUtil.getStartOfDayUTCForTimezone(tz);
    const startOfWeek = TimezoneUtil.getStartOfWeekForTimezone(today);
    const startOfMonth = TimezoneUtil.getStartOfMonthForTimezone(today);

    // If the week spans two months (e.g. Sep 28 - Oct 4), we must fetch from the earlier date!
    const fetchSince = new Date(Math.min(startOfWeek.getTime(), startOfMonth.getTime()));

    const habitIds = result.habits.map((h) => h._id);
    const recentLogs = await this.historyRepo.getRecentCompletionsForHabits(habitIds, fetchSince);

    const habitsWithStatus = result.habits.map((habit) => {
      const habitDoc = habit.toObject ? habit.toObject() : habit;
      let isCompletedToday = false;

      const completedToday = recentLogs.some(
        (log) =>
          log.habitId.toString() === habit._id.toString() &&
          log.completed &&
          new Date(log.completionDate).getTime() === today.getTime(),
      );

      if (completedToday) {
        isCompletedToday = true;
      } else {
        if (habit.frequency === 'Daily') {
          isCompletedToday = false;
        } else if (habit.frequency === 'Weekly') {
          const completionsThisWeek = recentLogs.filter(
            (log) =>
              log.habitId.toString() === habit._id.toString() &&
              log.completed &&
              new Date(log.completionDate).getTime() >= startOfWeek.getTime(),
          ).length;
          isCompletedToday = completionsThisWeek >= (habit.targetDays || 1);
        } else if (habit.frequency === 'Monthly') {
          const completionsThisMonth = recentLogs.filter(
            (log) =>
              log.habitId.toString() === habit._id.toString() &&
              log.completed &&
              new Date(log.completionDate).getTime() >= startOfMonth.getTime(),
          ).length;
          isCompletedToday = completionsThisMonth >= (habit.targetDays || 1);
        }
      }

      return {
        ...habitDoc,
        isCompletedToday,
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

    const tz = await TimezoneUtil.getUserTimezone(userId);
    const today = TimezoneUtil.getStartOfDayUTCForTimezone(tz);
    let periodStart = today;
    if (habit.frequency === 'Weekly') {
      periodStart = TimezoneUtil.getStartOfWeekForTimezone(today);
    } else if (habit.frequency === 'Monthly') {
      periodStart = TimezoneUtil.getStartOfMonthForTimezone(today);
    }

    const recentLogs = await this.historyRepo.getRecentCompletionsForHabits([habitId], periodStart);

    let isCompletedToday = false;
    const completedToday = recentLogs.some(
      (log) => log.completed && new Date(log.completionDate).getTime() === today.getTime(),
    );

    if (completedToday) {
      isCompletedToday = true;
    } else {
      if (habit.frequency === 'Daily') {
        isCompletedToday = false;
      } else if (habit.frequency === 'Weekly') {
        const completionsThisWeek = recentLogs.filter(
          (log) => log.completed && new Date(log.completionDate).getTime() >= periodStart.getTime(),
        ).length;
        isCompletedToday = completionsThisWeek >= (habit.targetDays || 1);
      } else if (habit.frequency === 'Monthly') {
        const completionsThisMonth = recentLogs.filter(
          (log) => log.completed && new Date(log.completionDate).getTime() >= periodStart.getTime(),
        ).length;
        isCompletedToday = completionsThisMonth >= (habit.targetDays || 1);
      }
    }

    const habitDoc = habit.toObject ? habit.toObject() : habit;

    return {
      ...habitDoc,
      isCompletedToday,
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

    const tz = await TimezoneUtil.getUserTimezone(userId);
    const today = TimezoneUtil.getStartOfDayUTCForTimezone(tz);

    // 1. Check if already completed TODAY
    const completedToday = await this.historyRepo.getLatestCompletedEntry(habitId, today);
    if (completedToday && new Date(completedToday.completionDate).getTime() === today.getTime()) {
      throw new BadRequestError(`Habit has already been logged for today`);
    }

    // 2. Check if period targets are already met (Optional: block over-completion?)
    // In LifeOS, they might want to exceed target. The prompt says:
    // "Once 3/3 is reached, additional completion attempts for that week's target should follow the intended product semantics."
    // Let's just allow it, or just log it. The main constraint is one per calendar day, which we checked above!

    // 3. Record today's completion entry
    await this.historyRepo.recordEntry(habitId, userId, today, true);

    // 4. Recalculate streak and completion metrics
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
    const tz = await TimezoneUtil.getUserTimezone(userId);
    const today = TimezoneUtil.getStartOfDayUTCForTimezone(tz);

    // Record skipped entry (completed: false)
    await this.historyRepo.recordEntry(habitId, userId, today, false);

    // Streak is maintained on skip, but completion rate is recalculated
    const totalCompletions = await this.historyRepo.countCompletions(habitId);
    const totalLogs = await this.historyRepo.countTotalLogs(habitId);
    const newCompletionRate = totalLogs > 0 ? Math.round((totalCompletions / totalLogs) * 100) : 0;

    const updated = await this.habitRepo.updateById(habitId, {
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

  async undoHabit(userId: string, habitId: string): Promise<IHabitDocument> {
    const habit = await this.getHabitById(userId, habitId);

    const tz = await TimezoneUtil.getUserTimezone(userId);
    const today = TimezoneUtil.getStartOfDayUTCForTimezone(tz);

    // Undo should only delete TODAY's entry! Not any entry since the start of the week!
    const deletedEntry = await this.historyRepo.deleteEntry(habitId, today);
    if (!deletedEntry) {
      throw new BadRequestError('No habit entry recorded for today to undo');
    }

    // If reverting a completed action, decrement current streak
    const newStreak = deletedEntry.completed
      ? Math.max(0, habit.currentStreak - 1)
      : habit.currentStreak;

    const totalCompletions = await this.historyRepo.countCompletions(habitId);
    const totalLogs = await this.historyRepo.countTotalLogs(habitId);
    const newCompletionRate = totalLogs > 0 ? Math.round((totalCompletions / totalLogs) * 100) : 0;

    const updated = await this.habitRepo.updateById(habitId, {
      currentStreak: newStreak,
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
