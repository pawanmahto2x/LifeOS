import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import hpp from 'hpp';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { standardLimiter } from './middleware/rateLimiter';
import { sendSuccess } from './utils/response';
import { NotFoundError } from './utils/errors';

import apiRouter from './routes';

const app: Application = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Global standard rate limiter
app.use(standardLimiter);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Compression
app.use(compression());

// Request logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      status: 'healthy',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
    'LifeOS API is running',
  );
});

// Mount API v1 Routes
app.use('/api/v1', apiRouter);

// Catch-all 404 handler for unknown routes
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('The requested resource does not exist on this server'));
});

// Centralized error handler (must be last middleware)
app.use(errorHandler);

export default app;
