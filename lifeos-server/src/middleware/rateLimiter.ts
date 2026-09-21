import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { sendError } from '../utils/response';

export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 300, // Generous in development, strict in production
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (_req: Request, res: Response) => {
    sendError(res, 'Too many requests from this IP, please try again after 15 minutes', 429);
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 30, // Generous in development, strict in production
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (_req: Request, res: Response) => {
    sendError(res, 'Too many authentication attempts, please try again after 15 minutes', 429);
  },
});
