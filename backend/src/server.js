import app from './app.js';
import config, { validateConfig } from './config/index.js';
import prisma from './config/database.js';
import redis, { subRedis } from './config/redis.js';
import { startNewsRefreshJob, stopNewsRefreshJob } from './modules/news/jobs/refreshJob.js';
import { initSSESubscriber } from './modules/dashboard/dashboard.service.js';

validateConfig(); // 환경변수 검증

// 전역 에러 핸들러 — Express 외부에서 발생하는 에러 처리
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

const SHUTDOWN_TIMEOUT_MS = 10_000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected');

    await redis.connect();
    await subRedis.connect();
    console.log('Redis connected');

    await initSSESubscriber();

    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });

    startNewsRefreshJob({ intervalMs: config.newsIntervalMs });

    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      stopNewsRefreshJob();

      const forceExit = setTimeout(() => {
        console.error('Graceful shutdown timed out, forcing exit');
        process.exit(1);
      }, SHUTDOWN_TIMEOUT_MS);
      forceExit.unref();

      server.close(async () => {
        try {
          console.log('HTTP server closed');
          await prisma.$disconnect();
          console.log('PostgreSQL disconnected');
          redis.disconnect();
          subRedis.disconnect();
          console.log('Redis disconnected');
        } catch (err) {
          console.error('Error during shutdown cleanup:', err);
        }
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
