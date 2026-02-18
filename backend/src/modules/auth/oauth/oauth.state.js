import redis from '../../../config/redis.js';

const KEY = 'oauth:state:';

export const saveOAuthState = async (state, payload, ttlSec = 600) => {
    await redis.setex(`${KEY}${state}`, ttlSec, JSON.stringify(payload));
};

export const consumeOAuthState = async (state) => {
    const key = `${KEY}${state}`;
    const v = await redis.get(key);
    if (!v) return null;
    await redis.del(key);
    return JSON.parse(v);
};
