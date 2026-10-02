import { taskRepository, TaskRepository } from '../repositories/task.repository';
import { ITaskDocument } from '../models/task.model';
import { ICreateTaskInput, IUpdateTaskInput, IQueryTasksInput } from '../validators/task.validator';
import { NotFoundError, ForbiddenError } from '../utils/errors';

import { Goal } from '../models/goal.model';

export class TaskService {
  constructor(private repo: TaskRepository = taskRepository) {}

  async createTask(userId: string, input: ICreateTaskInput): Promise<ITaskDocument> {
    if (input.goalId) {
      const goal = await Goal.findOne({ _id: input.goalId, userId }).exec();
      if (!goal) {
        throw new ForbiddenError('You do not have access to this goal or it does not exist');
      }
    }

    return this.repo.create({
      userId,
      ...input,
    });
  }

  async getTasks(
    userId: string,
    query: IQueryTasksInput,
  ): Promise<{ tasks: ITaskDocument[]; total: number; page: number; totalPages: number }> {
    return this.repo.findByUser({
      userId,
      ...query,
    });
  }

  async getTaskById(userId: string, taskId: string): Promise<ITaskDocument> {
    const task = await this.repo.findById(taskId);
    if (!task || task.isDeleted) {
      throw new NotFoundError('Task not found');
    }

    if (task.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this task');
    }

    return task;
  }

  async updateTask(
    userId: string,
    taskId: string,
    updateData: IUpdateTaskInput,
  ): Promise<ITaskDocument> {
    const task = await this.getTaskById(userId, taskId);

    // If status is transitioning to Completed, automatically record completedAt
    if (updateData.status === 'Completed' && task.status !== 'Completed') {
      (updateData as { completedAt?: Date }).completedAt = new Date();
    } else if (updateData.status && updateData.status !== 'Completed') {
      (updateData as { completedAt?: Date | null }).completedAt = null as unknown as Date;
    }

    const updated = await this.repo.updateById(taskId, updateData);
    if (!updated) {
      throw new NotFoundError('Task not found');
    }

    return updated;
  }

  async completeTask(userId: string, taskId: string): Promise<ITaskDocument> {
    const task = await this.getTaskById(userId, taskId);

    const updated = await this.repo.updateById(task._id.toString(), {
      status: 'Completed',
      // Explicitly set completedAt timestamp per API.md Section 9
      ...({ completedAt: new Date() } as unknown as IUpdateTaskInput),
    });

    if (!updated) {
      throw new NotFoundError('Task not found');
    }

    return updated;
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    // Check ownership first
    await this.getTaskById(userId, taskId);

    // Perform soft deletion per Backend-Schema.md
    await this.repo.softDeleteById(taskId);
  }
}

export const taskService = new TaskService();
