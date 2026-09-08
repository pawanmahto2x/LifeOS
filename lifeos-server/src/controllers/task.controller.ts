import { Request, Response, NextFunction } from 'express';
import { taskService, TaskService } from '../services/task.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class TaskController {
  constructor(private service: TaskService = taskService) {}

  getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.getTasks(
        req.user.userId,
        req.query as unknown as Parameters<TaskService['getTasks']>[1],
      );
      sendSuccess(res, result, 'Tasks retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      const task = await this.service.getTaskById(req.user.userId, taskId);
      sendSuccess(res, task, 'Task retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const task = await this.service.createTask(req.user.userId, req.body);
      sendSuccess(res, task, 'Task created successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      const task = await this.service.updateTask(req.user.userId, taskId, req.body);
      sendSuccess(res, task, 'Task updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  completeTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      const task = await this.service.completeTask(req.user.userId, taskId);
      sendSuccess(res, task, 'Task marked as completed.');
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      await this.service.deleteTask(req.user.userId, taskId);
      sendSuccess(res, null, 'Task deleted successfully.');
    } catch (error) {
      next(error);
    }
  };
}

export const taskController = new TaskController();
