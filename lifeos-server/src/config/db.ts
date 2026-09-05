import mongoose from 'mongoose';
import { env } from './env';

export const connectDatabase = async (): Promise<typeof mongoose> => {
  const uri = env.MONGODB_URI;

  mongoose.connection.on('connected', () => {
    console.info('[LifeOS DB] Connected to MongoDB successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[LifeOS DB] MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[LifeOS DB] MongoDB connection disconnected.');
  });

  try {
    return await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    console.error('[LifeOS DB] Initial MongoDB connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.info('[LifeOS DB] MongoDB disconnected cleanly.');
  }
};
