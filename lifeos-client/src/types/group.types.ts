export type GroupPrivacy = 'Public' | 'Private' | 'Invite Only';
export type GroupMemberRole = 'Owner' | 'Admin' | 'Moderator' | 'Member';

export interface IGroup {
  _id: string;
  ownerId: string;
  name: string;
  description?: string;
  groupImage?: string;
  inviteCode: string;
  privacy: GroupPrivacy;
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
}

export interface IGroupMemberInfo {
  userId: string;
  fullName: string;
  profileImage?: string;
  role: GroupMemberRole;
  joinedAt: string;
}

export interface ILeaderboardEntry {
  userId: string;
  fullName: string;
  profileImage?: string;
  role: GroupMemberRole;
  score: number;
  rank: number;
}

export interface IWeeklyGoalOption {
  id: string;
  title: string;
  description: string;
  votesCount: number;
  hasVoted: boolean;
}

export interface IGroupDetails {
  group: IGroup;
  members: IGroupMemberInfo[];
  memberCount: number;
  currentUserRole?: GroupMemberRole;
  leaderboard: ILeaderboardEntry[];
  activeWeeklyGoals: IWeeklyGoalOption[];
}

export interface ICreateGroupDto {
  name: string;
  description?: string;
  groupImage?: string;
  privacy?: GroupPrivacy;
  maxMembers?: number;
}

export interface IUpdateGroupDto {
  name?: string;
  description?: string;
  groupImage?: string;
  privacy?: GroupPrivacy;
  maxMembers?: number;
}
