import { Types } from 'mongoose';

export type TimelineEntryType =
  'GoalCompleted' | 'HabitMilestone' | 'ChallengeCompleted' | 'AchievementUnlocked';

export interface TimelineEntryDTO {
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

export interface TimelineQueryFilters {
  page?: number;
  limit?: number;
  entryType?: TimelineEntryType;
  from?: Date;
  to?: Date;
}

export interface TimelinePaginationDTO {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimelineListResponseDTO {
  entries: TimelineEntryDTO[];
  pagination: TimelinePaginationDTO;
}

export interface CreateTimelineEntryInput {
  userId: Types.ObjectId | string;
  entryType: TimelineEntryType;
  title: string;
  description: string;
  sourceId: Types.ObjectId | string;
  occurredAt?: Date;
}
