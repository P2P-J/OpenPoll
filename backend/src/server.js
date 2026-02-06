import app from './app.js';
import config, { validateConfig } from './config/index.js';
import prisma from './config/database.js';
import redis from './config/redis.js';

validateConfig(); // 환경변수 검증

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected');

    await redis.connect();
    console.log('Redis connected');

    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        await prisma.$disconnect();
        console.log('PostgreSQL disconnected');
        redis.disconnect();
        console.log('Redis disconnected');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
