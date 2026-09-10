import { IAchievementDefinition } from '../types/achievement.types';

export const ACHIEVEMENT_REGISTRY: IAchievementDefinition[] = [
  // Productivity
  {
    badgeId: 'first_task',
    badgeName: 'First Step',
    category: 'Productivity',
    description: 'Complete your first task on LifeOS.',
    icon: 'CheckSquare',
    requirementDescription: 'Complete 1 task',
  },
  {
    badgeId: 'task_century',
    badgeName: 'Task Century',
    category: 'Productivity',
    description: 'Complete 100 tasks on LifeOS.',
    icon: 'CheckCheck',
    requirementDescription: 'Complete 100 tasks',
  },
  {
    badgeId: 'productivity_legend',
    badgeName: 'Productivity Legend',
    category: 'Productivity',
    description: 'Complete 500 tasks across all categories.',
    icon: 'Crown',
    requirementDescription: 'Complete 500 tasks',
  },

  // Consistency / Habits
  {
    badgeId: 'habit_starter',
    badgeName: 'Building Momentum',
    category: 'Consistency',
    description: 'Track and check in to your first habit.',
    icon: 'Repeat',
    requirementDescription: 'Check in to 1 habit',
  },
  {
    badgeId: 'streak_7',
    badgeName: 'Weekly Warrior',
    category: 'Consistency',
    description: 'Maintain a 7-day habit streak.',
    icon: 'Flame',
    requirementDescription: 'Reach a 7-day streak',
  },
  {
    badgeId: 'streak_30',
    badgeName: '30-Day Streak',
    category: 'Consistency',
    description: 'Maintain an unbroken 30-day streak on any habit.',
    icon: 'Trophy',
    requirementDescription: 'Reach a 30-day streak',
  },

  // Focus
  {
    badgeId: 'first_focus',
    badgeName: 'Deep Work Pioneer',
    category: 'Focus',
    description: 'Complete your first focus session.',
    icon: 'Target',
    requirementDescription: 'Complete 1 focus session',
  },
  {
    badgeId: 'focus_master',
    badgeName: 'Focus Master',
    category: 'Focus',
    description: 'Accumulate over 500 minutes in deep focus.',
    icon: 'Zap',
    requirementDescription: 'Log 500+ minutes of deep focus',
  },

  // Wellness
  {
    badgeId: 'water_champion',
    badgeName: 'Water Champion',
    category: 'Wellness',
    description: 'Drink and log over 2,000 ml of water in a single day.',
    icon: 'Droplets',
    requirementDescription: 'Log 2,000+ ml hydration in one day',
  },
  {
    badgeId: 'early_bird',
    badgeName: 'Early Bird',
    category: 'Wellness',
    description: 'Log a sleep session that wakes before 6:30 AM.',
    icon: 'Sun',
    requirementDescription: 'Wake up before 06:30 AM',
  },
  {
    badgeId: 'mindful_journaler',
    badgeName: 'Mindful Soul',
    category: 'Wellness',
    description: 'Write 10 journal entries reflecting on your days.',
    icon: 'BookOpen',
    requirementDescription: 'Log 10 journal entries',
  },

  // Community & Challenges
  {
    badgeId: 'challenge_finisher',
    badgeName: 'Challenge Finisher',
    category: 'Community',
    description: 'Reach 100% completion in any community challenge.',
    icon: 'Award',
    requirementDescription: 'Complete 1 challenge to 100%',
  },
  {
    badgeId: 'team_player',
    badgeName: 'Team Player',
    category: 'Community',
    description: 'Join an accountability group and cast a weekly goal vote.',
    icon: 'Users',
    requirementDescription: 'Cast a vote in an accountability group',
  },
];
