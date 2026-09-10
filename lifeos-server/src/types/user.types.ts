import { Types } from 'mongoose';

export type AuthProviderType = 'email' | 'google';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface IUser {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password?: string;
  googleId?: string;
  profileImage?: string;
  authProvider: AuthProviderType;
  refreshTokenHash?: string;
  timezone: string;
  language: string;
  theme?: ThemePreference;
  height?: number;
  weight?: number;
  gender?: string;
  dateOfBirth?: Date;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserSafe = Omit<IUser, 'password' | 'refreshTokenHash'>;

export interface ICreateUserDto {
  fullName: string;
  email: string;
  password?: string;
  googleId?: string;
  profileImage?: string;
  authProvider?: AuthProviderType;
  timezone?: string;
  language?: string;
  theme?: ThemePreference;
}

export interface IChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface IUserDataExport {
  user: IUserSafe;
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
