import { Types } from 'mongoose';

export type GroupPrivacy = 'Public' | 'Private' | 'Invite Only';
export type GroupMemberRole = 'Owner' | 'Admin' | 'Moderator' | 'Member';

export interface IGroup {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  name: string;
  description?: string;
  groupImage?: string;
  inviteCode: string;
  privacy: GroupPrivacy;
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupMember {
  _id: Types.ObjectId;
  groupId: Types.ObjectId;
  userId: Types.ObjectId;
  role: GroupMemberRole;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVote {
  _id: Types.ObjectId;
  groupId: Types.ObjectId;
  userId: Types.ObjectId;
  optionId: string;
  votingPeriodStart: Date;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs
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

export interface IJoinGroupDto {
  inviteCode: string;
}

export interface IUpdateMemberRoleDto {
  role: 'Admin' | 'Moderator' | 'Member';
}

export interface IVoteGoalDto {
  optionId: string;
}

export interface ILeaderboardEntry {
  userId: string;
  fullName: string;
  profileImage?: string;
  role: GroupMemberRole;
  score: number; // calculated from tasks completed + focus minutes + habit streaks
  rank: number;
}

export interface IGroupDetailsDto {
  group: IGroup;
  members: Array<{
    userId: string;
    fullName: string;
    profileImage?: string;
    role: GroupMemberRole;
    joinedAt: Date;
  }>;
  memberCount: number;
  currentUserRole?: GroupMemberRole;
  leaderboard: ILeaderboardEntry[];
  activeWeeklyGoals: Array<{
    id: string;
    title: string;
    description: string;
    votesCount: number;
    hasVoted: boolean;
  }>;
}
