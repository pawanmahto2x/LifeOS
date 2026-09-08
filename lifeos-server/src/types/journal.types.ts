import { Types } from 'mongoose';

export type JournalMood = 'Excellent' | 'Happy' | 'Calm' | 'Neutral' | 'Stressed' | 'Sad' | 'Angry';

export interface IJournal {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  content: string;
  mood?: JournalMood;
  tags: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateJournalDto {
  userId: string;
  title: string;
  content: string;
  mood?: JournalMood;
  tags?: string[];
}

export interface IUpdateJournalDto {
  title?: string;
  content?: string;
  mood?: JournalMood;
  tags?: string[];
  isDeleted?: boolean;
}

export interface IJournalFilterOptions {
  userId: string;
  mood?: JournalMood;
  tag?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
