import { IUser } from './auth.types';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface IProfileUpdatePayload {
  fullName?: string;
  timezone?: string;
  language?: string;
  theme?: ThemePreference;
  height?: number;
  weight?: number;
  gender?: string;
  dateOfBirth?: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface IUserDataExport {
  user: IUser;
  tasks: unknown[];
  habits: unknown[];
  journals: unknown[];
  health: {
    waterLogs: unknown[];
    sleepLogs: unknown[];
    moodLogs: unknown[];
  };
  focusSessions: unknown[];
  timeline: unknown[];
  achievements: unknown[];
  exportedAt: string;
}
