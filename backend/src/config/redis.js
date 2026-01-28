import Redis from 'ioredis';
import config from './index.js';

const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

export const CACHE_KEYS = {
  STATS_OVERALL: 'stats:overall',
  STATS_BY_AGE: 'stats:by-age',
  STATS_BY_REGION: 'stats:by-region',
  DOS_STATS: 'dos:stats',
  USER_REFRESH_TOKEN: 'user:refresh:', // + userId
};

export const CACHE_TTL = {
  STATS_OVERALL: 30,
  STATS_BY_AGE: 60,
  STATS_BY_REGION: 60,
  DOS_STATS: 300,
  REFRESH_TOKEN: 60 * 60 * 24 * 7, // 7일
};

export default redis;
