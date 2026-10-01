export type DayType = 'recovery' | 'normal' | 'high-focus';
export type MissionStatus = 'active' | 'completed' | 'expired';

export interface ISupportingGoal {
  title: string;
  type: 'habit' | 'focus' | 'health' | 'task' | 'milestone' | 'goal';
  targetValue?: string;
  completed: boolean;
  goalId?: string;
  goalTitle?: string;
  category?: string;
}

export interface IPrimaryMission {
  title: string;
  taskId?: string;
  goalId?: string;
  goalTitle?: string;
  category?: string;
  reason: string;
  completed?: boolean;
}

export interface IDailyReview {
  completedTasks: number;
  plannedTasks: number;
  completedHabits: number;
  plannedHabits: number;
  focusMinutes: number;
  plannedFocusMinutes: number;
  whatWentWell?: string;
  whatRemainedIncomplete?: string;
  moodReflection?: string;
  tomorrowChange?: string;
  reviewedAt: Date;
}

export interface IDailyMission {
  _id: string;
  userId: string;
  date: Date;
  dayType: DayType;
  primaryMission: IPrimaryMission;
  supportingGoals: ISupportingGoal[];
  personalReminder: string;
  avoidance: string;
  explanation: {
    dayTypeReason: string;
    missionReason: string;
    reminderReason: string;
  };
  review?: IDailyReview;
  status: MissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWeeklyMissionItem {
  id: string;
  goalId: string;
  goalTitle: string;
  category: string;
  milestoneTitle: string;
  target: string;
  completed: boolean;
  progressPercent: number;
}

export interface ICommunityMissionItem {
  id: string;
  title: string;
  description: string;
  type: 'challenge' | 'group';
  category: string;
  target: string;
  userProgress: number;
  completed: boolean;
  participantsCount: number;
  referenceId: string;
}

export interface IToggleMissionItemInput {
  missionId?: string;
  itemType: 'primary' | 'supporting';
  index?: number;
  completed: boolean;
}

export interface IDailyMissionResponse {
  message: string;
  data: IDailyMission | IDailyMission[];
}

export interface ISubmitReviewInput {
  whatWentWell?: string;
  whatRemainedIncomplete?: string;
  moodReflection?: string;
  tomorrowChange?: string;
}
