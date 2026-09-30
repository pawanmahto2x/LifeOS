export type JournalTheme =
  | 'productivity'
  | 'procrastination'
  | 'sleep'
  | 'stress'
  | 'motivation'
  | 'accomplishment'
  | 'difficulty'
  | 'goals'
  | 'energy'
  | 'social'
  | 'health'
  | 'exercise'
  | 'work'
  | 'learning'
  | 'gratitude'
  | 'anxiety'
  | 'focus'
  | 'relationships';

export interface IDataConnection {
  observation: string;
  journalMention: string;
  recordedData: string;
  metric: string;
  comparison?: string;
}

export interface IJournalAnalysis {
  _id: string;
  userId: string;
  journalId: string;
  themes: JournalTheme[];
  extractedMood: string | null;
  extractedEnergy: 'high' | 'medium' | 'low' | null;
  keyPhrases: string[];
  dataConnections: IDataConnection[];
  analyzedAt: Date;
}

export interface IRecurringThemeItem {
  theme: JournalTheme;
  count: number;
  percentage: number;
  recentMentions: number;
}

export interface IRecurringThemesResponse {
  themes: IRecurringThemeItem[];
  totalEntriesAnalyzed: number;
  period: string;
}

export interface IJournalAnalysisResponse {
  analysis: IJournalAnalysis;
}
