import { Types } from 'mongoose';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Archived';

export interface ITask {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  goalId?: Types.ObjectId;
  milestoneId?: Types.ObjectId;
  title: string;
  description?: string;
  category?: string;
  priority: TaskPriority;
  dueDate?: Date;
  reminder?: Date;
  status: TaskStatus;
  completedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateTaskDto {
  userId: string;
  goalId?: string;
  milestoneId?: string;
  title: string;
  description?: string;
  category?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  reminder?: Date;
  status?: TaskStatus;
}

export interface IUpdateTaskDto {
  title?: string;
  description?: string;
  category?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  reminder?: Date;
  status?: TaskStatus;
}

export interface ITaskFilterOptions {
  userId: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
