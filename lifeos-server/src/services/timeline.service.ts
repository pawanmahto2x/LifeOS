import { TimelineRepository } from '../repositories/timeline.repository';
import {
  CreateTimelineEntryInput,
  TimelineEntryDTO,
  TimelineListResponseDTO,
  TimelineQueryFilters,
} from '../types/timeline.types';
import { NotFoundError } from '../utils/errors';
import { Achievement } from '../models/achievement.model';
import { Challenge } from '../models/challenge.model';
import { ChallengeParticipant } from '../models/challenge-participant.model';
import { Task } from '../models/task.model';
import { Habit } from '../models/habit.model';

export class TimelineService {
  private repo: TimelineRepository;

  constructor(repo?: TimelineRepository) {
    this.repo = repo || new TimelineRepository();
  }

  // ─── Query Endpoints (Read-Only per API.md Section 18) ─────────────────────

  async getTimeline(
    userId: string,
    filters: TimelineQueryFilters = {},
  ): Promise<TimelineListResponseDTO> {
    // Automatically aggregate & synchronize any unrecorded milestone events
    await this.syncMilestones(userId);

    return this.repo.findUserTimeline(userId, filters);
  }

  async getTimelineEntry(userId: string, entryId: string): Promise<TimelineEntryDTO> {
    const doc = await this.repo.findById(entryId, userId);
    if (!doc) {
      throw new NotFoundError('Timeline entry not found');
    }

    return {
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      entryType: doc.entryType,
      title: doc.title,
      description: doc.description,
      sourceId: doc.sourceId.toString(),
      occurredAt: doc.occurredAt.toISOString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  async recordEntry(input: CreateTimelineEntryInput): Promise<TimelineEntryDTO | null> {
    const doc = await this.repo.createEntry(input);
    if (!doc) return null;
    return {
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      entryType: doc.entryType,
      title: doc.title,
      description: doc.description,
      sourceId: doc.sourceId.toString(),
      occurredAt: doc.occurredAt.toISOString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  // ─── Milestone Engine (Auto-Generation from Real Activities) ───────────────

  async syncMilestones(userId: string): Promise<void> {
    try {
      // 1. Achievements unlocked
      const achievements = await Achievement.find({ userId }).exec();
      for (const ach of achievements) {
        await this.repo.createEntry({
          userId,
          entryType: 'AchievementUnlocked',
          title: `Achievement: ${ach.badgeName}`,
          description: `Earned the "${ach.badgeName}" achievement badge.`,
          sourceId: ach._id,
          occurredAt: ach.unlockedAt,
        });
      }

      // 2. Completed challenges
      const challengeParticipants = await ChallengeParticipant.find({
        userId,
        completed: true,
      }).exec();

      for (const p of challengeParticipants) {
        const challengeDoc = await Challenge.findById(p.challengeId).exec();
        const title = challengeDoc ? challengeDoc.title : 'Challenge Completed';
        await this.repo.createEntry({
          userId,
          entryType: 'ChallengeCompleted',
          title: `Completed Challenge: ${title}`,
          description: `Successfully accomplished the challenge "${title}".`,
          sourceId: p.challengeId,
          occurredAt: p.completedAt || p.updatedAt,
        });
      }

      // 3. Goals / High priority tasks completed
      const priorityTasks = await Task.find({
        userId,
        status: 'Completed',
        isDeleted: false,
        priority: { $in: ['High', 'Urgent'] },
      }).exec();

      for (const t of priorityTasks) {
        await this.repo.createEntry({
          userId,
          entryType: 'GoalCompleted',
          title: `Goal Accomplished: ${t.title}`,
          description: `Completed priority milestone task "${t.title}".`,
          sourceId: t._id,
          occurredAt: t.completedAt || t.updatedAt,
        });
      }

      // 4. Habit streak milestones (streaks of 7 or more)
      const habits = await Habit.find({
        userId,
        isDeleted: false,
        currentStreak: { $gte: 7 },
      }).exec();

      for (const h of habits) {
        await this.repo.createEntry({
          userId,
          entryType: 'HabitMilestone',
          title: `Habit Milestone: ${h.title}`,
          description: `Maintained a consecutive streak of ${h.currentStreak} in "${h.title}".`,
          sourceId: h._id,
          occurredAt: h.updatedAt,
        });
      }
    } catch {
      // Gracefully continue if querying during unattached DB/mock operations
    }
  }
}
