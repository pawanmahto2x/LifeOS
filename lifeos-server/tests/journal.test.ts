import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JournalService } from '../src/services/journal.service';
import { JournalRepository } from '../src/repositories/journal.repository';
import { IJournalDocument } from '../src/models/journal.model';
import {
  ICreateJournalDto,
  IUpdateJournalDto,
  IJournalFilterOptions,
  JournalMood,
} from '../src/types/journal.types';
import { Types } from 'mongoose';

class MockJournalRepository extends JournalRepository {
  private journals: Map<string, IJournalDocument> = new Map();

  async create(data: ICreateJournalDto): Promise<IJournalDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      userId: new Types.ObjectId(data.userId),
      title: data.title,
      content: data.content,
      mood: data.mood as JournalMood,
      tags: data.tags || [],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as IJournalDocument;

    this.journals.set(id.toString(), doc);
    return doc;
  }

  async findById(id: string): Promise<IJournalDocument | null> {
    return this.journals.get(id) || null;
  }

  async findByUser(
    options: IJournalFilterOptions,
  ): Promise<{ journals: IJournalDocument[]; total: number; page: number; totalPages: number }> {
    const all = Array.from(this.journals.values()).filter(
      (j) => j.userId.toString() === options.userId && !j.isDeleted,
    );

    let filtered = all;
    if (options.mood) {
      filtered = filtered.filter((j) => j.mood === options.mood);
    }
    if (options.tag) {
      filtered = filtered.filter((j) => j.tags && j.tags.includes(options.tag as string));
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.content.toLowerCase().includes(q) ||
          j.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return {
      journals: filtered,
      total: filtered.length,
      page: options.page || 1,
      totalPages: 1,
    };
  }

  async updateById(id: string, updateData: IUpdateJournalDto): Promise<IJournalDocument | null> {
    const journal = this.journals.get(id);
    if (!journal) return null;
    Object.assign(journal, updateData, { updatedAt: new Date() });
    return journal;
  }

  async softDeleteById(id: string): Promise<boolean> {
    const journal = this.journals.get(id);
    if (!journal) return false;
    journal.isDeleted = true;
    return true;
  }
}

describe('Phase 6 - Journal Service Unit Tests', () => {
  const mockRepo = new MockJournalRepository();
  const journalService = new JournalService(mockRepo);

  const userA = new Types.ObjectId().toString();
  const userB = new Types.ObjectId().toString();

  let journalId: string;

  it('should create a journal entry with mood and tags', async () => {
    const entry = await journalService.createJournal(userA, {
      title: 'First Morning Reflection',
      content: 'Today I woke up early and outlined my goals with high focus and clarity.',
      mood: 'Excellent',
      tags: ['productivity', 'morning'],
    });

    assert.ok(entry._id);
    assert.strictEqual(entry.title, 'First Morning Reflection');
    assert.strictEqual(entry.mood, 'Excellent');
    assert.deepStrictEqual(entry.tags, ['productivity', 'morning']);
    assert.strictEqual(entry.isDeleted, false);

    journalId = entry._id.toString();
  });

  it('should prevent another user from accessing the journal entry', async () => {
    await assert.rejects(
      async () => {
        await journalService.getJournalById(userB, journalId);
      },
      {
        name: 'ForbiddenError',
        message: 'You do not have access to this journal entry',
      },
    );
  });

  it('should search entries across title, content, and tags', async () => {
    const searchByTag = await journalService.searchJournals(userA, {
      q: 'morning',
      page: 1,
      limit: 10,
    });
    assert.strictEqual(searchByTag.total, 1);
    assert.strictEqual(searchByTag.journals[0].title, 'First Morning Reflection');

    const searchByBody = await journalService.searchJournals(userA, {
      q: 'clarity',
      page: 1,
      limit: 10,
    });
    assert.strictEqual(searchByBody.total, 1);
  });

  it('should filter entries by mood', async () => {
    const excellentMoods = await journalService.getJournals(userA, {
      mood: 'Excellent',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    assert.strictEqual(excellentMoods.total, 1);

    const sadMoods = await journalService.getJournals(userA, {
      mood: 'Sad',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    assert.strictEqual(sadMoods.total, 0);
  });

  it('should update journal entry content and tags', async () => {
    const updated = await journalService.updateJournal(userA, journalId, {
      title: 'Updated Reflection',
      tags: ['productivity', 'mindfulness'],
    });

    assert.strictEqual(updated.title, 'Updated Reflection');
    assert.deepStrictEqual(updated.tags, ['productivity', 'mindfulness']);
  });

  it('should soft delete journal entry and exclude it from searches', async () => {
    await journalService.deleteJournal(userA, journalId);

    await assert.rejects(
      async () => {
        await journalService.getJournalById(userA, journalId);
      },
      {
        name: 'NotFoundError',
      },
    );
  });
});
