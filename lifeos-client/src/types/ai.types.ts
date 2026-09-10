export type AIProvider = 'openai' | 'gemini' | 'claude' | 'groq' | 'openrouter';

export interface IAISettings {
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

export interface IWeeklyAIReport {
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

export interface IAIHealthAnalysis {
  summary: string;
  sleepQualityTrend: string;
  hydrationCompliance: string;
  moodCorrelation: string;
  recommendations: string[];
}
