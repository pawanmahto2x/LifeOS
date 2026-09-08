import {
  WaterLogRepository,
  ICreateWaterLogDto,
  IUpdateWaterLogDto,
  IWaterLogFilterOptions,
} from '../repositories/water-log.repository';
import {
  SleepLogRepository,
  ICreateSleepLogDto,
  IUpdateSleepLogDto,
  ISleepLogFilterOptions,
} from '../repositories/sleep-log.repository';
import {
  MoodLogRepository,
  ICreateMoodLogDto,
  IUpdateMoodLogDto,
  IMoodLogFilterOptions,
} from '../repositories/mood-log.repository';
import { WaterLogDocument } from '../models/water-log.model';
import { SleepLogDocument } from '../models/sleep-log.model';
import { MoodLogDocument } from '../models/mood-log.model';
import { HealthSummary, WaterUnit, SleepQuality, MoodType } from '../types/health.types';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';

export class HealthService {
  private waterRepo: WaterLogRepository;
  private sleepRepo: SleepLogRepository;
  private moodRepo: MoodLogRepository;

  constructor(
    waterRepo?: WaterLogRepository,
    sleepRepo?: SleepLogRepository,
    moodRepo?: MoodLogRepository,
  ) {
    this.waterRepo = waterRepo || new WaterLogRepository();
    this.sleepRepo = sleepRepo || new SleepLogRepository();
    this.moodRepo = moodRepo || new MoodLogRepository();
  }

  // ==========================================
  // WATER TRACKING
  // ==========================================

  async logWater(
    userId: string,
    data: { amount: number; unit: WaterUnit; loggedAt?: string | Date },
  ): Promise<WaterLogDocument> {
    const createData: ICreateWaterLogDto = {
      userId,
      amount: data.amount,
      unit: data.unit,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    };
    return this.waterRepo.create(createData);
  }

  async getWaterLogs(
    userId: string,
    options: { startDate?: string | Date; endDate?: string | Date; page?: number; limit?: number },
  ): Promise<{
    logs: WaterLogDocument[];
    total: number;
    page: number;
    totalPages: number;
    todayTotalMl: number;
    dailyGoalMl: number;
  }> {
    const filterOptions: IWaterLogFilterOptions = {
      userId,
      startDate: options.startDate ? new Date(options.startDate) : undefined,
      endDate: options.endDate ? new Date(options.endDate) : undefined,
      page: options.page,
      limit: options.limit,
    };

    const paginated = await this.waterRepo.findByUser(filterOptions);

    // Calculate today's total ml
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayLogs = await this.waterRepo.findByDateRange(userId, startOfToday, endOfToday);
    const todayTotalMl = todayLogs.reduce((acc, log) => {
      const ml = log.unit === 'L' ? log.amount * 1000 : log.amount;
      return acc + ml;
    }, 0);

    const dailyGoalMl = 2000;

    return {
      ...paginated,
      todayTotalMl,
      dailyGoalMl,
    };
  }

  async updateWaterLog(
    userId: string,
    logId: string,
    data: IUpdateWaterLogDto,
  ): Promise<WaterLogDocument> {
    const existing = await this.waterRepo.findById(logId);
    if (!existing) {
      throw new NotFoundError('Water log not found');
    }
    if (existing.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to update this water log');
    }

    const updated = await this.waterRepo.update(logId, data);
    if (!updated) {
      throw new NotFoundError('Water log not found');
    }
    return updated;
  }

  async deleteWaterLog(userId: string, logId: string): Promise<void> {
    const existing = await this.waterRepo.findById(logId);
    if (!existing) {
      throw new NotFoundError('Water log not found');
    }
    if (existing.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to delete this water log');
    }

    await this.waterRepo.delete(logId);
  }

  // ==========================================
  // SLEEP TRACKING
  // ==========================================

  async logSleep(
    userId: string,
    data: {
      sleepTime: string | Date;
      wakeTime: string | Date;
      quality: SleepQuality;
      notes?: string;
    },
  ): Promise<SleepLogDocument> {
    const sleepDate = new Date(data.sleepTime);
    const wakeDate = new Date(data.wakeTime);

    if (wakeDate.getTime() <= sleepDate.getTime()) {
      throw new ValidationError('Wake time must be after sleep time');
    }

    const duration = Math.round((wakeDate.getTime() - sleepDate.getTime()) / (1000 * 60)); // in minutes

    const createData: ICreateSleepLogDto = {
      userId,
      sleepTime: sleepDate,
      wakeTime: wakeDate,
      duration,
      quality: data.quality,
      notes: data.notes,
    };

    return this.sleepRepo.create(createData);
  }

  async getSleepLogs(
    userId: string,
    options: { startDate?: string | Date; endDate?: string | Date; page?: number; limit?: number },
  ): Promise<{
    logs: SleepLogDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const filterOptions: ISleepLogFilterOptions = {
      userId,
      startDate: options.startDate ? new Date(options.startDate) : undefined,
      endDate: options.endDate ? new Date(options.endDate) : undefined,
      page: options.page,
      limit: options.limit,
    };

    return this.sleepRepo.findByUser(filterOptions);
  }

