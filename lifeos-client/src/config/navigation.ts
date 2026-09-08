import {
  LayoutDashboard,
  CheckSquare,
  Repeat,
  Flame,
  HeartPulse,
  BookOpen,
  Smartphone,
  AlertTriangle,
  Users,
  Trophy,
  Award,
  Medal,
  BarChart3,
  GitCommit,
  Bot,
  Settings,
  LucideIcon,
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
        { title: 'Journal', href: '/journal', icon: BookOpen },
        { title: 'Digital Detox', href: '/digital-detox', icon: Smartphone },
        { title: 'Emergency Mode', href: '/emergency', icon: AlertTriangle },
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
      groupName: 'Insights',
      items: [
        { title: 'Reports', href: '/reports', icon: BarChart3 },
        { title: 'Life Timeline', href: '/timeline', icon: GitCommit },
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
