import prisma from '../../config/database.js';
import AppError from '../../utils/AppError.js';
import bcrypt from 'bcrypt';

export const getMe = async (userId) => {
  const [user, totalEarnedStats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        age: true,
        region: true,
        gender: true,
        points: true,
        hasTakenDos: true,
        createdAt: true,
      },
    }),
    prisma.pointHistory.aggregate({
      where: {
        userId,
        amount: { gt: 0 }, // 양수 포인트만 (획득)
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  if (!user) {
    throw AppError.notFound('사용자를 찾을 수 없습니다.');
  }

  return {
    ...user,
    totalEarnedPoints: totalEarnedStats._sum.amount || 0,
  };
};

export const updateMe = async (userId, updateData) => {
  const { nickname, age, region, gender } = updateData;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(nickname && { nickname }),
      ...(age && { age }),
      ...(region && { region }),
      ...(gender && { gender }),
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      age: true,
      region: true,
      gender: true,
      points: true,
      hasTakenDos: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const getPointHistory = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  // Promise.all로 병렬 처리해서 최적화(비동기 쿼리 동시 실행)
  const [history, total] = await Promise.all([
    prisma.pointHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // 최신순
      skip,
      take: limit,
    }),
    prisma.pointHistory.count({ where: { userId } }),
  ]);

  return {
    history,
    pagination: { page, limit, total },
  };
};

export const getMyVoteStats = async (userId) => {
  const [voteCounts, parties] = await Promise.all([
    prisma.vote.groupBy({
      by: ['partyId'],
      where: { userId },
      _count: { id: true },
    }),
    prisma.party.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  const totalVotes = voteCounts.reduce((sum, v) => sum + v._count.id, 0);

  const stats = parties.map((party) => {
    const voteData = voteCounts.find((v) => v.partyId === party.id);
    const count = voteData ? voteData._count.id : 0;

    return {
      partyId: party.id,
      partyName: party.name,
      color: party.color,
      count,
    };
  });

  return { totalVotes, stats };
};
