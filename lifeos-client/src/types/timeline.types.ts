export type TimelineEntryType =
  'GoalCompleted' | 'HabitMilestone' | 'ChallengeCompleted' | 'AchievementUnlocked';

export interface ITimelineEntry {
  _id: string;
  userId: string;
  entryType: TimelineEntryType;
  title: string;
  description: string;
  sourceId: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITimelinePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ITimelineResponse {
  entries: ITimelineEntry[];
  pagination: ITimelinePagination;
}

export interface ITimelineQueryParams {
  page?: number;
  limit?: number;
  entryType?: TimelineEntryType;
  from?: string;
  to?: string;
}
