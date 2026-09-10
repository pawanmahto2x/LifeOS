import { ChallengeRepository } from '../repositories/challenge.repository';
import { ChallengeDocument } from '../models/challenge.model';
import { ChallengeParticipantDocument } from '../models/challenge-participant.model';
import {
  ICreateChallengeDto,
  IUpdateChallengeDto,
  IChallengeDetailsDto,
  IChallengeLeaderboardEntry,
} from '../types/challenge.types';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';

export class ChallengeService {
  private repo: ChallengeRepository;

  constructor(repo?: ChallengeRepository) {
    this.repo = repo || new ChallengeRepository();
  }

  // ─── Challenge CRUD ──────────────────────────────────────────────────────────

  async createChallenge(userId: string, data: ICreateChallengeDto): Promise<ChallengeDocument> {
    const challenge = await this.repo.create({
      ...data,
      creatorId: userId,
    });

    // Creator automatically joins the challenge
    await this.repo.addParticipant(challenge._id.toString(), userId);

    return challenge;
  }

  async getChallenges(
    userId: string,
    filter: {
      category?: string;
      difficulty?: string;
      status?: 'active' | 'upcoming' | 'ended' | 'all';
    },
  ): Promise<Array<ChallengeDocument & { participantCount: number; isJoined: boolean }>> {
    const now = new Date();
    const query: Record<string, unknown> = {
      // Show public challenges or private challenges created by the user
      $or: [{ visibility: 'Public' }, { creatorId: userId }],
    };

    if (filter.category) query.category = filter.category;
    if (filter.difficulty) query.difficulty = filter.difficulty;

    if (filter.status === 'active') {
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    } else if (filter.status === 'upcoming') {
      query.startDate = { $gt: now };
    } else if (filter.status === 'ended') {
      query.endDate = { $lt: now };
    }

    const challenges = await this.repo.findChallenges(query);

    return Promise.all(
      challenges.map(async (c) => {
        const participantCount = await this.repo.countParticipants(c._id.toString());
        const participant = await this.repo.findParticipant(c._id.toString(), userId);
        return Object.assign(c.toObject ? c.toObject() : c, {
          participantCount,
          isJoined: !!participant,
        });
      }),
    );
  }

  async getChallengeDetails(challengeId: string, userId: string): Promise<IChallengeDetailsDto> {
    const challenge = await this.repo.findById(challengeId);
    if (!challenge) throw new NotFoundError('Challenge not found');

    const participant = await this.repo.findParticipant(challengeId, userId);
    const participantCount = await this.repo.countParticipants(challengeId);
    const leaderboard = await this.getChallengeLeaderboard(challengeId);

    return {
      challenge,
      isParticipant: !!participant,
      userProgress: participant?.progress,
      isCompleted: participant?.completed,
      participantCount,
      leaderboard,
    };
  }

  async updateChallenge(
    challengeId: string,
    userId: string,
    data: IUpdateChallengeDto,
  ): Promise<ChallengeDocument> {
    const challenge = await this.repo.findById(challengeId);
    if (!challenge) throw new NotFoundError('Challenge not found');

    if (challenge.creatorId.toString() !== userId) {
      throw new ForbiddenError('Only the challenge creator can update this challenge');
    }

    const updated = await this.repo.update(challengeId, data);
    if (!updated) throw new NotFoundError('Challenge update failed');
    return updated;
  }

  async deleteChallenge(challengeId: string, userId: string): Promise<void> {
    const challenge = await this.repo.findById(challengeId);
    if (!challenge) throw new NotFoundError('Challenge not found');

    if (challenge.creatorId.toString() !== userId) {
      throw new ForbiddenError('Only the challenge creator can delete this challenge');
    }

    await this.repo.deleteParticipantsByChallenge(challengeId);
    await this.repo.delete(challengeId);
  }

  // ─── Participation & Progress ────────────────────────────────────────────────

  async joinChallenge(challengeId: string, userId: string): Promise<ChallengeParticipantDocument> {
    const challenge = await this.repo.findById(challengeId);
    if (!challenge) throw new NotFoundError('Challenge not found');

    const existing = await this.repo.findParticipant(challengeId, userId);
    if (existing) throw new BadRequestError('You have already joined this challenge');

    return this.repo.addParticipant(challengeId, userId);
  }

  async leaveChallenge(challengeId: string, userId: string): Promise<void> {
    const challenge = await this.repo.findById(challengeId);
    if (!challenge) throw new NotFoundError('Challenge not found');

    const existing = await this.repo.findParticipant(challengeId, userId);
    if (!existing) throw new BadRequestError('You are not participating in this challenge');

    await this.repo.removeParticipant(challengeId, userId);
  }

  async updateProgress(
    challengeId: string,
    userId: string,
    progress: number,
  ): Promise<ChallengeParticipantDocument> {
    const challenge = await this.repo.findById(challengeId);
    if (!challenge) throw new NotFoundError('Challenge not found');

    const participant = await this.repo.findParticipant(challengeId, userId);
    if (!participant) {
      throw new ForbiddenError('You must join this challenge before logging progress');
    }

    const updated = await this.repo.updateProgress(challengeId, userId, progress);
    if (!updated) throw new NotFoundError('Failed to update progress');
    return updated;
  }

  async getChallengeLeaderboard(challengeId: string): Promise<IChallengeLeaderboardEntry[]> {
    const participants = await this.repo.findParticipants(challengeId);

    return participants.map((p, idx) => {
      const u = p.userId as unknown as { _id: string; fullName: string; profileImage?: string };
      return {
        userId: u._id ? u._id.toString() : p.userId.toString(),
        fullName: u.fullName || 'Participant',
        profileImage: u.profileImage,
        progress: p.progress,
        completed: p.completed,
        completedAt: p.completedAt,
        rank: idx + 1,
      };
    });
  }
}
