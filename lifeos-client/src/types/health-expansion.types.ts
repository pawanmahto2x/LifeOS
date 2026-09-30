export interface IBodyMetric {
  id?: string;
  height: number;
  weight: number;
  bmi: number;
  createdAt?: string;
}

export interface IActivityLog {
  id?: string;
  type: string;
  duration: number; // minutes
  calories: number;
  notes?: string;
  createdAt?: string;
}

export interface IMindfulnessSession {
  id?: string;
  duration: number; // minutes
  sessionType: string;
  moodBefore?: string;
  moodAfter?: string;
  createdAt?: string;
}
