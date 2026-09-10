import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ChallengeService } from '../src/services/challenge.service';
import { ChallengeRepository } from '../src/repositories/challenge.repository';
import { ChallengeDocument } from '../src/models/challenge.model';
import { ChallengeParticipantDocument } from '../src/models/challenge-participant.model';
import {
  ICreateChallengeDto,
  IUpdateChallengeDto,
} from '../types/challenge.types';
import { Types } from 'mongoose';

// ─── Mock Repository ──────────────────────────────────────────────────────────

class MockChallengeRepository extends ChallengeRepository {
  private challenges: Map<string, ChallengeDocument> = new Map();
  private participants: Map<string, ChallengeParticipantDocument> = new Map();

  async create(data: ICreateChallengeDto & { creatorId: string }): Promise<ChallengeDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      creatorId: new Types.ObjectId(data.creatorId),
      title: data.title,
      description: data.description,
      category: data.category,
      difficulty: data.difficulty,
      startDate: data.startDate,
      endDate: data.endDate,
      visibility: data.visibility || 'Public',
      reward: data.reward,
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject: function () {
        return { ...this };
      },
    } as unknown as ChallengeDocument;

    this.challenges.set(id.toString(), doc);
    return doc;
  }

  async findById(id: string): Promise<ChallengeDocument | null> {
    return this.challenges.get(id) || null;
  }

  async findChallenges(): Promise<ChallengeDocument[]> {
    return Array.from(this.challenges.values());
  }

  async update(id: string, data: IUpdateChallengeDto): Promise<ChallengeDocument | null> {
    const doc = this.challenges.get(id);
    if (!doc) return null;
    Object.assign(doc, data, { updatedAt: new Date() });
    return doc;
  }

  async delete(id: string): Promise<ChallengeDocument | null> {
    const doc = this.challenges.get(id);
    if (!doc) return null;
    this.challenges.delete(id);
    return doc;
  }

  async addParticipant(challengeId: string, userId: string): Promise<ChallengeParticipantDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      challengeId: new Types.ObjectId(challengeId),
      userId: new Types.ObjectId(userId),
      progress: 0,
      completed: false,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as ChallengeParticipantDocument;

    this.participants.set(`${challengeId}:${userId}`, doc);
    return doc;
  }

  async findParticipant(
    challengeId: string,
    userId: string,
  ): Promise<ChallengeParticipantDocument | null> {
    return this.participants.get(`${challengeId}:${userId}`) || null;
  }

  async removeParticipant(
    challengeId: string,
    userId: string,
  ): Promise<ChallengeParticipantDocument | null> {
    const p = this.participants.get(`${challengeId}:${userId}`);
    if (!p) return null;
    this.participants.delete(`${challengeId}:${userId}`);
    return p;
  }

  async updateProgress(
    challengeId: string,
    userId: string,
    progress: number,
  ): Promise<ChallengeParticipantDocument | null> {
    const p = this.participants.get(`${challengeId}:${userId}`);
    if (!p) return null;
    p.progress = progress;
    p.completed = progress >= 100;
    if (p.completed) p.completedAt = new Date();
    return p;
  }

  async findParticipants(challengeId: string): Promise<ChallengeParticipantDocument[]> {
    return Array.from(this.participants.values())
      .filter((p) => p.challengeId.toString() === challengeId)
      .sort((a, b) => b.progress - a.progress);
  }

  async countParticipants(challengeId: string): Promise<number> {
    return Array.from(this.participants.values()).filter(
      (p) => p.challengeId.toString() === challengeId,
    ).length;
  }

  async deleteParticipantsByChallenge(challengeId: string): Promise<number> {
    let count = 0;
    for (const key of Array.from(this.participants.keys())) {
      if (key.startsWith(`${challengeId}:`)) {
        this.participants.delete(key);
        count++;
      }
    }
    return count;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 14 - Challenges Service Unit Tests', () => {
  const creatorId = new Types.ObjectId().toString();
  const participantId = new Types.ObjectId().toString();
  const repo = new MockChallengeRepository();
  const service = new ChallengeService(repo);

  let challengeId: string;

  it('should create a challenge and automatically enroll the creator as a participant', async () => {
    const challenge = await service.createChallenge(creatorId, {
      title: '30 Days of Deep Work',
      description: 'Log 2 hours of focus sessions each day',
      category: 'Productivity',
      difficulty: 'Hard',
      visibility: 'Public',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-30'),
      reward: 'Focus Master Badge',
    });

    assert.ok(challenge._id);
    assert.strictEqual(challenge.title, '30 Days of Deep Work');
    assert.strictEqual(challenge.difficulty, 'Hard');

    challengeId = challenge._id.toString();

    // Check creator was auto-enrolled
    const participant = await repo.findParticipant(challengeId, creatorId);
    assert.ok(participant);
    assert.strictEqual(participant.progress, 0);
  });

  it('should allow another user to join the challenge', async () => {
    const p = await service.joinChallenge(challengeId, participantId);
    assert.ok(p);
    assert.strictEqual(p.progress, 0);

    const count = await repo.countParticipants(challengeId);
    assert.strictEqual(count, 2);
  });

  it('should prevent joining the same challenge twice', async () => {
    await assert.rejects(
      async () => {
        await service.joinChallenge(challengeId, participantId);
      },
      { name: 'BadRequestError' },
    );
  });

  it('should update user progress and mark as completed when reaching 100%', async () => {
    const updated = await service.updateProgress(challengeId, participantId, 100);
    assert.strictEqual(updated.progress, 100);
    assert.strictEqual(updated.completed, true);
    assert.ok(updated.completedAt instanceof Date);
  });

  it('should return ranked leaderboard sorted by progress', async () => {
    const leaderboard = await service.getChallengeLeaderboard(challengeId);
    assert.strictEqual(leaderboard.length, 2);
    // participantId has 100% progress, creator has 0%
    assert.strictEqual(leaderboard[0].progress, 100);
    assert.strictEqual(leaderboard[0].rank, 1);
    assert.strictEqual(leaderboard[1].progress, 0);
    assert.strictEqual(leaderboard[1].rank, 2);
  });

  it('should allow a participant to leave the challenge', async () => {
    await service.leaveChallenge(challengeId, participantId);
    const count = await repo.countParticipants(challengeId);
    assert.strictEqual(count, 1);
  });

  it('should prevent non-creators from deleting the challenge', async () => {
    await assert.rejects(
      async () => {
        await service.deleteChallenge(challengeId, participantId);
      },
      { name: 'ForbiddenError' },
    );
  });
});
