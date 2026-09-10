import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TimelineService } from '../src/services/timeline.service';
import { TimelineRepository } from '../src/repositories/timeline.repository';
import { TimelineDocument } from '../src/models/timeline.model';
import {
  CreateTimelineEntryInput,
  TimelineListResponseDTO,
  TimelineQueryFilters,
} from '../src/types/timeline.types';
import { Types } from 'mongoose';

// ─── Mock Repository ──────────────────────────────────────────────────────────

class MockTimelineRepository extends TimelineRepository {
  private store: Map<string, TimelineDocument> = new Map();

  async findUserTimeline(
    userId: string,
    filters: TimelineQueryFilters = {},
  ): Promise<TimelineListResponseDTO> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;

    let items = Array.from(this.store.values()).filter(
      (entry) => entry.userId.toString() === userId,
    );

    if (filters.entryType) {
      items = items.filter((entry) => entry.entryType === filters.entryType);
    }

    if (filters.from) {
      items = items.filter((entry) => entry.occurredAt >= (filters.from as Date));
    }

    if (filters.to) {
      items = items.filter((entry) => entry.occurredAt <= (filters.to as Date));
    }

    // Sort reverse-chronologically by occurredAt
    items.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    const total = items.length;
    const skip = (page - 1) * limit;
    const paginated = items.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);

    const formattedEntries = paginated.map((entry) => ({
      _id: entry._id.toString(),
      userId: entry.userId.toString(),
      entryType: entry.entryType,
      title: entry.title,
      description: entry.description,
      sourceId: entry.sourceId.toString(),
      occurredAt: entry.occurredAt.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }));

    return {
      entries: formattedEntries,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findById(id: string, userId: string): Promise<TimelineDocument | null> {
    const doc = this.store.get(id);
    if (!doc || doc.userId.toString() !== userId) return null;
    return doc;
  }

  async createEntry(input: CreateTimelineEntryInput): Promise<TimelineDocument | null> {
    // Check if unique index match already exists
    for (const item of this.store.values()) {
      if (
        item.userId.toString() === input.userId.toString() &&
        item.entryType === input.entryType &&
        item.sourceId.toString() === input.sourceId.toString()
      ) {
        return item;
      }
    }

    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      userId: new Types.ObjectId(input.userId),
      entryType: input.entryType,
      title: input.title,
      description: input.description,
      sourceId: new Types.ObjectId(input.sourceId),
      occurredAt: input.occurredAt || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as TimelineDocument;

    this.store.set(id.toString(), doc);
    return doc;
  }

  async countByUserId(userId: string): Promise<number> {
    return Array.from(this.store.values()).filter(
      (entry) => entry.userId.toString() === userId,
    ).length;
  }
}

class MockTimelineService extends TimelineService {
  constructor(repo: MockTimelineRepository) {
    super(repo);
  }

  // Bypass raw DB model queries in unit test
  override async syncMilestones(): Promise<void> {
    // No-op during isolated mock tests
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 17 - Life Timeline Service Unit Tests', () => {
  const userId = new Types.ObjectId().toString();
  const repo = new MockTimelineRepository();
  const service = new MockTimelineService(repo);

  it('should return an empty timeline with clean pagination when no entries exist', async () => {
    const result = await service.getTimeline(userId);

    assert.strictEqual(result.entries.length, 0);
    assert.strictEqual(result.pagination.total, 0);
    assert.strictEqual(result.pagination.page, 1);
    assert.strictEqual(result.pagination.totalPages, 0);
  });

  it('should record timeline entries and return them in reverse chronological order', async () => {
    const olderDate = new Date('2026-08-01T10:00:00.000Z');
    const newerDate = new Date('2026-09-01T10:00:00.000Z');

    const source1 = new Types.ObjectId();
    const source2 = new Types.ObjectId();

    await service.recordEntry({
      userId,
      entryType: 'GoalCompleted',
      title: 'First Milestone Task Completed',
      description: 'Finished launching MVP',
      sourceId: source1,
      occurredAt: olderDate,
    });

    await service.recordEntry({
      userId,
      entryType: 'AchievementUnlocked',
      title: 'Achievement: Productivity Legend',
      description: 'Completed 500 tasks',
      sourceId: source2,
      occurredAt: newerDate,
    });

    const result = await service.getTimeline(userId);
    assert.strictEqual(result.entries.length, 2);
    assert.strictEqual(result.pagination.total, 2);
    // Newer date should appear first
    assert.strictEqual(result.entries[0].entryType, 'AchievementUnlocked');
    assert.strictEqual(result.entries[1].entryType, 'GoalCompleted');
  });

  it('should prevent duplicate timeline entries for the exact same source milestone', async () => {
    const source = new Types.ObjectId();
    const date = new Date('2026-09-05T12:00:00.000Z');

    await service.recordEntry({
      userId,
      entryType: 'ChallengeCompleted',
      title: 'Challenge Completed: 30-Day Fitness',
      description: 'Reached 100% challenge completion',
      sourceId: source,
      occurredAt: date,
    });

    // Duplicate call
    await service.recordEntry({
      userId,
      entryType: 'ChallengeCompleted',
      title: 'Challenge Completed: 30-Day Fitness',
      description: 'Reached 100% challenge completion',
      sourceId: source,
      occurredAt: date,
    });

    const count = await repo.countByUserId(userId);
    // Should be 3 (2 from previous test + 1 challenge)
    assert.strictEqual(count, 3);
  });

  it('should filter timeline entries by entryType', async () => {
    const result = await service.getTimeline(userId, {
      entryType: 'AchievementUnlocked',
    });

    assert.strictEqual(result.entries.length, 1);
    assert.strictEqual(result.entries[0].entryType, 'AchievementUnlocked');
    assert.strictEqual(result.entries[0].title, 'Achievement: Productivity Legend');
  });

  it('should filter timeline entries by date range (from / to)', async () => {
    const from = new Date('2026-08-15T00:00:00.000Z');
    const to = new Date('2026-09-15T00:00:00.000Z');

    const result = await service.getTimeline(userId, { from, to });
    // Should exclude the older 2026-08-01 entry
    assert.ok(result.entries.length >= 2);
    for (const entry of result.entries) {
      const entryTime = new Date(entry.occurredAt).getTime();
      assert.ok(entryTime >= from.getTime());
      assert.ok(entryTime <= to.getTime());
    }
  });

  it('should paginate timeline results properly', async () => {
    const result = await service.getTimeline(userId, {
      page: 1,
      limit: 2,
    });

    assert.strictEqual(result.entries.length, 2);
    assert.strictEqual(result.pagination.limit, 2);
    assert.strictEqual(result.pagination.page, 1);
    assert.ok(result.pagination.totalPages >= 2);
  });

  it('should retrieve a single timeline entry by ID for the owner', async () => {
    const list = await service.getTimeline(userId);
    const target = list.entries[0];

    const found = await service.getTimelineEntry(userId, target._id);
    assert.strictEqual(found._id, target._id);
    assert.strictEqual(found.title, target.title);
  });

  it('should reject retrieval of another user’s timeline entry with NotFoundError', async () => {
    const otherUserId = new Types.ObjectId().toString();
    const list = await service.getTimeline(userId);
    const target = list.entries[0];

    await assert.rejects(
      async () => {
        await service.getTimelineEntry(otherUserId, target._id);
      },
      { name: 'NotFoundError' },
    );
  });
});
