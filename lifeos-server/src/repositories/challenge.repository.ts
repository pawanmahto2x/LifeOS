import { Challenge, ChallengeDocument } from '../models/challenge.model';
import {
  ChallengeParticipant,
  ChallengeParticipantDocument,
} from '../models/challenge-participant.model';
import { ICreateChallengeDto, IUpdateChallengeDto } from '../types/challenge.types';

export class ChallengeRepository {
  // ─── Challenge CRUD ──────────────────────────────────────────────────────────

  async create(data: ICreateChallengeDto & { creatorId: string }): Promise<ChallengeDocument> {
    const challenge = new Challenge(data);
    return challenge.save();
  }

  async findById(id: string): Promise<ChallengeDocument | null> {
    return Challenge.findById(id).exec();
  }

  async findChallenges(filter: Record<string, unknown>): Promise<ChallengeDocument[]> {
    return Challenge.find(filter).sort({ startDate: -1 }).exec();
  }

  async update(id: string, data: IUpdateChallengeDto): Promise<ChallengeDocument | null> {
    return Challenge.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    ).exec();
  }

  async delete(id: string): Promise<ChallengeDocument | null> {
    return Challenge.findByIdAndDelete(id).exec();
  }

  // ─── Challenge Participants ──────────────────────────────────────────────────

  async addParticipant(challengeId: string, userId: string): Promise<ChallengeParticipantDocument> {
    const participant = new ChallengeParticipant({
      challengeId,
      userId,
      progress: 0,
      completed: false,
      joinedAt: new Date(),
    });
    return participant.save();
  }

  async findParticipant(
    challengeId: string,
    userId: string,
  ): Promise<ChallengeParticipantDocument | null> {
    return ChallengeParticipant.findOne({ challengeId, userId }).exec();
  }

  async removeParticipant(
    challengeId: string,
    userId: string,
  ): Promise<ChallengeParticipantDocument | null> {
    return ChallengeParticipant.findOneAndDelete({ challengeId, userId }).exec();
  }

  async updateProgress(
    challengeId: string,
    userId: string,
    progress: number,
  ): Promise<ChallengeParticipantDocument | null> {
    const completed = progress >= 100;
    const completedAt = completed ? new Date() : undefined;

    return ChallengeParticipant.findOneAndUpdate(
      { challengeId, userId },
      {
        $set: {
          progress,
          completed,
          ...(completed ? { completedAt } : {}),
        },
      },
      { new: true },
    ).exec();
  }

  async findParticipants(challengeId: string): Promise<ChallengeParticipantDocument[]> {
    return ChallengeParticipant.find({ challengeId })
      .populate('userId', 'fullName profileImage')
      .sort({ progress: -1, completedAt: 1, joinedAt: 1 })
      .exec();
  }

  async countParticipants(challengeId: string): Promise<number> {
    return ChallengeParticipant.countDocuments({ challengeId }).exec();
  }

  async deleteParticipantsByChallenge(challengeId: string): Promise<number> {
    const res = await ChallengeParticipant.deleteMany({ challengeId }).exec();
    return res.deletedCount;
  }
}
