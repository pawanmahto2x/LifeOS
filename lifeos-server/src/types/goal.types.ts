export type GoalCategory =
  | 'career'
  | 'education'
  | 'health'
  | 'fitness'
  | 'personal'
  | 'finance'
  | 'relationships'
  | 'creativity'
  | 'other';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export interface IMilestone {
  _id?: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface IGoal {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: GoalCategory;
  deadline: Date;
  status: GoalStatus;
  milestones: IMilestone[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAIGoalPlan {
  milestones: string[];
  tasks: { milestoneIndex: number; title: string }[];
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
