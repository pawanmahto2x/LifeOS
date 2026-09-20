import { AchievementRepository } from '../repositories/achievement.repository';
import { ACHIEVEMENT_REGISTRY } from '../config/achievements.config';
import { IAchievementWithStatus, IAchievementsSummaryDto } from '../types/achievement.types';
import { AchievementDocument } from '../models/achievement.model';
import { Task } from '../models/task.model';
import { Habit } from '../models/habit.model';
import { FocusSession } from '../models/focus-session.model';
import { WaterLog } from '../models/water-log.model';
import { SleepLog } from '../models/sleep-log.model';
import { Journal } from '../models/journal.model';
import { ChallengeParticipant } from '../models/challenge-participant.model';
import { Vote } from '../models/vote.model';
import { NotFoundError } from '../utils/errors';

export class AchievementService {
  private repo: AchievementRepository;

  constructor(repo?: AchievementRepository) {
    this.repo = repo || new AchievementRepository();
  }

  // ─── Query Endpoints (Read-Only per API.md Section 17) ─────────────────────

  async getUserAchievements(userId: string): Promise<IAchievementsSummaryDto> {
    // Automatically evaluate milestones on fetch with defensive error handling
    try {
      await this.evaluateAndUnlockAchievements(userId);
    } catch (evalError) {
      console.warn('[AchievementService] Error evaluating achievements:', evalError);
    }

    const unlocked = await this.repo.findByUserId(userId);
    const unlockedMap = new Map<string, AchievementDocument>();
    for (const doc of unlocked) {
      unlockedMap.set(doc.badgeId, doc);
    }

    const achievements: IAchievementWithStatus[] = ACHIEVEMENT_REGISTRY.map((def) => {
      const doc = unlockedMap.get(def.badgeId);
      return {
        ...def,
        isUnlocked: !!doc,
        unlockedAt: doc?.unlockedAt,
        _id: doc?._id ? doc._id.toString() : undefined,
      };
    });

    const unlockedCount = unlocked.length;
    const totalBadges = ACHIEVEMENT_REGISTRY.length;
    const unlockedPercentage = Math.round((unlockedCount / totalBadges) * 100);

    return {
      totalBadges,
      unlockedCount,
      unlockedPercentage,
      achievements,
    };
  }

  async getAchievementById(id: string, userId: string): Promise<AchievementDocument> {
    const doc = await this.repo.findById(id, userId);
    if (!doc) throw new NotFoundError('Unlocked achievement not found');
    return doc;
  }

  // ─── Badge Engine (Automatic Evaluation from Real Database Records) ─────────

  async evaluateAndUnlockAchievements(userId: string): Promise<string[]> {
    const newlyUnlocked: string[] = [];

    // Query real metrics across modules
    const [
      completedTasksCount,
      habits,
      focusSessions,
      waterLogs,
      sleepLogs,
      journalCount,
      challengeCompletions,
      voteCount,
    ] = await Promise.all([
      Task.countDocuments({ userId, status: 'Completed', isDeleted: false }).exec(),
      Habit.find({ userId, isDeleted: false }).exec(),
      FocusSession.find({ userId, completed: true }).exec(),
      WaterLog.find({ userId }).exec(),
      SleepLog.find({ userId }).exec(),
      Journal.countDocuments({ userId, isDeleted: false }).exec(),
      ChallengeParticipant.countDocuments({ userId, completed: true }).exec(),
      Vote.countDocuments({ userId }).exec(),
    ]);

    const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.longestStreak || 0)) : 0;
    const currentMaxStreak =
      habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak || 0)) : 0;
    const highestStreak = Math.max(maxStreak, currentMaxStreak);

    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    // Group water by day to find max single-day intake (normalize L to ml)
    const waterDays = new Map<string, number>();
    for (const w of waterLogs) {
      if (!w.loggedAt) continue;
      const logDate = new Date(w.loggedAt);
      if (isNaN(logDate.getTime())) continue;
      const day = logDate.toISOString().split('T')[0];
      const amountInMl = w.unit === 'L' ? (w.amount || 0) * 1000 : w.amount || 0;
      waterDays.set(day, (waterDays.get(day) || 0) + amountInMl);
    }
    const maxDailyWater = waterDays.size > 0 ? Math.max(...Array.from(waterDays.values())) : 0;

    // Check early bird: woke before 6:30 AM (hours < 6 || (hours === 6 && mins <= 30))
    const hasEarlyBird = sleepLogs.some((s) => {
      if (!s.wakeTime) return false;
      const d = new Date(s.wakeTime);
      if (isNaN(d.getTime())) return false;
      const mins = d.getHours() * 60 + d.getMinutes();
      return mins <= 6 * 60 + 30;
    });

    // Helper to evaluate and trigger unlock
    const tryUnlock = async (badgeId: string, condition: boolean) => {
      if (!condition) return;
      const existing = await this.repo.findByBadge(userId, badgeId);
      if (!existing) {
        const def = ACHIEVEMENT_REGISTRY.find((b) => b.badgeId === badgeId);
        if (def) {
          await this.repo.unlockBadge(userId, def.badgeId, def.badgeName, def.category);
          newlyUnlocked.push(def.badgeId);
        }
      }
    };

    // Evaluate rules
    await tryUnlock('first_task', completedTasksCount >= 1);
    await tryUnlock('task_century', completedTasksCount >= 100);
    await tryUnlock('productivity_legend', completedTasksCount >= 500);

    await tryUnlock('habit_starter', habits.length >= 1);
    await tryUnlock('streak_7', highestStreak >= 7);
    await tryUnlock('streak_30', highestStreak >= 30);

    await tryUnlock('first_focus', focusSessions.length >= 1);
    await tryUnlock('focus_master', totalFocusMinutes >= 500);

    await tryUnlock('water_champion', maxDailyWater >= 2000);
    await tryUnlock('early_bird', hasEarlyBird);
    await tryUnlock('mindful_journaler', journalCount >= 10);

    await tryUnlock('challenge_finisher', challengeCompletions >= 1);
    await tryUnlock('team_player', voteCount >= 1);

    return newlyUnlocked;
  }
}
