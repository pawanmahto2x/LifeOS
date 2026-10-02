import { AISettingsRepository } from '../repositories/ai-settings.repository';
import { Task } from '../models/task.model';
import { Habit } from '../models/habit.model';
import { HabitHistory } from '../models/habit-history.model';
import { FocusSession } from '../models/focus-session.model';
import { WaterLog } from '../models/water-log.model';
import { SleepLog } from '../models/sleep-log.model';
import { MoodLog } from '../models/mood-log.model';
import { PersonalBaseline } from '../models/personal-baseline.model';
import { DailyMission } from '../models/daily-mission.model';
import {
  IAISettingsPublicDto,
  ISaveAISettingsDto,
  IUpdateAISettingsDto,
  IWeeklyAIReportResponse,
  IAICoachResponse,
  IAIHealthAnalysisResponse,
} from '../types/ai.types';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { ProviderFactory } from '../ai/provider.factory';
import {
  buildAICoachPrompt,
  buildWeeklyReportPrompt,
  buildHealthAnalysisPrompt,
} from '../ai/prompts/ai-coach.prompt';
import {
  aiCoachSchema,
  aiWeeklyReportSchema,
  aiHealthAnalysisSchema,
} from '../ai/schemas/ai-coach.schema';

export class AIService {
  private repo: AISettingsRepository;

  constructor(repo?: AISettingsRepository) {
    this.repo = repo || new AISettingsRepository();
  }

  // ─── AI Settings (BYOK) ──────────────────────────────────────────────────────

  async getSettings(userId: string): Promise<IAISettingsPublicDto> {
    const settings = await this.repo.findByUserId(userId);
    if (!settings) {
      return {
        provider: 'gemini',
        model: 'gemini-2.5-pro',
        isEnabled: false,
        hasKey: false,
      };
    }

    return {
      provider: settings.provider,
      model: settings.model,
      isEnabled: settings.isEnabled,
      hasKey: !!settings.encryptedApiKey,
    };
  }

  async saveSettings(userId: string, data: ISaveAISettingsDto): Promise<IAISettingsPublicDto> {
    const doc = await this.repo.upsertSettings(userId, data);
    return {
      provider: doc.provider,
      model: doc.model,
      isEnabled: doc.isEnabled,
      hasKey: true,
    };
  }

  async updateSettings(userId: string, data: IUpdateAISettingsDto): Promise<IAISettingsPublicDto> {
    const doc = await this.repo.updateSettings(userId, data);
    if (!doc) throw new NotFoundError('AI settings not found');
    return {
      provider: doc.provider,
      model: doc.model,
      isEnabled: doc.isEnabled,
      hasKey: !!doc.encryptedApiKey,
    };
  }

  async deleteSettings(userId: string): Promise<void> {
    const deleted = await this.repo.deleteSettings(userId);
    if (!deleted) throw new NotFoundError('AI settings not found');
  }

  // ─── AI Analytics & Coaching (Zero Fake Data) ───────────────────────────────

