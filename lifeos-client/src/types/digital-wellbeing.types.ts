export interface IUsageLog {
  id?: string;
  app: string;
  durationMinutes: number;
  category: string;
  reason?: string;
  createdAt?: string;
}

export interface IUsageSummary {
  totalDurationMinutes: number;
  logs: IUsageLog[];
}

export interface IBudget {
  id?: string;
  targetHours: number;
}

export interface IUrgeLog {
  id?: string;
  outcome: string;
  createdAt?: string;
}
