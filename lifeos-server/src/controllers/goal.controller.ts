import { Request, Response, NextFunction } from 'express';
import { GoalService } from '../services/goal.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class GoalController {
  constructor(private service: GoalService = new GoalService()) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.create(req.user.userId, req.body);
      sendSuccess(res, result, 'Goal created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.findAllByUser(req.user.userId);
      sendSuccess(res, result, 'Goals retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.service.findById(id, req.user.userId);
      sendSuccess(res, result, 'Goal retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.service.update(id, req.user.userId, req.body);
      sendSuccess(res, result, 'Goal updated successfully');
    } catch (error) {
      next(error);
    }
  };

  generateAIPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.service.generateAIPlan(id, req.user.userId);
      sendSuccess(res, result, 'AI Plan generated successfully');
    } catch (error) {
      next(error);
    }
  };

  applyAIPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.service.applyAIPlan(id, req.user.userId, req.body);
      sendSuccess(res, result, 'AI Plan applied successfully');
    } catch (error) {
      next(error);
    }
  };

  generateGoalReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.service.generateGoalReport(id, req.user.userId);
      sendSuccess(res, result, 'Goal report generated successfully');
    } catch (error) {
      next(error);
    }
  };
}
