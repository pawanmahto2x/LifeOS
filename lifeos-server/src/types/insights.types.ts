import { Types } from 'mongoose';

export type BaselinePeriod = '7d' | '14d' | '30d';
export type InsightType = 'correlation' | 'trend' | 'attention';
export type InsightCategory =
  | 'sleep_focus'
  | 'sleep_tasks'
  | 'mood_productivity'
  | 'habits_tasks'
  | 'focus_trend'
  | 'task_trend'
  | 'sleep_trend'
  | 'water_trend'
  | 'mood_trend'
  | 'habit_trend';

export interface IPersonalBaseline {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  period: BaselinePeriod;
  avgTasksCompletedPerDay: number;
  avgFocusMinutesPerDay: number;
  avgSleepMinutes: number;
  avgWaterMlPerDay: number;
  avgMoodScore: number;
  avgHabitCompletionRate: number;
  dataPointCount: number;
  calculatedAt: Date;
}

export interface IBehaviourInsight {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: InsightType;
  category: InsightCategory;
  title: string;
  description: string;
  dataPoints: number;
  confidence: 'low' | 'medium' | 'high';
  period: BaselinePeriod;
  isActive: boolean;
  createdAt: Date;
}

export interface IAttentionArea {
  metric: string;
  description: string;
  severity: 'info' | 'warning';
}

export interface IBaselineResponse {
  period: BaselinePeriod;
  baseline: Omit<IPersonalBaseline, '_id' | 'userId'> | null;
  metrics: Omit<IPersonalBaseline, '_id' | 'userId'> | null;
  hasEnoughData: boolean;
}

export interface ITrendItem {
  metric: string;
  current: number;
  previous: number;
  changePercent: number;
  direction: 'up' | 'down' | 'stable';
}

export interface IInsightsResponse {
  baselines: {
    '7d'?: IBaselineResponse;
    '14d'?: IBaselineResponse;
    '30d'?: IBaselineResponse;
  };
  patterns: IBehaviourInsight[];
  trends: ITrendItem[];
  attentionAreas: IAttentionArea[];
  hasEnoughData: boolean;
}
