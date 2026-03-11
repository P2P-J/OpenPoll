import prisma from '../../config/database.js';
import redis, { subRedis, CACHE_KEYS, CACHE_TTL, SSE_CHANNELS } from '../../config/redis.js';

const clients = new Set();

export const addClient = (res) => {
  clients.add(res);
};

export const removeClient = (res) => {
  clients.delete(res);
};

// 투표 업데이트를 Redis Pub/Sub으로 발행 (모든 서버 인스턴스에 전달)
export const broadcastVoteUpdate = async () => {
  const stats = await getOverallStats(true);
  const data = JSON.stringify({ type: 'vote_update', stats });
  await redis.publish(SSE_CHANNELS.VOTE_UPDATE, data);
};

// 서버 시작 시 호출 — Redis 채널 구독 후 로컬 클라이언트에 SSE 전송
export const initSSESubscriber = async () => {
  await subRedis.subscribe(SSE_CHANNELS.VOTE_UPDATE);

  subRedis.on('message', (channel, message) => {
    if (channel !== SSE_CHANNELS.VOTE_UPDATE || clients.size === 0) return;

    const sseData = `data: ${message}\n\n`;
    clients.forEach((client) => {
      try {
        client.write(sseData);
      } catch (err) {
        clients.delete(client);
      }
    });
  });
};


export const getOverallStats = async (skipCache = false) => {
  if (!skipCache) {
    const cached = await redis.get(CACHE_KEYS.STATS_OVERALL);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const voteCounts = await prisma.vote.groupBy({
    by: ['partyId'],
    _count: { id: true },
  });

  const totalVotes = voteCounts.reduce((sum, v) => sum + v._count.id, 0);

  const parties = await prisma.party.findMany({
    orderBy: { order: 'asc' },
  });

  const stats = parties.map((party) => {
    const voteData = voteCounts.find((v) => v.partyId === party.id);
    const count = voteData ? voteData._count.id : 0;
    const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(2) : '0.00';

    return {
      partyId: party.id,
      partyName: party.name,
      color: party.color,
      count,
      percentage: parseFloat(percentage),
    };
  });

  const result = {
    totalVotes,
    stats,
    updatedAt: new Date().toISOString(),
  };

  await redis.setex(CACHE_KEYS.STATS_OVERALL, CACHE_TTL.STATS_OVERALL, JSON.stringify(result));

  return result;
};


export const getStatsByAge = async () => {
  const cached = await redis.get(CACHE_KEYS.STATS_BY_AGE);
  if (cached) {
    return JSON.parse(cached);
  }

  const rows = await prisma.$queryRaw`
    SELECT
      CASE
        WHEN u.age BETWEEN 18 AND 29 THEN '20대'
        WHEN u.age BETWEEN 30 AND 39 THEN '30대'
        WHEN u.age BETWEEN 40 AND 49 THEN '40대'
        WHEN u.age BETWEEN 50 AND 59 THEN '50대'
        WHEN u.age >= 60 THEN '60대 이상'
        ELSE '기타'
      END AS age_group,
      v."partyId",
      COUNT(*)::int AS count
    FROM votes v
    JOIN users u ON u.id = v."userId"
    GROUP BY age_group, v."partyId"
  `;

  const parties = await prisma.party.findMany({
    orderBy: { order: 'asc' },
  });

  const ageGroupStats = {};
  rows.forEach((row) => {
    const group = row.age_group;
    if (!ageGroupStats[group]) ageGroupStats[group] = {};
    ageGroupStats[group][row.partyId] = row.count;
  });

  const result = Object.entries(ageGroupStats).map(([ageGroup, partyVotes]) => {
    const total = Object.values(partyVotes).reduce((sum, count) => sum + count, 0);
    const stats = parties.map((party) => {
      const count = partyVotes[party.id] || 0;
      const percentage = total > 0 ? ((count / total) * 100).toFixed(2) : '0.00';
      return {
        partyId: party.id,
        partyName: party.name,
        color: party.color,
        count,
        percentage: parseFloat(percentage),
      };
    });

    return { ageGroup, total, stats };
  });

  await redis.setex(CACHE_KEYS.STATS_BY_AGE, CACHE_TTL.STATS_BY_AGE, JSON.stringify(result));

  return result;
};


export const getStatsByRegion = async () => {
  const cached = await redis.get(CACHE_KEYS.STATS_BY_REGION);
  if (cached) {
    return JSON.parse(cached);
  }

  const rows = await prisma.$queryRaw`
    SELECT u.region, v."partyId", COUNT(*)::int AS count
    FROM votes v
    JOIN users u ON u.id = v."userId"
    GROUP BY u.region, v."partyId"
  `;

  const parties = await prisma.party.findMany({
    orderBy: { order: 'asc' },
  });

  const regionStats = {};
  rows.forEach((row) => {
    const { region } = row;
    if (!regionStats[region]) regionStats[region] = {};
    regionStats[region][row.partyId] = row.count;
  });

  const result = Object.entries(regionStats).map(([region, partyVotes]) => {
    const total = Object.values(partyVotes).reduce((sum, count) => sum + count, 0);
    const stats = parties.map((party) => {
      const count = partyVotes[party.id] || 0;
      const percentage = total > 0 ? ((count / total) * 100).toFixed(2) : '0.00';
      return {
        partyId: party.id,
        partyName: party.name,
        color: party.color,
        count,
        percentage: parseFloat(percentage),
      };
    });

    return { region, total, stats };
  });

  await redis.setex(CACHE_KEYS.STATS_BY_REGION, CACHE_TTL.STATS_BY_REGION, JSON.stringify(result));

  return result;
};
