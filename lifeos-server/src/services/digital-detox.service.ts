import { DigitalDetoxRepository } from '../repositories/digital-detox.repository';
import { ScreenTimeLogRepository } from '../repositories/screen-time-log.repository';
import { DigitalDetoxSettingsDocument } from '../models/digital-detox.model';
import {
  IUpdateDigitalDetoxSettingsDto,
  ILogScreenTimeDto,
  DigitalDetoxUsageSummary,
  OpportunityCostSummary,
} from '../types/digital-detox.types';

export class DigitalDetoxService {
  private detoxRepo: DigitalDetoxRepository;
  private screenTimeRepo: ScreenTimeLogRepository;

  constructor(detoxRepo?: DigitalDetoxRepository, screenTimeRepo?: ScreenTimeLogRepository) {
    this.detoxRepo = detoxRepo || new DigitalDetoxRepository();
    this.screenTimeRepo = screenTimeRepo || new ScreenTimeLogRepository();
  }

  async getSettings(userId: string): Promise<DigitalDetoxSettingsDocument> {
    let settings = await this.detoxRepo.findByUserId(userId);
    if (!settings) {
      settings = await this.detoxRepo.upsertSettings(userId, {
        dailyScreenTimeGoalMinutes: 120,
        appLimits: [],
        warningThresholdPercent: 80,
        focusLockEnabled: false,
      });
    }
    return settings;
  }

  async updateSettings(
    userId: string,
    data: IUpdateDigitalDetoxSettingsDto,
  ): Promise<DigitalDetoxSettingsDocument> {
    return this.detoxRepo.upsertSettings(userId, data);
  }

  async logScreenTime(
    userId: string,
    data: { appName?: string; minutesUsed: number; loggedDate?: Date },
  ) {
    const logData: ILogScreenTimeDto = {
      userId,
      appName: data.appName || 'General Usage',
      minutesUsed: data.minutesUsed,
      loggedDate: data.loggedDate || new Date(),
    };
    return this.screenTimeRepo.create(logData);
  }

  async getUsage(userId: string): Promise<DigitalDetoxUsageSummary> {
    const settings = await this.getSettings(userId);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayLogs = await this.screenTimeRepo.findByDateRange(userId, startOfToday, endOfToday);

    const todayTotalMinutes = todayLogs.reduce((acc, log) => acc + log.minutesUsed, 0);
    const goalMinutes = settings.dailyScreenTimeGoalMinutes || 120;
    const percentageUsed = Math.round((todayTotalMinutes / goalMinutes) * 100);

    const warningThreshold = settings.warningThresholdPercent || 80;
    const isWarningTriggered = percentageUsed >= warningThreshold && percentageUsed < 100;
    const isGoalExceeded = percentageUsed >= 100;

    // Group per app
    const appMap = new Map<string, number>();
    for (const log of todayLogs) {
      const name = log.appName || 'General Usage';
      appMap.set(name, (appMap.get(name) || 0) + log.minutesUsed);
    }

    const appUsage = Array.from(appMap.entries()).map(([appName, minutesUsed]) => {
      const limitObj = settings.appLimits.find(
        (a) => a.appName.toLowerCase() === appName.toLowerCase(),
      );
      const dailyLimitMinutes = limitObj?.dailyLimitMinutes;
      const isLimitExceeded = dailyLimitMinutes ? minutesUsed > dailyLimitMinutes : false;
      return {
        appName,
        minutesUsed,
        dailyLimitMinutes,
        isLimitExceeded,
      };
    });

    return {
      settings,
      todayTotalMinutes,
      goalMinutes,
      percentageUsed,
      isWarningTriggered,
      isGoalExceeded,
      appUsage,
    };
  }

  async getOpportunityCost(userId: string): Promise<OpportunityCostSummary> {
    const settings = await this.getSettings(userId);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayLogs = await this.screenTimeRepo.findByDateRange(userId, startOfToday, endOfToday);
    const hasUsageData = todayLogs.length > 0;
    const todayScreenTimeMinutes = todayLogs.reduce((acc, log) => acc + log.minutesUsed, 0);

    const goalMinutes = settings.dailyScreenTimeGoalMinutes || 120;
    const minutesSaved = Math.max(0, goalMinutes - todayScreenTimeMinutes);

    return {
      screenTimeGoalMinutes: goalMinutes,
      todayScreenTimeMinutes,
      minutesSaved,
      equivalentPomodoroSessions: Math.floor(minutesSaved / 25),
      equivalentBookPages: Math.floor(minutesSaved / 2),
      hasUsageData,
    };
  }
}