  // LEGACY RULE-BASED IMPLEMENTATION: This currently uses threshold logic and is NOT genuine LLM output. Will be replaced in future phases.
  async generateWeeklyAIReport(userId: string): Promise<IWeeklyAIReportResponse> {
    const settings = await this.repo.findByUserId(userId);
    if (!settings || !settings.isEnabled) {
      throw new BadRequestError(
        'AI is not configured or disabled. Please set your API key in Settings.',
      );
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [tasks, habits, habitHistories, focusSessions, waterLogs] = await Promise.all([
      Task.find({ userId, isDeleted: false, createdAt: { $gte: oneWeekAgo } }).exec(),
      Habit.find({ userId, isDeleted: false }).exec(),
      HabitHistory.find({ userId, completionDate: { $gte: oneWeekAgo }, completed: true }).exec(),
      FocusSession.find({ userId, startedAt: { $gte: oneWeekAgo }, completed: true }).exec(),
      WaterLog.find({ userId, loggedAt: { $gte: oneWeekAgo } }).exec(),
    ]);

    const tasksCompleted = tasks.filter((t) => t.status === 'Completed').length;
    const focusMinutes = focusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalWaterMl = waterLogs.reduce((acc, l) => acc + l.amount, 0);
    const dailyWaterAvg = Math.round(totalWaterMl / 7);

    const stats = {
      tasksCompleted,
      focusMinutes,
      dailyWaterAvg,
      habitCheckins: habitHistories.length,
      activeHabits: habits.length,
    };

    try {
      const providerFactory = new ProviderFactory();
      const provider = await providerFactory.getProvider(userId);
      const { systemPrompt, userPrompt } = buildWeeklyReportPrompt(stats);

      const response = await provider.generateStructured(userPrompt, systemPrompt);
      const parsed = aiWeeklyReportSchema.parse(response);
      return { ...parsed, generatedAt: new Date().toISOString() };
    } catch (error) {
      console.warn(`[LifeOS] Failed to generate AI weekly report:`, error);
      return {
        strengths: [`Completed ${tasksCompleted} tasks.`],
        weaknesses: ['AI generation failed.'],
        suggestions: ['Check your API key.'],
        weeklySummary: `Over the past week, you completed ${tasksCompleted} tasks, invested ${focusMinutes} minutes into deep work, and maintained check-ins across ${habits.length} habits.`,
        generatedAt: new Date().toISOString(),
      };
    }
  }

  async askAICoach(userId: string, question: string): Promise<IAICoachResponse> {
    const settings = await this.repo.findByUserId(userId);
    if (!settings || !settings.isEnabled) {
      throw new BadRequestError(
        'AI is not configured or disabled. Please set your API key in Settings.',
      );
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [tasks, habits, focusSessions, todayWater, baseline, dailyMission] = await Promise.all([
      Task.find({
        userId,
        isDeleted: false,
        status: 'Completed',
        updatedAt: { $gte: oneWeekAgo },
      }).exec(),
      Habit.find({ userId, isDeleted: false, isPaused: false }).exec(),
      FocusSession.find({ userId, startedAt: { $gte: oneWeekAgo }, completed: true }).exec(),
      WaterLog.find({ userId, loggedAt: { $gte: todayStart } }).exec(),
      PersonalBaseline.findOne({ userId, period: '30d' }).exec(),
      DailyMission.findOne({ userId, date: todayStart }).exec(),
    ]);

    const tasksCompletedThisWeek = tasks.length;
    const activeHabitCount = habits.length;
    const focusMinutesThisWeek = focusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const currentHydrationMl = todayWater.reduce((acc, l) => acc + l.amount, 0);

    const contextSummary = {
      tasksCompletedThisWeek,
      activeHabitCount,
      focusMinutesThisWeek,
      currentHydrationMl,
    };

    let fact = '';
    if (
      tasksCompletedThisWeek === 0 &&
      focusMinutesThisWeek === 0 &&
      activeHabitCount === 0 &&
      currentHydrationMl === 0
    ) {
      fact = "I don't have enough recorded data to determine that.";
    } else {
      const parts = [
        `You completed ${tasksCompletedThisWeek} tasks this week, accumulated ${focusMinutesThisWeek} minutes in deep work, actively track ${activeHabitCount} habits, and drank ${currentHydrationMl}ml of water today.`,
      ];
      if (baseline) {
        parts.push(
          `Your 30-day baseline average focus is ${baseline.avgFocusMinutesPerDay} minutes per day.`,
        );
      }
      if (dailyMission && dailyMission.primaryMission) {
        parts.push(`Today's daily mission is "${dailyMission.primaryMission.title}".`);
      }
      fact = parts.join(' ');
    }

    let answer = '';
    try {
      const providerFactory = new ProviderFactory();
      const provider = await providerFactory.getProvider(userId);
      const { systemPrompt, userPrompt } = buildAICoachPrompt(question, contextSummary, fact);

      const response = await provider.generateStructured(userPrompt, systemPrompt);
      const parsed = aiCoachSchema.parse(response);
      answer = parsed.answer;
    } catch (error) {
      console.warn(`[LifeOS] Failed to generate AI coach response:`, error);
      const inference = `This may be associated with your progress regarding "${question}".`;
      const recommendation = `You could try scheduling your most important task during your usual high-focus period.`;
      answer = `FACT:\n"${fact}"\n\nINFERENCE:\n"${inference}"\n\nRECOMMENDATION:\n"${recommendation}"\n\n(AI generation failed, fallback text shown)`;
    }

    return {
      answer,
      contextSummary,
    };
  }

  async getHealthAnalysis(userId: string): Promise<IAIHealthAnalysisResponse> {
    const settings = await this.repo.findByUserId(userId);
    if (!settings || !settings.isEnabled) {
      throw new BadRequestError(
        'AI is not configured or disabled. Please set your API key in Settings.',
      );
    }

    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [sleepLogs, waterLogs, moodLogs] = await Promise.all([
      SleepLog.find({ userId, sleepTime: { $gte: twoWeeksAgo } }).exec(),
      WaterLog.find({ userId, loggedAt: { $gte: twoWeeksAgo } }).exec(),
      MoodLog.find({ userId, loggedAt: { $gte: twoWeeksAgo } }).exec(),
    ]);

    const avgSleepMins =
      sleepLogs.length > 0
        ? Math.round(sleepLogs.reduce((acc, s) => acc + (s.duration || 0), 0) / sleepLogs.length)
        : 0;
    const avgMood =
      moodLogs.length > 0
        ? Math.round((moodLogs.reduce((acc, m) => acc + m.moodScore, 0) / moodLogs.length) * 10) /
          10
        : 0;

    const stats = {
      sleepLogs: sleepLogs.length,
      waterLogs: waterLogs.length,
      moodLogs: moodLogs.length,
      avgSleepMins,
      avgMood,
    };

    try {
      const providerFactory = new ProviderFactory();
      const provider = await providerFactory.getProvider(userId);
      const { systemPrompt, userPrompt } = buildHealthAnalysisPrompt(stats);

      const response = await provider.generateStructured(userPrompt, systemPrompt);
      const parsed = aiHealthAnalysisSchema.parse(response);
      return parsed;
    } catch (error) {
      console.warn(`[LifeOS] Failed to generate AI health analysis:`, error);
      return {
        summary: `Analyzed ${sleepLogs.length} sleep logs, ${waterLogs.length} hydration entries, and ${moodLogs.length} mood records over the past 14 days.`,
        sleepQualityTrend:
          avgSleepMins > 0
            ? `Averaging ${Math.floor(avgSleepMins / 60)}h ${avgSleepMins % 60}m sleep per night.`
            : 'No sleep data recorded.',
        hydrationCompliance:
          waterLogs.length > 0
            ? `Logged water on ${waterLogs.length} instances.`
            : 'Hydration tracking is inactive.',
        moodCorrelation:
          avgMood > 0 ? `Average mood score is ${avgMood}/10.` : 'No mood entries recorded.',
        recommendations: [
          'Maintain a consistent sleep window within +/- 30 minutes every evening.',
          'Drink 500ml of water immediately upon waking.',
        ],
      };
    }
  }
}
