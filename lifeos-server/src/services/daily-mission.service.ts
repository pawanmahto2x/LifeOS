import { DailyMissionRepository } from '../repositories/daily-mission.repository';
import { Task } from '../models/task.model';
import { Habit } from '../models/habit.model';
import { HabitHistory } from '../models/habit-history.model';
import { FocusSession } from '../models/focus-session.model';
import { SleepLog } from '../models/sleep-log.model';
import { MoodLog } from '../models/mood-log.model';
import { Goal } from '../models/goal.model';
import { ChallengeParticipant } from '../models/challenge-participant.model';
import { GroupMember } from '../models/group-member.model';
import {
  DayType,
  ISupportingGoal,
  ISubmitReviewInput,
  IToggleMissionItemInput,
  IWeeklyMissionItem,
  ICommunityMissionItem,
} from '../types/daily-mission.types';
import { NotFoundError } from '../utils/errors';
import { TimezoneUtil } from '../utils/timezone.util';

export class DailyMissionService {
  constructor(private repo: DailyMissionRepository = new DailyMissionRepository()) {}

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  // LEGACY RULE-BASED IMPLEMENTATION: This currently uses threshold logic and is NOT genuine LLM output. Will be replaced in future phases.
  async classifyDayType(userId: string): Promise<{ dayType: DayType; reasons: string[] }> {
    const tz = await TimezoneUtil.getUserTimezone(userId);
    const today = TimezoneUtil.getStartOfDayUTCForTimezone(tz);
    const yesterday = this.addDays(today, -1);

    // 1. Get last night's sleep
    const sleep = await SleepLog.findOne({
      userId,
      sleepTime: { $gte: yesterday, $lt: today },
    })
      .sort({ sleepTime: -1 })
      .exec();

    // 2. Get latest mood
    const mood = await MoodLog.findOne({
      userId,
      timestamp: { $gte: yesterday },
    })
      .sort({ timestamp: -1 })
      .exec();

    // 3. Count overdue tasks
    const overdueTasks = await Task.countDocuments({
      userId,
      status: { $ne: 'Completed' },
      dueDate: { $lt: today },
    }).exec();

    // 4. Get 7-day productivity trend
    const sevenDaysAgo = this.addDays(today, -7);
    const recentCompleted = await Task.countDocuments({
      userId,
      status: 'Completed',
      completedAt: { $gte: sevenDaysAgo, $lte: today },
    }).exec();
    const recentTotal = await Task.countDocuments({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    }).exec();
    const completionRate = recentTotal > 0 ? (recentCompleted / recentTotal) * 100 : 0;

    const reasons: string[] = [];

    // Recovery Check
    const poorSleep = sleep && ((sleep as any).duration < 5 || (sleep as any).quality === 'Poor');
    if (poorSleep) reasons.push('Sleep was less than 5 hours or quality was poor.');

    const poorMood = mood && (mood as any).score < 4;
    if (poorMood) reasons.push('Recent mood score was low.');

    const overwhelmed = overdueTasks >= 5 && completionRate < 40;
    if (overwhelmed) reasons.push('High number of overdue tasks with declining productivity.');

    if (poorSleep || poorMood || overwhelmed) {
      if (reasons.length === 0) reasons.push('Prioritizing recovery based on recent metrics.');
      return { dayType: 'recovery', reasons };
    }

    // High-Focus Check
    const goodSleep =
      sleep &&
      (sleep as any).duration >= 7 &&
      ((sleep as any).quality === 'Good' || (sleep as any).quality === 'Excellent');
    const goodMood = mood && (mood as any).score >= 7;
    const goodProductivity = completionRate > 60;

    if (goodSleep && goodMood && goodProductivity) {
      reasons.push('Excellent sleep, positive mood, and high task completion rate.');
      return { dayType: 'high-focus', reasons };
    }

    // Normal Check
    reasons.push('Metrics are balanced, proposing a standard active day.');
    return { dayType: 'normal', reasons };
  }

  async selectPrimaryMission(userId: string, dayType: DayType) {
    const priorityMap: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };

