import { Types } from 'mongoose';

export type AIProvider = 'openai' | 'gemini' | 'claude' | 'groq' | 'openrouter';

export interface IAISettings {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  provider: AIProvider;
  encryptedApiKey: string;
  model: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAISettingsPublicDto {
  provider: AIProvider;
  model: string;
  isEnabled: boolean;
  hasKey: boolean;
}

export interface ISaveAISettingsDto {
  provider: AIProvider;
  apiKey: string;
  model: string;
  isEnabled?: boolean;
}

export interface IUpdateAISettingsDto {
  provider?: AIProvider;
  apiKey?: string;
  model?: string;
  isEnabled?: boolean;
}

export interface IWeeklyAIReportResponse {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  weeklySummary: string;
  generatedAt: string;
}

export interface IAICoachResponse {
  answer: string;
  contextSummary: {
    tasksCompletedThisWeek: number;
    activeHabitCount: number;
    focusMinutesThisWeek: number;
    currentHydrationMl: number;
  };
}

export interface IAIHealthAnalysisResponse {
  summary: string;
  sleepQualityTrend: string;
  hydrationCompliance: string;
  moodCorrelation: string;
  recommendations: string[];
}
