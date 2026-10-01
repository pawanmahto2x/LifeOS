import {
  LayoutDashboard,
  CheckSquare,
  Repeat,
  Flame,
  HeartPulse,
  BookOpen,
  Smartphone,
  Users,
  Trophy,
  Award,
  Medal,
  BarChart3,
  Bot,
  Settings,
  LucideIcon,
  Brain,
  Target,
  History,
} from 'lucide-react';

export interface INavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface INavGroup {
  groupName: string;
  items: INavItem[];
}

export const navigationConfig: {
  dashboard: INavItem;
  groups: INavGroup[];
  settings: INavItem;
} = {
  dashboard: {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  groups: [
    {
      groupName: 'Strategy',
      items: [
        { title: 'Goals', href: '/goals', icon: Target },
        { title: 'Missions', href: '/missions', icon: Target },
      ],
    },
    {
      groupName: 'Productivity',
      items: [
        { title: 'Tasks', href: '/tasks', icon: CheckSquare },
        { title: 'Habits', href: '/habits', icon: Repeat },
        { title: 'Focus', href: '/focus', icon: Flame },
      ],
    },
    {
      groupName: 'Wellness',
      items: [
        { title: 'Health', href: '/health', icon: HeartPulse },
        { title: 'Journal', href: '/journal', icon: BookOpen, badge: 'AI' },
        { title: 'Digital Detox', href: '/digital-detox', icon: Smartphone },
      ],
    },
    {
      groupName: 'Community',
      items: [
        { title: 'Groups', href: '/groups', icon: Users },
        { title: 'Challenges', href: '/challenges', icon: Trophy },
        { title: 'Leaderboard', href: '/leaderboard', icon: Medal },
        { title: 'Achievements', href: '/achievements', icon: Award },
      ],
    },
    {
      groupName: 'Intelligence',
      items: [
        { title: 'Insights', href: '/insights', icon: Brain },
        { title: 'Life Replay', href: '/life-replay', icon: History },
        { title: 'Reports', href: '/reports', icon: BarChart3 },
        { title: 'AI Coach', href: '/ai-coach', icon: Bot },
      ],
    },
  ],
  settings: {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
};