    // 1. Check for active user goals
    try {
      const activeGoals = await Goal.find({ userId, status: 'active' }).exec();
      if (activeGoals && activeGoals.length > 0) {
        for (const goal of activeGoals) {
          const nextMilestone = goal.milestones.find((m) => !m.completed);
          if (nextMilestone) {
            const goalTask = await Task.findOne({
              userId,
              status: { $ne: 'Completed' },
              isDeleted: false,
              $or: [
                { category: { $regex: new RegExp(goal.category, 'i') } },
                { title: { $regex: new RegExp(nextMilestone.title, 'i') } },
              ],
            }).exec();

            if (goalTask) {
              return {
                title: goalTask.title,
                taskId: goalTask._id.toString(),
                goalId: goal._id.toString(),
                goalTitle: goal.title,
                category: goal.category,
                reason: `Directly advances milestone "${nextMilestone.title}" for your goal: "${goal.title}".`,
                completed: false,
              };
            }

            return {
              title: `Advance Milestone: ${nextMilestone.title}`,
              goalId: goal._id.toString(),
              goalTitle: goal.title,
              category: goal.category,
              reason: `Primary milestone target toward your goal: "${goal.title}".`,
              completed: false,
            };
          }
        }
      }
    } catch (err) {}

    const incompleteTasks = await Task.find({
      userId,
      status: { $ne: 'Completed' },
      isDeleted: false,
    }).exec();

    if (!incompleteTasks || incompleteTasks.length === 0) {
      return {
        title: 'Define your next strategic goal',
        reason:
          'No open tasks or active goals found. Set a goal in the Goals module to generate mission targets.',
        completed: false,
      };
    }

    const sortedTasks = incompleteTasks.sort((a: any, b: any) => {
      const pA = priorityMap[a.priority as string] || 0;
      const pB = priorityMap[b.priority as string] || 0;
      if (pA !== pB) return pB - pA;
      if (a.dueDate && b.dueDate)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return 0;
    });

    let selectedTask: any;
    let reason = '';

    if (dayType === 'recovery') {
      selectedTask = sortedTasks.find((t: any) => priorityMap[t.priority as string] >= 3);
      if (selectedTask) {
        reason = 'High priority task selected for essential completion during recovery.';
      } else {
        selectedTask = sortedTasks[0];
        reason = 'Selected highest available priority for steady progress.';
      }
    } else if (dayType === 'high-focus') {
      selectedTask = sortedTasks[0];
      reason = 'Tackling the most urgent and nearest due task to maximize focus block.';
    } else {
      selectedTask = sortedTasks[0];
      reason = 'Highest priority task queued for standard daily progression.';
    }

