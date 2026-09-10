import { Request, Response, NextFunction } from 'express';
import { ChallengeService } from '../services/challenge.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class ChallengeController {
  constructor(private service: ChallengeService = new ChallengeService()) {}

  createChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const challenge = await this.service.createChallenge(req.user.userId, req.body);
      sendSuccess(res, challenge, 'Challenge created successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  getChallenges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { category, difficulty, status } = req.query as {
        category?: string;
        difficulty?: string;
        status?: 'active' | 'upcoming' | 'ended' | 'all';
      };
      const challenges = await this.service.getChallenges(req.user.userId, {
        category,
        difficulty,
        status,
      });
      sendSuccess(res, challenges, 'Challenges retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  getChallengeDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const challengeId = Array.isArray(req.params.challengeId)
        ? req.params.challengeId[0]
        : req.params.challengeId;
      const details = await this.service.getChallengeDetails(challengeId, req.user.userId);
      sendSuccess(res, details, 'Challenge details retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  updateChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const challengeId = Array.isArray(req.params.challengeId)
        ? req.params.challengeId[0]
        : req.params.challengeId;
      const updated = await this.service.updateChallenge(challengeId, req.user.userId, req.body);
      sendSuccess(res, updated, 'Challenge updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  deleteChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const challengeId = Array.isArray(req.params.challengeId)
        ? req.params.challengeId[0]
        : req.params.challengeId;
      await this.service.deleteChallenge(challengeId, req.user.userId);
      sendSuccess(res, null, 'Challenge deleted successfully.');
    } catch (error) {
      next(error);
    }
  };

  joinChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const challengeId = Array.isArray(req.params.challengeId)
        ? req.params.challengeId[0]
        : req.params.challengeId;
      const participant = await this.service.joinChallenge(challengeId, req.user.userId);
      sendSuccess(res, participant, 'Joined challenge successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  leaveChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const challengeId = Array.isArray(req.params.challengeId)
        ? req.params.challengeId[0]
        : req.params.challengeId;
      await this.service.leaveChallenge(challengeId, req.user.userId);
      sendSuccess(res, null, 'Left challenge successfully.');
    } catch (error) {
      next(error);
    }
  };

  updateProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const challengeId = Array.isArray(req.params.challengeId)
        ? req.params.challengeId[0]
        : req.params.challengeId;
      const participant = await this.service.updateProgress(
        challengeId,
        req.user.userId,
        req.body.progress,
      );
      sendSuccess(res, participant, 'Progress updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const challengeId = Array.isArray(req.params.challengeId)
        ? req.params.challengeId[0]
        : req.params.challengeId;
      const leaderboard = await this.service.getChallengeLeaderboard(challengeId);
      sendSuccess(res, leaderboard, 'Challenge leaderboard retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };
}
