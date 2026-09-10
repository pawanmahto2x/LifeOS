export type AchievementCategory =
  'Productivity' | 'Consistency' | 'Focus' | 'Wellness' | 'Detox' | 'Community';

export interface IAchievementWithStatus {
  badgeId: string;
  badgeName: string;
  category: AchievementCategory;
  description: string;
  icon: string;
  requirementDescription: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  _id?: string;
}

export interface IAchievementsSummary {
  totalBadges: number;
  unlockedCount: number;
  unlockedPercentage: number;
  achievements: IAchievementWithStatus[];
}
