import { describe, it } from 'node:test';
import assert from 'node:assert';
import { HabitService } from '../src/services/habit.service';
import { HabitRepository } from '../src/repositories/habit.repository';
import { HabitHistoryRepository } from '../src/repositories/habit-history.repository';
import { IHabitDocument } from '../src/models/habit.model';
import { IHabitHistoryDocument } from '../src/models/habit-history.model';
import {
  ICreateHabitDto,
  IUpdateHabitDto,
  IHabitFilterOptions,
  HabitFrequency,
} from '../src/types/habit.types';
import { Types } from 'mongoose';

class MockHabitRepository extends HabitRepository {
  private habits: Map<string, IHabitDocument> = new Map();

  async create(data: ICreateHabitDto): Promise<IHabitDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      userId: new Types.ObjectId(data.userId),
      title: data.title,
      frequency: (data.frequency || 'Daily') as HabitFrequency,
      reminderTime: data.reminderTime,
      targetDays: data.targetDays || 7,
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      isPaused: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as IHabitDocument;

    this.habits.set(id.toString(), doc);
    return doc;
  }

  async findById(id: string): Promise<IHabitDocument | null> {
    return this.habits.get(id) || null;
  }

  async findByUser(
    options: IHabitFilterOptions,
  ): Promise<{ habits: IHabitDocument[]; total: number; page: number; totalPages: number }> {
    const all = Array.from(this.habits.values()).filter(
      (h) => h.userId.toString() === options.userId && !h.isDeleted,
    );

    let filtered = all;
    if (options.frequency) {
      filtered = filtered.filter((h) => h.frequency === options.frequency);
    }
    if (typeof options.isPaused === 'boolean') {
      filtered = filtered.filter((h) => h.isPaused === options.isPaused);
    }

    return {
      habits: filtered,
      total: filtered.length,
      page: options.page || 1,
      totalPages: 1,
    };
  }

  async updateById(id: string, updateData: IUpdateHabitDto): Promise<IHabitDocument | null> {
    const habit = this.habits.get(id);
    if (!habit) return null;
    Object.assign(habit, updateData, { updatedAt: new Date() });
    return habit;
  }

  async softDeleteById(id: string): Promise<boolean> {
    const habit = this.habits.get(id);
    if (!habit) return false;
    habit.isDeleted = true;
    return true;
  }
}

class MockHabitHistoryRepository extends HabitHistoryRepository {
  private history: IHabitHistoryDocument[] = [];

  async recordEntry(
    habitId: string,
    userId: string,
    completionDate: Date,
    completed: boolean,
  ): Promise<IHabitHistoryDocument> {
    const existingIndex = this.history.findIndex(
      (h) =>
        h.habitId.toString() === habitId &&
        h.completionDate.getTime() === completionDate.getTime(),
    );

    const doc = {
      _id: new Types.ObjectId(),
      habitId: new Types.ObjectId(habitId),
      userId: new Types.ObjectId(userId),
      completed,
      completionDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as IHabitHistoryDocument;

    if (existingIndex >= 0) {
      this.history[existingIndex] = doc;
    } else {
      this.history.push(doc);
    }

    return doc;
  }

  async countCompletions(habitId: string): Promise<number> {
    return this.history.filter((h) => h.habitId.toString() === habitId && h.completed).length;
  }

  async countTotalLogs(habitId: string): Promise<number> {
    return this.history.filter((h) => h.habitId.toString() === habitId).length;
  }
}

describe('Phase 5 - Habit Tracking Service Unit Tests', () => {
  const habitRepo = new MockHabitRepository();
  const historyRepo = new MockHabitHistoryRepository();
  const habitService = new HabitService(habitRepo, historyRepo);

  const userA = new Types.ObjectId().toString();
  const userB = new Types.ObjectId().toString();

  let habitId: string;

  it('should create a habit with default 0 streak and 0% completion rate', async () => {
    const habit = await habitService.createHabit(userA, {
      title: 'Drink 2L of Water',
      frequency: 'Daily',
      targetDays: 7,
      reminderTime: '08:00',
    });

    assert.ok(habit._id);
    assert.strictEqual(habit.title, 'Drink 2L of Water');
    assert.strictEqual(habit.currentStreak, 0);
    assert.strictEqual(habit.longestStreak, 0);
    assert.strictEqual(habit.completionRate, 0);
    assert.strictEqual(habit.isPaused, false);
    assert.strictEqual(habit.isDeleted, false);

    habitId = habit._id.toString();
  });

  it('should prevent cross-user access to habit details', async () => {
    await assert.rejects(
      async () => {
        await habitService.getHabitById(userB, habitId);
      },
      {
        name: 'ForbiddenError',
      },
    );
  });

  it('should complete habit, increment streak and update completion rate', async () => {
    const completed = await habitService.completeHabit(userA, habitId);

    assert.strictEqual(completed.currentStreak, 1);
    assert.strictEqual(completed.longestStreak, 1);
    assert.strictEqual(completed.completionRate, 100);
  });

  it('should pause and resume a habit correctly', async () => {
    const paused = await habitService.pauseHabit(userA, habitId);
    assert.strictEqual(paused.isPaused, true);

    const resumed = await habitService.resumeHabit(userA, habitId);
    assert.strictEqual(resumed.isPaused, false);
  });

  it('should reset current streak upon skipping a habit', async () => {
    // Create a new habit to test skip reset
    const newHabit = await habitService.createHabit(userA, {
      title: 'Morning Meditation',
      frequency: 'Daily',
    });
    const newHabitId = newHabit._id.toString();

    // Complete on day 1
    await historyRepo.recordEntry(newHabitId, userA, new Date('2026-09-01'), true);
    await habitRepo.updateById(newHabitId, { currentStreak: 1, longestStreak: 1, completionRate: 100 });

    // Skip on today
    const skipped = await habitService.skipHabit(userA, newHabitId);
    assert.strictEqual(skipped.currentStreak, 0);
    // 1 completed out of 2 total logs = 50%
    assert.strictEqual(skipped.completionRate, 50);
  });

  it('should soft delete habit and exclude it from active list', async () => {
    await habitService.deleteHabit(userA, habitId);

    await assert.rejects(
      async () => {
        await habitService.getHabitById(userA, habitId);
      },
      {
        name: 'NotFoundError',
      },
    );
  });
});