    return {
      title: selectedTask.title,
      taskId: selectedTask._id.toString(),
      category: selectedTask.category || 'General',
      reason,
      completed: false,
    };
  }

  async generateSupportingGoals(userId: string, dayType: DayType): Promise<ISupportingGoal[]> {
    const goals: ISupportingGoal[] = [];

    // 1. Generate supporting missions from active goals
    try {
      const activeGoals = await Goal.find({ userId, status: 'active' }).exec();
      if (activeGoals && activeGoals.length > 0) {
        for (const g of activeGoals.slice(0, 3)) {
          const nextMilestone = g.milestones.find((m) => !m.completed);
          if (nextMilestone) {
            const isHealth = g.category === 'health' || g.category === 'fitness';
            const isFocus = g.category === 'career' || g.category === 'education';
            goals.push({
              title: `Milestone: ${nextMilestone.title}`,
              type: isHealth ? 'health' : isFocus ? 'focus' : 'task',
              targetValue: isHealth ? '1 session' : isFocus ? '45 min' : 'Key deliverable',
              completed: false,
              goalId: g._id.toString(),
              goalTitle: g.title,
              category: g.category,
            });
          }
        }
      }
    } catch (err) {}

    // 2. Active habits
    const activeHabits = await Habit.find({ userId, isPaused: false, isDeleted: false })
      .limit(3)
      .exec();

    activeHabits.forEach((h: any) => {
      goals.push({
        title: h.title || (h as any).name || 'Habit Check-in',
        type: 'habit',
        targetValue: 'Daily',
        completed: false,
        category: 'Routine',
      });
    });

    // 3. Hydration & wellness baseline
    if (dayType === 'recovery') {
      goals.push({
        title: 'Restorative hydration & recovery',
        type: 'health',
        targetValue: '2L water',
        completed: false,
        category: 'Wellness',
      });
    } else if (dayType === 'high-focus') {
      goals.push({
        title: 'Deep Focus Block',
        type: 'focus',
        targetValue: '90 minutes',
        completed: false,
        category: 'Productivity',
      });
    } else {
      goals.push({
        title: 'Daily hydration baseline',
        type: 'health',
        targetValue: '2L water',
        completed: false,
        category: 'Wellness',
      });
    }

    return goals;
  }

  async generatePersonalReminder(userId: string): Promise<string> {
    const tz = await TimezoneUtil.getUserTimezone(userId);
    const today = TimezoneUtil.getStartOfDayUTCForTimezone(tz);
    const yesterday = this.addDays(today, -1);
    const thirtyDaysAgo = this.addDays(today, -30);

    const sleep = await SleepLog.findOne({ userId, sleepTime: { $gte: yesterday, $lt: today } })
      .sort({ sleepTime: -1 })
      .exec();
    const pastSleeps = await SleepLog.find({
      userId,
      sleepTime: { $gte: thirtyDaysAgo, $lt: yesterday },
    }).exec();

    if (sleep && pastSleeps.length > 0) {
      const avgSleep =
        pastSleeps.reduce((acc, curr: any) => acc + (curr.duration || 0), 0) / pastSleeps.length;
      if ((sleep as any).duration < avgSleep - 1) {
        return 'Your sleep was below your baseline last night. Avoid overloading your schedule.';
      }
    }

    const recentHabitHistory = await HabitHistory.findOne({
      userId,
      date: { $gte: yesterday, $lt: today },
    }).exec();
    if (recentHabitHistory) {
      return "You're on a great streak! Keep the momentum going today.";
    }

    return 'Log your morning mood and water to help LifeOS personalize your day.';
  }

  generateAvoidance(dayType: DayType): string {
    if (dayType === 'recovery')
      return 'Avoid starting new projects. Focus on recovery and essentials only.';
    if (dayType === 'normal')
      return "Don't start low-priority tasks before completing your primary mission.";
    return 'Avoid context-switching. Protect your deep work blocks.';
  }

  async generateMission(userId: string) {
    const tz = await TimezoneUtil.getUserTimezone(userId);
    const todayDate = TimezoneUtil.getStartOfDayUTCForTimezone(tz);
    const existing = await this.repo.findByDate(userId, todayDate);
    if (existing) return existing;

    const { dayType, reasons } = await this.classifyDayType(userId);
    const primaryMission = await this.selectPrimaryMission(userId, dayType);
    const supportingGoals = await this.generateSupportingGoals(userId, dayType);
    const personalReminder = await this.generatePersonalReminder(userId);
    const avoidance = this.generateAvoidance(dayType);

    const data = {
      dayType,
      primaryMission,
      supportingGoals,
      personalReminder,
      avoidance,
      explanation: {
        dayTypeReason: reasons.join(' '),
        missionReason: primaryMission.reason,
        reminderReason: 'Based on your recent well-being and habit tracking data.',
      },
      status: 'active' as const,
    };

    return this.repo.upsertMission(userId, todayDate, data);
  }

  async getTodayMission(userId: string) {
    const tz = await TimezoneUtil.getUserTimezone(userId);
    const todayDate = TimezoneUtil.getStartOfDayUTCForTimezone(tz);
    const mission = await this.repo.findByDate(userId, todayDate);
    if (!mission) throw new NotFoundError('No mission generated for today.');

    let modified = false;

    // Sync primary mission with actual Task
    if (mission.primaryMission && mission.primaryMission.taskId) {
      const task = await Task.findById(mission.primaryMission.taskId);
      if (task) {
        const isTaskCompleted = task.status === 'Completed';
        if (mission.primaryMission.completed !== isTaskCompleted) {
          mission.primaryMission.completed = isTaskCompleted;
          modified = true;
        }
      }
    }

    if (modified) {
      await mission.save();
    }
    return mission;
  }

  async submitReview(userId: string, missionId: string, reviewInput: ISubmitReviewInput) {
    const tz = await TimezoneUtil.getUserTimezone(userId);
    const todayDate = TimezoneUtil.getStartOfDayUTCForTimezone(tz);
    const mission = await this.repo.findByDate(userId, todayDate);
    if (!mission || mission._id.toString() !== missionId) {
      throw new NotFoundError('Mission not found or not active today.');
    }

    const today = TimezoneUtil.getStartOfDayUTCForTimezone(tz);
    const tomorrow = TimezoneUtil.getEndOfDayUTCForTimezone(tz);

    const completedTasks = await Task.countDocuments({
      userId,
      status: 'Completed',
      completedAt: { $gte: today, $lte: tomorrow },
    }).exec();

    const plannedTasks = await Task.countDocuments({
      userId,
      dueDate: { $gte: today, $lte: tomorrow },
    }).exec();

    const completedHabits = await HabitHistory.countDocuments({
      userId,
      date: { $gte: today, $lte: tomorrow },
      completed: true,
    }).exec();
    const plannedHabits = await Habit.countDocuments({ userId, isPaused: false }).exec();

    const focusSessions = await FocusSession.find({
      userId,
      startTime: { $gte: today, $lte: tomorrow },
    }).exec();
    const focusMinutes = focusSessions.reduce((acc, s: any) => acc + (s.duration || 0), 0);
    const plannedFocusMinutes =
      mission.dayType === 'high-focus' ? 90 : mission.dayType === 'normal' ? 45 : 0;

    const review = {
      completedTasks,
      plannedTasks,
      completedHabits,
      plannedHabits,
      focusMinutes,
      plannedFocusMinutes,
      ...reviewInput,
      reviewedAt: new Date(),
    };

    const updated = await this.repo.updateReview(userId, missionId, review);
    return updated;
  }

  async getMissionHistory(userId: string, limit: number) {
    return this.repo.findHistory(userId, limit);
  }

  async getWeeklyMissions(userId: string): Promise<IWeeklyMissionItem[]> {
    const goals = await Goal.find({ userId, status: 'active' }).exec();
    const missions: IWeeklyMissionItem[] = [];

    for (const goal of goals) {
      const milestoneIndex = goal.milestones.findIndex((m: any) => !m.completed);
      if (milestoneIndex !== -1) {
        const milestone = goal.milestones[milestoneIndex];
        missions.push({
          id: `${goal._id.toString()}_${milestoneIndex}`,
          goalId: goal._id.toString(),
          goalTitle: goal.title,
          category: goal.category,
          milestoneTitle: milestone.title,
          target: milestone.title,
          completed: milestone.completed,
          progressPercent: goal.progress || 0,
        });
      }
      if (missions.length >= 5) break;
    }

    return missions;
  }

  async getCommunityMissions(userId: string): Promise<ICommunityMissionItem[]> {
    const missions: ICommunityMissionItem[] = [];

    const participants = await ChallengeParticipant.find({ userId }).populate('challengeId').exec();
    for (const p of participants) {
      const challenge = p.challengeId as any;
      if (challenge) {
        missions.push({
          id: `challenge_${challenge._id.toString()}`,
          type: 'challenge',
          title: challenge.title,
          description: challenge.description || 'Participate in the challenge',
          category: challenge.category || 'General',
          target: challenge.goal || 'Complete challenge',
          completed: p.completed,
          userProgress: p.progress || 0,
          participantsCount: challenge.participantsCount || 0,
          referenceId: challenge._id.toString(),
        });
        if (missions.length >= 5) break;
      }
    }

    if (missions.length < 5) {
      const groupMembers = await GroupMember.find({ userId }).populate('groupId').exec();
      for (const m of groupMembers) {
        const group = m.groupId as any;
        if (group) {
          missions.push({
            id: `group_${group._id.toString()}`,
            type: 'group',
            title: `Stay active in ${group.name}`,
            description: 'Check in with your group',
            category: 'Community',
            target: '1 check-in',
            completed: false,
            userProgress: 0,
            participantsCount: group.membersCount || 0,
            referenceId: group._id.toString(),
          });
          if (missions.length >= 5) break;
        }
      }
    }

    return missions.slice(0, 5);
  }

  async toggleMissionItem(userId: string, input: IToggleMissionItemInput): Promise<any> {
    const tz = await TimezoneUtil.getUserTimezone(userId);
    const todayDate = TimezoneUtil.getStartOfDayUTCForTimezone(tz);
    const mission = await this.repo.findByDate(userId, todayDate);
    if (!mission) throw new NotFoundError('No mission generated for today.');

    if (input.itemType === 'primary' && mission.primaryMission) {
      mission.primaryMission.completed = input.completed;
      if (mission.primaryMission.taskId) {
        const task = await Task.findById(mission.primaryMission.taskId);
        if (task && task.userId.toString() === userId) {
          task.status = input.completed ? 'Completed' : 'Pending';
          task.completedAt = input.completed ? new Date() : undefined;
          await task.save();
        }
      }
    } else if (
      input.itemType === 'supporting' &&
      mission.supportingGoals &&
      input.index !== undefined
    ) {
      if (mission.supportingGoals[input.index]) {
        mission.supportingGoals[input.index].completed = input.completed;
      }
    }

    await mission.save();
    return mission;
  }
}
