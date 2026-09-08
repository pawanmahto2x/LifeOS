import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TaskService } from '../src/services/task.service';
import { TaskRepository } from '../src/repositories/task.repository';
import { ITaskDocument } from '../src/models/task.model';
import { ICreateTaskDto, IUpdateTaskDto, ITaskFilterOptions, TaskPriority, TaskStatus } from '../src/types/task.types';
import { Types } from 'mongoose';

class MockTaskRepository extends TaskRepository {
  private tasks: Map<string, ITaskDocument> = new Map();

  async create(data: ICreateTaskDto): Promise<ITaskDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      userId: new Types.ObjectId(data.userId),
      title: data.title,
      description: data.description,
      category: data.category || 'General',
      priority: (data.priority || 'Medium') as TaskPriority,
      status: (data.status || 'Pending') as TaskStatus,
      dueDate: data.dueDate,
      reminder: data.reminder,
      completedAt: undefined,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as ITaskDocument;

    this.tasks.set(id.toString(), doc);
    return doc;
  }

  async findById(id: string): Promise<ITaskDocument | null> {
    return this.tasks.get(id) || null;
  }

  async findByUser(
    options: ITaskFilterOptions,
  ): Promise<{ tasks: ITaskDocument[]; total: number; page: number; totalPages: number }> {
    const all = Array.from(this.tasks.values()).filter(
      (t) => t.userId.toString() === options.userId && !t.isDeleted,
    );

    let filtered = all;
    if (options.status) {
      filtered = filtered.filter((t) => t.status === options.status);
    }
    if (options.priority) {
      filtered = filtered.filter((t) => t.priority === options.priority);
    }

    return {
      tasks: filtered,
      total: filtered.length,
      page: options.page || 1,
      totalPages: 1,
    };
  }

  async updateById(id: string, updateData: IUpdateTaskDto): Promise<ITaskDocument | null> {
    const task = this.tasks.get(id);
    if (!task) return null;
    Object.assign(task, updateData, { updatedAt: new Date() });
    return task;
  }

  async softDeleteById(id: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task) return false;
    task.isDeleted = true;
    return true;
  }
}

describe('Phase 4 - Task Management Service Unit Tests', () => {
  const mockRepo = new MockTaskRepository();
  const taskService = new TaskService(mockRepo);
  const userA = new Types.ObjectId().toString();
  const userB = new Types.ObjectId().toString();

  let createdTaskId: string;

  it('should create a new task successfully', async () => {
    const task = await taskService.createTask(userA, {
      title: 'Complete Phase 4 Implementation',
      description: 'Implement backend, models, and frontend views',
      priority: 'High',
      category: 'Work',
      status: 'Pending',
    });

    assert.ok(task._id);
    assert.strictEqual(task.title, 'Complete Phase 4 Implementation');
    assert.strictEqual(task.priority, 'High');
    assert.strictEqual(task.status, 'Pending');
    assert.strictEqual(task.isDeleted, false);

    createdTaskId = task._id.toString();
  });

  it('should retrieve task by ID for the owner', async () => {
    const task = await taskService.getTaskById(userA, createdTaskId);
    assert.strictEqual(task._id.toString(), createdTaskId);
    assert.strictEqual(task.title, 'Complete Phase 4 Implementation');
  });

  it('should reject access to another user’s task with ForbiddenError', async () => {
    await assert.rejects(
      async () => {
        await taskService.getTaskById(userB, createdTaskId);
      },
      {
        name: 'ForbiddenError',
        message: 'You do not have access to this task',
      },
    );
  });

  it('should mark task as completed and set completedAt timestamp', async () => {
    const completedTask = await taskService.completeTask(userA, createdTaskId);
    assert.strictEqual(completedTask.status, 'Completed');
    assert.ok(completedTask.completedAt);
    assert.ok(completedTask.completedAt instanceof Date);
  });

  it('should list tasks with status filter', async () => {
    const list = await taskService.getTasks(userA, {
      status: 'Completed',
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    assert.strictEqual(list.total, 1);
    assert.strictEqual(list.tasks[0].status, 'Completed');
  });

  it('should soft delete task and exclude it from retrieval', async () => {
    await taskService.deleteTask(userA, createdTaskId);

    await assert.rejects(
      async () => {
        await taskService.getTaskById(userA, createdTaskId);
      },
      {
        name: 'NotFoundError',
        message: 'Task not found',
      },
    );
  });
});
