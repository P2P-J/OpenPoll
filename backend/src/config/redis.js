import Redis from 'ioredis';
import config from './index.js';

const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,
  tls: config.redisUrl?.startsWith('rediss://') ? {} : undefined,
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

export const bullRedis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  tls: config.redisUrl?.startsWith('rediss://') ? {} : undefined,
});

bullRedis.on('connect', () => {
  console.log('Bull Redis connected');
});

bullRedis.on('error', (err) => {
  console.error('Bull Redis connection error:', err.message);
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

export const NEWS_REFRESH = {
  LOCK_KEY: 'lock:news:refresh',
  COOLDOWN_KEY: 'cooldown:news:refresh',
  COOLDOWN_SEC: 590, // 개발 : 45초, 운영: 600초(10분)로 변경
  LOCK_TTL_MS: 300_000, // 락(영구락 방지) : 300_000(5분)
};

export default redis;
