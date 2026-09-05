import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // 1. Handled custom AppErrors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  // 2. Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    sendError(res, 'Validation failed', 422, formattedErrors);
    return;
  }

  // 3. Mongoose CastError (e.g. invalid ObjectId)
  if (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name: string }).name === 'CastError'
  ) {
    sendError(res, 'Invalid resource identifier format', 400);
    return;
  }

  // 4. Mongoose Duplicate Key Error (11000)
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: number }).code === 11000
  ) {
    sendError(res, 'Duplicate entry found', 409);
    return;
  }

  // 5. Catch-all unexpected server errors
  const message = err instanceof Error ? err.message : 'Internal server error';

  if (env.NODE_ENV !== 'test') {
    console.error('[LifeOS Internal Error]', err);
  }

  // Never expose raw internal stack traces to clients in production/development
  sendError(res, env.NODE_ENV === 'production' ? 'Internal server error' : message, 500);
};
