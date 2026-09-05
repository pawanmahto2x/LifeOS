import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.info(`[LifeOS] Server running on port ${PORT}`);
  console.info(`[LifeOS] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.info(`[LifeOS] Health check: http://localhost:${PORT}/api/health`);
});
