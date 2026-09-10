import { Types } from 'mongoose';

export type ChallengeVisibility = 'Public' | 'Private' | 'Friends' | 'Group';
export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type ChallengeCategory =
  'Fitness' | 'Productivity' | 'Learning' | 'Mindfulness' | 'Health' | 'Custom';

export interface IChallenge {
  _id: Types.ObjectId;
  creatorId: Types.ObjectId;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  startDate: Date;
  endDate: Date;
  visibility: ChallengeVisibility;
  reward?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChallengeParticipant {
  _id: Types.ObjectId;
  challengeId: Types.ObjectId;
  userId: Types.ObjectId;
  progress: number; // percentage 0 - 100
  completed: boolean;
  joinedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateChallengeDto {
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  visibility?: ChallengeVisibility;
  startDate: Date;
  endDate: Date;
  reward?: string;
}

export interface IUpdateChallengeDto {
  title?: string;
  description?: string;
  category?: ChallengeCategory;
  difficulty?: ChallengeDifficulty;
  visibility?: ChallengeVisibility;
  startDate?: Date;
  endDate?: Date;
  reward?: string;
}

export interface IUpdateChallengeProgressDto {
  progress: number; // 0-100
}

export interface IChallengeLeaderboardEntry {
  userId: string;
  fullName: string;
  profileImage?: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  rank: number;
}

export interface IChallengeDetailsDto {
  challenge: IChallenge;
  isParticipant: boolean;
  userProgress?: number;
  isCompleted?: boolean;
  participantCount: number;
  leaderboard: IChallengeLeaderboardEntry[];
}
