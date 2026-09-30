export type DayType = 'recovery' | 'normal' | 'high-focus';
export type MissionStatus = 'active' | 'completed' | 'expired';

export interface ISupportingGoal {
  title: string;
  type: 'habit' | 'focus' | 'health' | 'task';
  targetValue?: string;
  completed: boolean;
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
  reviewedAt: string;
}

export interface IDailyMission {
  _id: string;
  userId: string;
  date: string;
  dayType: DayType;
  primaryMission: {
    title: string;
    taskId?: string;
    reason: string;
  };
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
  createdAt: string;
  updatedAt: string;
}

export interface ISubmitReviewInput {
  whatWentWell?: string;
  whatRemainedIncomplete?: string;
  moodReflection?: string;
  tomorrowChange?: string;
}
