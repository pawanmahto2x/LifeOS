export type BaselinePeriod = '7d' | '14d' | '30d';
export type InsightType = 'correlation' | 'trend' | 'attention';

export interface IBaselineMetrics {
  avgTasksCompletedPerDay: number;
  avgFocusMinutesPerDay: number;
  avgSleepMinutes: number;
  avgWaterMlPerDay: number;
  avgMoodScore: number;
  avgHabitCompletionRate: number;
  dataPointCount: number;
  calculatedAt: string;
}

export interface IPersonalBaseline {
  _id: string;
  userId: string;
  period: BaselinePeriod;
  metrics: IBaselineMetrics;
  hasEnoughData: boolean;
}

export interface IBehaviourInsight {
  _id: string;
  type: InsightType;
  category: string;
  title: string;
  description: string;
  dataPoints: number;
  confidence: 'low' | 'medium' | 'high';
  period: string;
}

export interface ITrendItem {
  metric: string;
  current: number;
  previous: number;
  changePercent: number;
  direction: 'up' | 'down' | 'stable';
}

export interface IAttentionArea {
  metric: string;
  description: string;
  severity: 'info' | 'warning';
}

export interface IFullInsightsResponse {
  baselines: Record<BaselinePeriod, IPersonalBaseline | null>;
  patterns: IBehaviourInsight[];
  trends: ITrendItem[];
  attentionAreas: IAttentionArea[];
  hasEnoughData: boolean;
}
