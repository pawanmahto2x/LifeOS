import { Request, Response, NextFunction } from 'express';
import { habitService, HabitService } from '../services/habit.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class HabitController {
  constructor(private service: HabitService = habitService) {}

  getHabits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.getHabits(
        req.user.userId,
        req.query as unknown as Parameters<HabitService['getHabits']>[1],
      );
      sendSuccess(res, result, 'Habits retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  getHabitById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const habitId = Array.isArray(req.params.habitId)
        ? req.params.habitId[0]
        : req.params.habitId;
      const habit = await this.service.getHabitById(req.user.userId, habitId);
      sendSuccess(res, habit, 'Habit retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  createHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const habit = await this.service.createHabit(req.user.userId, req.body);
      sendSuccess(res, habit, 'Habit created successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  updateHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const habitId = Array.isArray(req.params.habitId)
        ? req.params.habitId[0]
        : req.params.habitId;
      const habit = await this.service.updateHabit(req.user.userId, habitId, req.body);
      sendSuccess(res, habit, 'Habit updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  completeHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const habitId = Array.isArray(req.params.habitId)
        ? req.params.habitId[0]
        : req.params.habitId;
      const habit = await this.service.completeHabit(req.user.userId, habitId);
      sendSuccess(res, habit, 'Habit marked as completed.');
    } catch (error) {
      next(error);
    }
  };

  skipHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const habitId = Array.isArray(req.params.habitId)
        ? req.params.habitId[0]
        : req.params.habitId;
      const habit = await this.service.skipHabit(req.user.userId, habitId);
      sendSuccess(res, habit, 'Habit marked as skipped.');
    } catch (error) {
      next(error);
    }
  };

  pauseHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const habitId = Array.isArray(req.params.habitId)
        ? req.params.habitId[0]
        : req.params.habitId;
      const habit = await this.service.pauseHabit(req.user.userId, habitId);
      sendSuccess(res, habit, 'Habit paused successfully.');
    } catch (error) {
      next(error);
    }
  };

  resumeHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const habitId = Array.isArray(req.params.habitId)
        ? req.params.habitId[0]
        : req.params.habitId;
      const habit = await this.service.resumeHabit(req.user.userId, habitId);
      sendSuccess(res, habit, 'Habit resumed successfully.');
    } catch (error) {
      next(error);
    }
  };

  deleteHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const habitId = Array.isArray(req.params.habitId)
        ? req.params.habitId[0]
        : req.params.habitId;
      await this.service.deleteHabit(req.user.userId, habitId);
      sendSuccess(res, null, 'Habit deleted successfully.');
    } catch (error) {
      next(error);
    }
  };
}

export const habitController = new HabitController();
