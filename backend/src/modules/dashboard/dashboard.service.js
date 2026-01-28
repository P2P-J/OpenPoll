import prisma from '../../config/database.js';
import redis, { CACHE_KEYS, CACHE_TTL } from '../../config/redis.js';
import { getAgeGroup } from '../../constants/ageGroups.js';

const clients = new Set();

export const addClient = (res) => {
  clients.add(res);
};

export const removeClient = (res) => {
  clients.delete(res);
};

// 투표 업데이트를 전체 클라이언트에게 push(vote.service.js에서 사용)
export const broadcastVoteUpdate = async () => {
  if (clients.size === 0) return;

  const stats = await getOverallStats(true);
  const data = `data: ${JSON.stringify({ type: 'vote_update', stats })}\n\n`;
  
  clients.forEach((client) => {
    try {
      client.write(data);
    } catch (err) {
      clients.delete(client);
    }
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
    where: { isActive: true },
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

  const votes = await prisma.vote.findMany({
    select: {
      partyId: true,
      user: {
        select: { age: true },
      },
    },
  });

  const ageGroupStats = {};
  
  votes.forEach((vote) => {
    const ageGroup = getAgeGroup(vote.user.age);
    if (!ageGroupStats[ageGroup]) {
      ageGroupStats[ageGroup] = {};
    }
    if (!ageGroupStats[ageGroup][vote.partyId]) {
      ageGroupStats[ageGroup][vote.partyId] = 0;
    }
    ageGroupStats[ageGroup][vote.partyId]++;
  });

  const parties = await prisma.party.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
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

  const votes = await prisma.vote.findMany({
    select: {
      partyId: true,
      user: {
        select: { region: true },
      },
    },
  });

  const regionStats = {};
  
  votes.forEach((vote) => {
    const { region } = vote.user;
    if (!regionStats[region]) {
      regionStats[region] = {};
    }
    if (!regionStats[region][vote.partyId]) {
      regionStats[region][vote.partyId] = 0;
    }
    regionStats[region][vote.partyId]++;
  });

  const parties = await prisma.party.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
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
