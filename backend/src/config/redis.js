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

// Pub/Sub 전용 subscriber 인스턴스 (subscribe 모드에서는 일반 명령 불가)
export const subRedis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  tls: config.redisUrl?.startsWith('rediss://') ? {} : undefined,
});

subRedis.on('connect', () => {
  console.log('Sub Redis connected');
});

subRedis.on('error', (err) => {
  console.error('Sub Redis connection error:', err.message);
});

export const CACHE_KEYS = {
  STATS_OVERALL: 'stats:overall',
  STATS_BY_AGE: 'stats:by-age',
  STATS_BY_REGION: 'stats:by-region',
  DOS_STATS: 'dos:stats',
  USER_REFRESH_TOKEN: 'user:refresh:',
  EMAIL_VERIFY: 'email:verify:',
};

export const CACHE_TTL = {
  STATS_OVERALL: 30,
  STATS_BY_AGE: 60,
  STATS_BY_REGION: 60,
  DOS_STATS: 300,
  REFRESH_TOKEN: 60 * 60 * 24 * 7,
  EMAIL_VERIFY: 60 * 5,
};

export const NEWS_REFRESH = {
  LOCK_KEY: 'lock:{news:refresh}',
  COOLDOWN_KEY: 'cooldown:{news:refresh}',
  COOLDOWN_SEC: config.cooldownSec,
  LOCK_TTL_MS: 300_000,
};

export const SSE_CHANNELS = {
  VOTE_UPDATE: 'sse:vote_update',
};

export default redis;
