export type JournalMood = 'Excellent' | 'Happy' | 'Calm' | 'Neutral' | 'Stressed' | 'Sad' | 'Angry';

export interface IJournal {
  _id: string;
  userId: string;
  title: string;
  content: string;
  mood?: JournalMood;
  tags: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateJournalPayload {
  title: string;
  content: string;
  mood?: JournalMood;
  tags?: string[];
}

export interface IUpdateJournalPayload {
  title?: string;
  content?: string;
  mood?: JournalMood;
  tags?: string[];
}

export interface IJournalsListResponse {
  journals: IJournal[];
  total: number;
  page: number;
  totalPages: number;
}