  async updateSleepLog(
    userId: string,
    sleepId: string,
    data: {
      sleepTime?: string | Date;
      wakeTime?: string | Date;
      quality?: SleepQuality;
      notes?: string;
    },
  ): Promise<SleepLogDocument> {
    const existing = await this.sleepRepo.findById(sleepId);
    if (!existing) {
      throw new NotFoundError('Sleep log not found');
    }
    if (existing.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to update this sleep log');
    }

    const sleepDate = data.sleepTime ? new Date(data.sleepTime) : existing.sleepTime;
    const wakeDate = data.wakeTime ? new Date(data.wakeTime) : existing.wakeTime;

    if (wakeDate.getTime() <= sleepDate.getTime()) {
      throw new ValidationError('Wake time must be after sleep time');
    }

    const duration = Math.round((wakeDate.getTime() - sleepDate.getTime()) / (1000 * 60));

    const updateData: IUpdateSleepLogDto = {
      sleepTime: sleepDate,
      wakeTime: wakeDate,
      duration,
      quality: data.quality || existing.quality,
      notes: data.notes !== undefined ? data.notes : existing.notes,
    };

    const updated = await this.sleepRepo.update(sleepId, updateData);
    if (!updated) {
      throw new NotFoundError('Sleep log not found');
    }
    return updated;
  }

  async deleteSleepLog(userId: string, sleepId: string): Promise<void> {
    const existing = await this.sleepRepo.findById(sleepId);
    if (!existing) {
      throw new NotFoundError('Sleep log not found');
    }
    if (existing.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to delete this sleep log');
    }

    await this.sleepRepo.delete(sleepId);
  }

  // ==========================================
  // MOOD TRACKING
  // ==========================================

  async logMood(
    userId: string,
    data: {
      mood: MoodType;
      moodScore: number;
      note?: string;
      loggedAt?: string | Date;
    },
  ): Promise<MoodLogDocument> {
    const createData: ICreateMoodLogDto = {
      userId,
      mood: data.mood,
      moodScore: data.moodScore,
      note: data.note,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    };

    return this.moodRepo.create(createData);
  }

  async getMoodLogs(
    userId: string,
    options: {
      startDate?: string | Date;
      endDate?: string | Date;
      mood?: MoodType;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    logs: MoodLogDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const filterOptions: IMoodLogFilterOptions = {
      userId,
      startDate: options.startDate ? new Date(options.startDate) : undefined,
      endDate: options.endDate ? new Date(options.endDate) : undefined,
      mood: options.mood,
      page: options.page,
      limit: options.limit,
    };

    return this.moodRepo.findByUser(filterOptions);
  }

  async updateMoodLog(
    userId: string,
    moodId: string,
    data: {
      mood?: MoodType;
      moodScore?: number;
      note?: string;
      loggedAt?: string | Date;
    },
  ): Promise<MoodLogDocument> {
    const existing = await this.moodRepo.findById(moodId);
    if (!existing) {
      throw new NotFoundError('Mood log not found');
    }
    if (existing.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to update this mood log');
    }

    const updateData: IUpdateMoodLogDto = {
      mood: data.mood,
      moodScore: data.moodScore,
      note: data.note,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : undefined,
    };

    const updated = await this.moodRepo.update(moodId, updateData);
    if (!updated) {
      throw new NotFoundError('Mood log not found');
    }
    return updated;
  }

  async deleteMoodLog(userId: string, moodId: string): Promise<void> {
    const existing = await this.moodRepo.findById(moodId);
    if (!existing) {
      throw new NotFoundError('Mood log not found');
    }
    if (existing.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to delete this mood log');
    }

    await this.moodRepo.delete(moodId);
  }

  // ==========================================
  // HEALTH SUMMARY & ANALYTICS
  // ==========================================

  async getHealthSummary(userId: string): Promise<HealthSummary> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Parallel fetch for real database values
    const [todayWaterLogs, lastSleep, sevenDaySleepLogs, latestMood, sevenDayMoodLogs] =
      await Promise.all([
        this.waterRepo.findByDateRange(userId, startOfToday, endOfToday),
        this.sleepRepo.findLatest(userId),
        this.sleepRepo.findByDateRange(userId, sevenDaysAgo, endOfToday),
        this.moodRepo.findLatest(userId),
        this.moodRepo.findByDateRange(userId, sevenDaysAgo, endOfToday),
      ]);

    // Water calculations
    const todayTotalMl = todayWaterLogs.reduce((acc, log) => {
      const ml = log.unit === 'L' ? log.amount * 1000 : log.amount;
      return acc + ml;
    }, 0);
    const dailyGoalMl = 2000;
    const progressPercentage = Math.min(Math.round((todayTotalMl / dailyGoalMl) * 100), 100);

    // Sleep calculations
    const sevenDayAverageDurationMinutes =
      sevenDaySleepLogs.length > 0
        ? Math.round(
            sevenDaySleepLogs.reduce((sum, s) => sum + s.duration, 0) / sevenDaySleepLogs.length,
          )
        : 0;

    // Mood calculations
    const isTodayMood =
      latestMood &&
      new Date(latestMood.loggedAt).getTime() >= startOfToday.getTime() &&
      new Date(latestMood.loggedAt).getTime() <= endOfToday.getTime();

    const sevenDayAverageScore =
      sevenDayMoodLogs.length > 0
        ? Number(
            (
              sevenDayMoodLogs.reduce((sum, m) => sum + m.moodScore, 0) / sevenDayMoodLogs.length
            ).toFixed(1),
          )
        : null;

    return {
      water: {
        todayTotalMl,
        dailyGoalMl,
        progressPercentage,
        logCount: todayWaterLogs.length,
      },
      sleep: {
        lastSession: lastSleep,
        sevenDayAverageDurationMinutes,
      },
      mood: {
        todayLatestMood: isTodayMood ? latestMood : null,
        sevenDayAverageScore,
      },
    };
  }
}
