import prisma from '../../config/database.js';
import redis, { CACHE_KEYS, CACHE_TTL } from '../../config/redis.js';
import config from '../../config/index.js';
import AppError from '../../utils/AppError.js';
import { POINT_TYPES, POINT_TYPE_DESCRIPTIONS } from '../../constants/pointTypes.js';
import { broadcastVoteUpdate } from '../dashboard/dashboard.service.js';


export const castVote = async (userId, partyId) => {
  const party = await prisma.party.findUnique({
    where: { id: partyId },
  });

  if (!party || !party.isActive) {
    throw AppError.notFound('해당 정당을 찾을 수 없습니다.');
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    const pointCost = Math.abs(config.points.partyVote);
    if (user.points < pointCost) {
      throw AppError.badRequest(`포인트가 부족합니다. (현재: ${user.points}P, 필요: ${pointCost}P)`);
    }

    await tx.user.update({
      where: { id: userId },
      data: { points: { decrement: pointCost } },
    });

    await tx.pointHistory.create({
      data: {
        userId,
        type: POINT_TYPES.PARTY_VOTE,
        amount: config.points.partyVote,
        description: `${POINT_TYPE_DESCRIPTIONS[POINT_TYPES.PARTY_VOTE]} - ${party.name}`,
      },
    });

    const vote = await tx.vote.create({
      data: { userId, partyId },
      include: {
        party: {
          select: { name: true, color: true },
        },
      },
    });

    await tx.party.update({
      where: { id: partyId },
      data: { voteCount: { increment: 1 } },
    });

    // 업데이트된 포인트 조회
    const updatedUser = await tx.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    return { vote, remainingPoints: updatedUser.points };
  });

  await invalidateStatsCache(); // redis 캐시 삭제
  await broadcastVoteUpdate(); // SSE로 모든 클라이언트에 알림

  return {
    ...result.vote,
    remainingPoints: result.remainingPoints,
  };
};

// 캐시 무효화(삭제)
const invalidateStatsCache = async () => {
  await Promise.all([
    redis.del(CACHE_KEYS.STATS_OVERALL),
    redis.del(CACHE_KEYS.STATS_BY_AGE),
    redis.del(CACHE_KEYS.STATS_BY_REGION),
  ]);
};
