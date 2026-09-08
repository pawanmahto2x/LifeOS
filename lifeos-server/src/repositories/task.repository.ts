import { Task, ITaskDocument } from '../models/task.model';
import { ICreateTaskDto, IUpdateTaskDto, ITaskFilterOptions } from '../types/task.types';

export class TaskRepository {
  async create(data: ICreateTaskDto): Promise<ITaskDocument> {
    const task = new Task(data);
    return task.save();
  }

  async findById(id: string): Promise<ITaskDocument | null> {
    return Task.findById(id).exec();
  }

  async findOne(filter: Record<string, unknown>): Promise<ITaskDocument | null> {
    return Task.findOne(filter).exec();
  }

  async findByUser(
    options: ITaskFilterOptions,
  ): Promise<{ tasks: ITaskDocument[]; total: number; page: number; totalPages: number }> {
    const {
      userId,
      status,
      priority,
      category,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const filter: Record<string, unknown> = {
      userId,
      isDeleted: false,
    };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      Task.countDocuments(filter).exec(),
    ]);

    return {
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateById(id: string, updateData: IUpdateTaskDto): Promise<ITaskDocument | null> {
    return Task.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).exec();
  }

  async softDeleteById(id: string): Promise<boolean> {
    const result = await Task.findByIdAndUpdate(id, { $set: { isDeleted: true } }).exec();
    return result !== null;
  }
}

export const taskRepository = new TaskRepository();
