import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AchievementService } from '../src/services/achievement.service';
import { AchievementRepository } from '../src/repositories/achievement.repository';
import { AchievementDocument } from '../src/models/achievement.model';
import { ACHIEVEMENT_REGISTRY } from '../src/config/achievements.config';
import { Types } from 'mongoose';

// ─── Mock Repository ──────────────────────────────────────────────────────────

class MockAchievementRepository extends AchievementRepository {
  private store: Map<string, AchievementDocument> = new Map();

  async findByUserId(userId: string): Promise<AchievementDocument[]> {
    return Array.from(this.store.values()).filter(
      (a) => a.userId.toString() === userId,
    );
  }

  async findByBadge(userId: string, badgeId: string): Promise<AchievementDocument | null> {
    for (const doc of this.store.values()) {
      if (doc.userId.toString() === userId && doc.badgeId === badgeId) {
        return doc;
      }
    }
    return null;
  }

  async findById(id: string, userId: string): Promise<AchievementDocument | null> {
    const doc = this.store.get(id);
    if (!doc || doc.userId.toString() !== userId) return null;
    return doc;
  }

  async unlockBadge(
    userId: string,
    badgeId: string,
    badgeName: string,
    category: string,
  ): Promise<AchievementDocument | null> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      userId: new Types.ObjectId(userId),
      badgeId,
      badgeName,
      category,
      unlockedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as AchievementDocument;

    this.store.set(id.toString(), doc);
    return doc;
  }

  async countUnlocked(userId: string): Promise<number> {
    return Array.from(this.store.values()).filter(
      (a) => a.userId.toString() === userId,
    ).length;
  }
}

class MockAchievementService extends AchievementService {
  constructor(repo: MockAchievementRepository) {
    super(repo);
  }

  // Bypass DB model queries in unit test
  override async evaluateAndUnlockAchievements(): Promise<string[]> {
    return [];
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 16 - Achievements & Gamification Service Unit Tests', () => {
  const userId = new Types.ObjectId().toString();
  const repo = new MockAchievementRepository();
  const service = new MockAchievementService(repo);

  it('should list all predefined achievement badges with unlock status', async () => {
    const summary = await service.getUserAchievements(userId);

    assert.strictEqual(summary.totalBadges, ACHIEVEMENT_REGISTRY.length);
    assert.strictEqual(summary.unlockedCount, 0);
    assert.strictEqual(summary.unlockedPercentage, 0);

    const firstTaskBadge = summary.achievements.find((b) => b.badgeId === 'first_task');
    assert.ok(firstTaskBadge);
    assert.strictEqual(firstTaskBadge.isUnlocked, false);
  });

  it('should manually unlock a badge and update unlock percentage', async () => {
    await repo.unlockBadge(userId, 'first_task', 'First Step', 'Productivity');

    const summary = await service.getUserAchievements(userId);
    assert.strictEqual(summary.unlockedCount, 1);
    assert.ok(summary.unlockedPercentage > 0);

    const firstTaskBadge = summary.achievements.find((b) => b.badgeId === 'first_task');
    assert.ok(firstTaskBadge);
    assert.strictEqual(firstTaskBadge.isUnlocked, true);
    assert.ok(firstTaskBadge.unlockedAt instanceof Date);
  });

  it('should retrieve a single unlocked achievement by ID', async () => {
    const unlocked = await repo.findByUserId(userId);
    assert.ok(unlocked.length > 0);
    const target = unlocked[0];

    const found = await service.getAchievementById(target._id.toString(), userId);
    assert.strictEqual(found.badgeId, 'first_task');
    assert.strictEqual(found.badgeName, 'First Step');
  });

  it('should prevent cross-user access to unlocked achievement details', async () => {
    const otherUserId = new Types.ObjectId().toString();
    const unlocked = await repo.findByUserId(userId);
    const target = unlocked[0];

    await assert.rejects(
      async () => {
        await service.getAchievementById(target._id.toString(), otherUserId);
      },
      { name: 'NotFoundError' },
    );
  });
});
