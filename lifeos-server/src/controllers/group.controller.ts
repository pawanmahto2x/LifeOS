import { Request, Response, NextFunction } from 'express';
import { GroupService } from '../services/group.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class GroupController {
  constructor(private service: GroupService = new GroupService()) {}

  createGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const group = await this.service.createGroup(req.user.userId, req.body);
      sendSuccess(res, group, 'Group created successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  getUserGroups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const groups = await this.service.getUserGroups(req.user.userId);
      sendSuccess(res, groups, 'User groups retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  getGroupDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const groupId = Array.isArray(req.params.groupId)
        ? req.params.groupId[0]
        : req.params.groupId;
      const details = await this.service.getGroupDetails(groupId, req.user.userId);
      sendSuccess(res, details, 'Group details retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  updateGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const groupId = Array.isArray(req.params.groupId)
        ? req.params.groupId[0]
        : req.params.groupId;
      const group = await this.service.updateGroup(groupId, req.user.userId, req.body);
      sendSuccess(res, group, 'Group updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  deleteGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const groupId = Array.isArray(req.params.groupId)
        ? req.params.groupId[0]
        : req.params.groupId;
      await this.service.deleteGroup(groupId, req.user.userId);
      sendSuccess(res, null, 'Group deleted successfully.');
    } catch (error) {
      next(error);
    }
  };

  joinGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const membership = await this.service.joinGroup(req.user.userId, req.body.inviteCode);
      sendSuccess(res, membership, 'Successfully joined group.', 201);
    } catch (error) {
      next(error);
    }
  };

  leaveGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const groupId = Array.isArray(req.params.groupId)
        ? req.params.groupId[0]
        : req.params.groupId;
      await this.service.leaveGroup(groupId, req.user.userId);
      sendSuccess(res, null, 'Successfully left group.');
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const groupId = Array.isArray(req.params.groupId)
        ? req.params.groupId[0]
        : req.params.groupId;
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      await this.service.removeMember(groupId, userId, req.user.userId);
      sendSuccess(res, null, 'Member removed successfully.');
    } catch (error) {
      next(error);
    }
  };

  updateMemberRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const groupId = Array.isArray(req.params.groupId)
        ? req.params.groupId[0]
        : req.params.groupId;
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const updated = await this.service.updateMemberRole(
        groupId,
        userId,
        req.user.userId,
        req.body.role,
      );
      sendSuccess(res, updated, 'Member role updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  voteGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const groupId = Array.isArray(req.params.groupId)
        ? req.params.groupId[0]
        : req.params.groupId;
      const vote = await this.service.voteGoal(groupId, req.user.userId, req.body.optionId);
      sendSuccess(res, vote, 'Vote submitted successfully.');
    } catch (error) {
      next(error);
    }
  };
}
