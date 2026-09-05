import { Types } from 'mongoose';

export type AuthProviderType = 'email' | 'google';

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
}
