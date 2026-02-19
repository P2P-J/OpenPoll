import redis, { NEWS_REFRESH } from '../../../config/redis.js';

export async function tryNewsRefreshGuard() {
    const lua = `
    local cooldownKey = KEYS[1]
    local lockKey = KEYS[2]
    local lockVal = ARGV[1]
    local cooldownSec = tonumber(ARGV[2])
    local lockTtlMs = tonumber(ARGV[3])

    if redis.call("EXISTS", cooldownKey) == 1 then
      return 0
    end

    local ok = redis.call("SET", lockKey, lockVal, "NX", "PX", lockTtlMs)
    if not ok then
      return -1
    end

    redis.call("SET", cooldownKey, "1", "EX", cooldownSec)
    return 1
  `;

    const lockVal = `${process.pid}:${Date.now()}`;

    const result = await redis.eval(
        lua,
        2,
        NEWS_REFRESH.COOLDOWN_KEY,
        NEWS_REFRESH.LOCK_KEY,
        lockVal,
        String(NEWS_REFRESH.COOLDOWN_SEC),
        String(NEWS_REFRESH.LOCK_TTL_MS)
    );

    return { ok: Number(result) === 1, reason: Number(result), lockVal };
}

export async function releaseNewsRefreshLock(lockVal) {
    const lua = `
    local lockKey = KEYS[1]
    local lockVal = ARGV[1]
    if redis.call("GET", lockKey) == lockVal then
      return redis.call("DEL", lockKey)
    end
    return 0
  `;
    await redis.eval(lua, 1, NEWS_REFRESH.LOCK_KEY, lockVal);
}