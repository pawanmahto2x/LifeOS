import { describe, it } from 'node:test';
import assert from 'node:assert';
import { FocusService } from '../src/services/focus.service';
import {
  FocusSessionRepository,
  IUpdateFocusSessionDto,
} from '../src/repositories/focus-session.repository';
import { TaskRepository } from '../src/repositories/task.repository';
import { FocusSessionDocument } from '../src/models/focus-session.model';
import { ITaskDocument } from '../src/models/task.model';
import { ICreateFocusSessionDto, IFocusSessionFilterOptions } from '../src/types/focus.types';
import { Types } from 'mongoose';

class MockFocusSessionRepository extends FocusSessionRepository {
  private sessions: Map<string, FocusSessionDocument> = new Map();

  async create(data: ICreateFocusSessionDto): Promise<FocusSessionDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      userId: new Types.ObjectId(data.userId),
      taskId: data.taskId ? new Types.ObjectId(data.taskId) : undefined,
      duration: data.duration,
      completed: false,
      distractions: 0,
      startedAt: data.startedAt || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as FocusSessionDocument;
    this.sessions.set(id.toString(), doc);
    return doc;
  }

  async findById(id: string): Promise<FocusSessionDocument | null> {
    return this.sessions.get(id) || null;
  }

  async findActiveSession(userId: string): Promise<FocusSessionDocument | null> {
    const list = Array.from(this.sessions.values()).filter(
      (s) => s.userId.toString() === userId && !s.completed && !s.endedAt,
    );
    return list.length > 0 ? list[list.length - 1] : null;
  }

  async findByUser(
    options: IFocusSessionFilterOptions,
  ): Promise<{ sessions: FocusSessionDocument[]; total: number; page: number; totalPages: number }> {
    const list = Array.from(this.sessions.values()).filter(
      (s) => s.userId.toString() === options.userId,
    );
    return { sessions: list, total: list.length, page: 1, totalPages: 1 };
  }

  async findByDateRange(
    userId: string,
    _startDate: Date,
    _endDate: Date,
  ): Promise<FocusSessionDocument[]> {
    return Array.from(this.sessions.values()).filter((s) => s.userId.toString() === userId);
  }

  async update(id: string, data: IUpdateFocusSessionDto): Promise<FocusSessionDocument | null> {
    const doc = this.sessions.get(id);
    if (!doc) return null;
    const updated = { ...doc, ...data, updatedAt: new Date() } as unknown as FocusSessionDocument;
    this.sessions.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<FocusSessionDocument | null> {
    const doc = this.sessions.get(id);
    if (!doc) return null;
    this.sessions.delete(id);
    return doc;
  }
}

class MockTaskRepository extends TaskRepository {
  private tasks: Map<string, ITaskDocument> = new Map();

  addTask(id: string, userId: string, title: string) {
    const doc = {
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
      title,
      status: 'Pending',
      priority: 'High',
      isDeleted: false,
    } as unknown as ITaskDocument;
    this.tasks.set(id, doc);
  }

  async findById(id: string): Promise<ITaskDocument | null> {
    return this.tasks.get(id) || null;
  }
}

describe('Phase 8 - Focus Mode Service Unit Tests', () => {
  const userId = new Types.ObjectId().toString();
  const otherUserId = new Types.ObjectId().toString();
  const taskId = new Types.ObjectId().toString();

  const focusRepo = new MockFocusSessionRepository();
  const taskRepo = new MockTaskRepository();
  taskRepo.addTask(taskId, userId, 'Deep Work Task');

  const focusService = new FocusService(focusRepo, taskRepo);

  let activeSessionId: string;

  it('should start a new focus session linked to a valid task', async () => {
    const session = await focusService.startSession(userId, {
      taskId,
      duration: 25,
    });

    assert.ok(session._id);
    assert.strictEqual(session.userId.toString(), userId);
    assert.strictEqual(session.duration, 25);
    assert.strictEqual(session.completed, false);
    assert.strictEqual(session.distractions, 0);

    activeSessionId = session._id.toString();
  });

  it('should reject starting focus session with an unauthorized task', async () => {
    await assert.rejects(
      async () => {
        await focusService.startSession(otherUserId, {
          taskId,
          duration: 25,
        });
      },
      { name: 'ForbiddenError' },
    );
  });

  it('should find the current active running session', async () => {
    const current = await focusService.getCurrentSession(userId);
    assert.ok(current);
    assert.strictEqual(current?._id.toString(), activeSessionId);
  });

  it('should end the focus session, recording distractions and notes', async () => {
    const ended = await focusService.endSession(userId, {
      sessionId: activeSessionId,
      distractions: 2,
      notes: 'High focus flow, finished module.',
      completed: true,
    });

    assert.strictEqual(ended.completed, true);
    assert.strictEqual(ended.distractions, 2);
    assert.strictEqual(ended.notes, 'High focus flow, finished module.');
    assert.ok(ended.endedAt);
  });

  it('should retrieve focus sessions list and calculate real daily analytics', async () => {
    const result = await focusService.getSessions(userId, {});

    assert.ok(result.sessions.length > 0);
    assert.ok(result.analytics);
    assert.strictEqual(typeof result.analytics.todayFocusMinutes, 'number');
    assert.strictEqual(result.analytics.todayCompletedSessions, 1);
    assert.strictEqual(result.analytics.todayDistractions, 2);
  });

  it('should delete a focus session by owner and reject non-owner deletion', async () => {
    await assert.rejects(
      async () => {
        await focusService.deleteSession(otherUserId, activeSessionId);
      },
      { name: 'ForbiddenError' },
    );

    await focusService.deleteSession(userId, activeSessionId);
    const deleted = await focusRepo.findById(activeSessionId);
    assert.strictEqual(deleted, null);
  });
});
