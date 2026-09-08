import { describe, it } from 'node:test';
import assert from 'node:assert';
import { HealthService } from '../src/services/health.service';
import { WaterLogRepository, ICreateWaterLogDto, IUpdateWaterLogDto, IWaterLogFilterOptions } from '../src/repositories/water-log.repository';
import { SleepLogRepository, ICreateSleepLogDto, IUpdateSleepLogDto, ISleepLogFilterOptions } from '../src/repositories/sleep-log.repository';
import { MoodLogRepository, ICreateMoodLogDto, IUpdateMoodLogDto, IMoodLogFilterOptions } from '../src/repositories/mood-log.repository';
import { WaterLogDocument } from '../src/models/water-log.model';
import { SleepLogDocument } from '../src/models/sleep-log.model';
import { MoodLogDocument } from '../src/models/mood-log.model';
import { Types } from 'mongoose';

// Mock Repositories
class MockWaterLogRepository extends WaterLogRepository {
  private logs: Map<string, WaterLogDocument> = new Map();

  async create(data: ICreateWaterLogDto): Promise<WaterLogDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      userId: new Types.ObjectId(data.userId),
      amount: data.amount,
      unit: data.unit,
      loggedAt: data.loggedAt || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as WaterLogDocument;
    this.logs.set(id.toString(), doc);
    return doc;
  }

  async findById(id: string): Promise<WaterLogDocument | null> {
    return this.logs.get(id) || null;
  }

  async findByUser(
    options: IWaterLogFilterOptions,
  ): Promise<{ logs: WaterLogDocument[]; total: number; page: number; totalPages: number }> {
    const list = Array.from(this.logs.values()).filter(
      (l) => l.userId.toString() === options.userId,
    );
    return { logs: list, total: list.length, page: 1, totalPages: 1 };
  }

  async findByDateRange(userId: string, _startDate: Date, _endDate: Date): Promise<WaterLogDocument[]> {
    return Array.from(this.logs.values()).filter((l) => l.userId.toString() === userId);
  }

  async update(id: string, data: IUpdateWaterLogDto): Promise<WaterLogDocument | null> {
    const doc = this.logs.get(id);
    if (!doc) return null;
    const updated = { ...doc, ...data, updatedAt: new Date() } as unknown as WaterLogDocument;
    this.logs.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<WaterLogDocument | null> {
    const doc = this.logs.get(id);
    if (!doc) return null;
    this.logs.delete(id);
    return doc;
  }
}

class MockSleepLogRepository extends SleepLogRepository {
  private logs: Map<string, SleepLogDocument> = new Map();

  async create(data: ICreateSleepLogDto): Promise<SleepLogDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      userId: new Types.ObjectId(data.userId),
      sleepTime: data.sleepTime,
      wakeTime: data.wakeTime,
      duration: data.duration,
      quality: data.quality,
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as SleepLogDocument;
    this.logs.set(id.toString(), doc);
    return doc;
  }

  async findById(id: string): Promise<SleepLogDocument | null> {
    return this.logs.get(id) || null;
  }

  async findLatest(userId: string): Promise<SleepLogDocument | null> {
    const list = Array.from(this.logs.values()).filter(
      (l) => l.userId.toString() === userId,
    );
    return list.length > 0 ? list[list.length - 1] : null;
  }

  async findByUser(
    options: ISleepLogFilterOptions,
  ): Promise<{ logs: SleepLogDocument[]; total: number; page: number; totalPages: number }> {
    const list = Array.from(this.logs.values()).filter(
      (l) => l.userId.toString() === options.userId,
    );
    return { logs: list, total: list.length, page: 1, totalPages: 1 };
  }

  async findByDateRange(userId: string, _startDate: Date, _endDate: Date): Promise<SleepLogDocument[]> {
    return Array.from(this.logs.values()).filter((l) => l.userId.toString() === userId);
  }

  async update(id: string, data: IUpdateSleepLogDto): Promise<SleepLogDocument | null> {
    const doc = this.logs.get(id);
    if (!doc) return null;
    const updated = { ...doc, ...data, updatedAt: new Date() } as unknown as SleepLogDocument;
    this.logs.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<SleepLogDocument | null> {
    const doc = this.logs.get(id);
    if (!doc) return null;
    this.logs.delete(id);
    return doc;
  }
}

class MockMoodLogRepository extends MoodLogRepository {
  private logs: Map<string, MoodLogDocument> = new Map();

