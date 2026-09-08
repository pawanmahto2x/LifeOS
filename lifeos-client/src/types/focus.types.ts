export interface FocusSession {
  _id: string;
  id?: string;
  userId: string;
  taskId?:
    | {
        _id: string;
        id?: string;
        title: string;
        priority: string;
        status: string;
      }
    | string;
  duration: number; // Duration in minutes
  completed: boolean;
  distractions: number;
  startedAt: string;
  endedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FocusAnalyticsSummary {
  todayFocusMinutes: number;
  todayCompletedSessions: number;
  todayDistractions: number;
  totalFocusMinutes: number;
  totalCompletedSessions: number;
  currentRunningSession: FocusSession | null;
}

export interface FocusSessionsListResponse {
  sessions: FocusSession[];
  total: number;
  page: number;
  totalPages: number;
  analytics: FocusAnalyticsSummary;
}

export interface StartFocusSessionPayload {
  taskId?: string;
  duration: number;
  startedAt?: string;
}

export interface EndFocusSessionPayload {
  sessionId: string;
  distractions?: number;
  notes?: string;
  completed?: boolean;
}
