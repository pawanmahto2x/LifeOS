import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';

const startServer = async (): Promise<void> => {
  try {
    // Attempt DB connection
    await connectDatabase().catch((err) => {
      console.warn('[LifeOS DB] Database connection deferred/failed on boot:', err.message);
    });

    const server = app.listen(env.PORT, () => {
      console.info(`[LifeOS] Server running on port ${env.PORT}`);
      console.info(`[LifeOS] Environment: ${env.NODE_ENV}`);
      console.info(`[LifeOS] Health check: http://localhost:${env.PORT}/api/health`);
    });

    const handleGracefulShutdown = async (signal: string): Promise<void> => {
      console.info(`[LifeOS] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('[LifeOS] Failed to start server:', error);
    process.exit(1);
  }
};

void startServer();