  async create(data: ICreateMoodLogDto): Promise<MoodLogDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      userId: new Types.ObjectId(data.userId),
      mood: data.mood,
      moodScore: data.moodScore,
      note: data.note,
      loggedAt: data.loggedAt || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as MoodLogDocument;
    this.logs.set(id.toString(), doc);
    return doc;
  }

  async findById(id: string): Promise<MoodLogDocument | null> {
    return this.logs.get(id) || null;
  }

  async findLatest(userId: string): Promise<MoodLogDocument | null> {
    const list = Array.from(this.logs.values()).filter(
      (l) => l.userId.toString() === userId,
    );
    return list.length > 0 ? list[list.length - 1] : null;
  }

  async findByUser(
    options: IMoodLogFilterOptions,
  ): Promise<{ logs: MoodLogDocument[]; total: number; page: number; totalPages: number }> {
    const list = Array.from(this.logs.values()).filter(
      (l) => l.userId.toString() === options.userId,
    );
    return { logs: list, total: list.length, page: 1, totalPages: 1 };
  }

  async findByDateRange(userId: string, _startDate: Date, _endDate: Date): Promise<MoodLogDocument[]> {
    return Array.from(this.logs.values()).filter((l) => l.userId.toString() === userId);
  }

  async update(id: string, data: IUpdateMoodLogDto): Promise<MoodLogDocument | null> {
    const doc = this.logs.get(id);
    if (!doc) return null;
    const updated = { ...doc, ...data, updatedAt: new Date() } as unknown as MoodLogDocument;
    this.logs.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<MoodLogDocument | null> {
    const doc = this.logs.get(id);
    if (!doc) return null;
    this.logs.delete(id);
    return doc;
  }
}

describe('Health Module - Unit Tests', () => {
  const userId = new Types.ObjectId().toString();
  const otherUserId = new Types.ObjectId().toString();

  const waterRepo = new MockWaterLogRepository();
  const sleepRepo = new MockSleepLogRepository();
  const moodRepo = new MockMoodLogRepository();
  const healthService = new HealthService(waterRepo, sleepRepo, moodRepo);

  // 1. Water Tracking
  it('should log water intake and correctly aggregate daily totals in ml', async () => {
    const log1 = await healthService.logWater(userId, { amount: 250, unit: 'ml' });
    const log2 = await healthService.logWater(userId, { amount: 1, unit: 'L' }); // 1000 ml

    assert.strictEqual(log1.amount, 250);
    assert.strictEqual(log1.unit, 'ml');
    assert.strictEqual(log2.amount, 1);
    assert.strictEqual(log2.unit, 'L');

    const result = await healthService.getWaterLogs(userId, {});
    assert.strictEqual(result.logs.length, 2);
    assert.strictEqual(result.todayTotalMl, 1250);
    assert.strictEqual(result.dailyGoalMl, 2000);
  });

  it('should prevent updating or deleting water log by non-owner', async () => {
    const log = await healthService.logWater(userId, { amount: 500, unit: 'ml' });

    await assert.rejects(
      async () => {
        await healthService.updateWaterLog(otherUserId, log._id.toString(), { amount: 600 });
      },
      { name: 'ForbiddenError' },
    );

    await assert.rejects(
      async () => {
        await healthService.deleteWaterLog(otherUserId, log._id.toString());
      },
      { name: 'ForbiddenError' },
    );

    // Successful delete by owner
    await healthService.deleteWaterLog(userId, log._id.toString());
  });

  // 2. Sleep Tracking
  it('should log sleep and automatically calculate duration in minutes', async () => {
    const sleepTime = new Date('2026-07-25T23:00:00Z');
    const wakeTime = new Date('2026-07-26T07:30:00Z'); // 8.5 hours = 510 minutes

    const log = await healthService.logSleep(userId, {
      sleepTime,
      wakeTime,
      quality: 'Good',
      notes: 'Slept soundly',
    });

    assert.strictEqual(log.duration, 510);
    assert.strictEqual(log.quality, 'Good');
    assert.strictEqual(log.notes, 'Slept soundly');
  });

  it('should reject sleep log if wakeTime is before or equal to sleepTime', async () => {
    const sleepTime = new Date('2026-07-26T08:00:00Z');
    const wakeTime = new Date('2026-07-26T06:00:00Z');

    await assert.rejects(
      async () => {
        await healthService.logSleep(userId, {
          sleepTime,
          wakeTime,
          quality: 'Poor',
        });
      },
      { name: 'ValidationError' },
    );
  });

  // 3. Mood Tracking
  it('should log mood with score and note', async () => {
    const moodLog = await healthService.logMood(userId, {
      mood: 'Happy',
      moodScore: 9,
      note: 'Finished major coding phase!',
    });

    assert.strictEqual(moodLog.mood, 'Happy');
    assert.strictEqual(moodLog.moodScore, 9);
    assert.strictEqual(moodLog.note, 'Finished major coding phase!');
  });

  it('should prevent non-owner from updating mood log', async () => {
    const moodLog = await healthService.logMood(userId, {
      mood: 'Calm',
      moodScore: 7,
    });

    await assert.rejects(
      async () => {
        await healthService.updateMoodLog(otherUserId, moodLog._id.toString(), { moodScore: 8 });
      },
      { name: 'ForbiddenError' },
    );
  });

  // 4. Health Summary
  it('should return consolidated health summary with real metrics', async () => {
    const summary = await healthService.getHealthSummary(userId);

    assert.ok(summary.water);
    assert.ok(summary.sleep);
    assert.ok(summary.mood);
    assert.strictEqual(typeof summary.water.todayTotalMl, 'number');
    assert.strictEqual(typeof summary.water.progressPercentage, 'number');
    assert.strictEqual(typeof summary.sleep.sevenDayAverageDurationMinutes, 'number');
  });
});
