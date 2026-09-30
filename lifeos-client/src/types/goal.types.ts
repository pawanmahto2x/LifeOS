export type GoalCategory =
  'Health' | 'Career' | 'Finance' | 'Relationships' | 'Personal Development' | 'Other';

export type GoalStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';

export interface IMilestone {
  _id: string;
  title: string;
  targetDate?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface IGoal {
  _id: string;
  user: string;
  title: string;
  description?: string;
  category: GoalCategory;
  deadline?: string;
  progress: number;
  status: GoalStatus;
  milestones: IMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface IAIGoalPlan {
  milestones: string[];
  tasks: { milestoneIndex?: number; title: string }[];
  habits: { title: string; frequency: string }[];
}

export interface IGoalReport {
  goalId: string;
  progress: { previous: number; current: number };
  completed: { tasks: number; habits: number; focusSessions: number };
  consistency: { coding?: number; focus?: number; general: number };
  obstacles: string;
  nextMonthPriorities: string[];
}
