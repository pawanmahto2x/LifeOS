import { Types } from 'mongoose';

export type AchievementCategory =
  'Productivity' | 'Consistency' | 'Focus' | 'Wellness' | 'Detox' | 'Community';

export interface IAchievementDefinition {
  badgeId: string;
  badgeName: string;
  category: AchievementCategory;
  description: string;
  icon: string;
  requirementDescription: string;
}

export interface IAchievement {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  badgeId: string;
  badgeName: string;
  category: string;
  unlockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAchievementWithStatus extends IAchievementDefinition {
  isUnlocked: boolean;
  unlockedAt?: Date;
  _id?: string;
}

export interface IAchievementsSummaryDto {
  totalBadges: number;
  unlockedCount: number;
  unlockedPercentage: number;
  achievements: IAchievementWithStatus[];
}
