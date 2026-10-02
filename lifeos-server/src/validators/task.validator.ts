import { z } from 'zod';

export const taskPriorityEnum = z.enum(['Low', 'Medium', 'High', 'Urgent']);
export const taskStatusEnum = z.enum(['Pending', 'In Progress', 'Completed', 'Archived']);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required'),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  goalId: z.string().optional(),
  milestoneId: z.string().optional(),
  priority: taskPriorityEnum.default('Medium'),
  dueDate: z.coerce.date().optional(),
  reminder: z.coerce.date().optional(),
  status: taskStatusEnum.default('Pending'),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: z.coerce.date().optional(),
  reminder: z.coerce.date().optional(),
  status: taskStatusEnum.optional(),
});

export const queryTasksSchema = z.object({
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ICreateTaskInput = z.infer<typeof createTaskSchema>;
export type IUpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type IQueryTasksInput = z.infer<typeof queryTasksSchema>;
