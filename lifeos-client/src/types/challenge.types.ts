export type ChallengeVisibility = 'Public' | 'Private' | 'Friends' | 'Group';
export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type ChallengeCategory =
  'Fitness' | 'Productivity' | 'Learning' | 'Mindfulness' | 'Health' | 'Custom';

export interface IChallenge {
  _id: string;
  creatorId: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  startDate: string;
  endDate: string;
  visibility: ChallengeVisibility;
  reward?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IChallengeLeaderboardEntry {
  userId: string;
  fullName: string;
  profileImage?: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
  rank: number;
}

export interface IChallengeDetails {
  challenge: IChallenge;
  isParticipant: boolean;
  userProgress?: number;
  isCompleted?: boolean;
  participantCount: number;
  leaderboard: IChallengeLeaderboardEntry[];
}

export interface ICreateChallengeDto {
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  visibility?: ChallengeVisibility;
  startDate: string;
  endDate: string;
  reward?: string;
}

export interface IChallengeListItem extends IChallenge {
  participantCount: number;
  isJoined: boolean;
}
