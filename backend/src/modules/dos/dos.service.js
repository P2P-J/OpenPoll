import prisma from '../../config/database.js';
import redis, { CACHE_KEYS, CACHE_TTL } from '../../config/redis.js';
import config from '../../config/index.js';
import AppError from '../../utils/AppError.js';
import { POINT_TYPES, POINT_TYPE_DESCRIPTIONS } from '../../constants/pointTypes.js';

// DOS 축 정의 (순서: 변화 → 분배 → 권리 → 발전)
// 변화축: Change(변화) vs Stability(안정) - 높은 % = C
// 분배축: Merit(경쟁) vs Equality(평등) - 높은 % = M
// 권리축: Freedom(자유) vs Order(규율) - 높은 % = F
// 발전축: Development(개발) vs Nature(환경) - 높은 % = D

export const getQuestions = async () => {
  const questions = await prisma.dosQuestion.findMany({
    select: {
      id: true,
      question: true,
      axis: true,
    },
  });

  return questions;
};


export const calculateResult = async (answers, userId = null) => {
  const questionIds = answers.map((a) => a.questionId);
  
  const questions = await prisma.dosQuestion.findMany({
    where: {
      id: { in: questionIds },
    },
  });

  if (questions.length === 0) {
    throw AppError.badRequest('유효한 질문이 없습니다.');
  }

  // 축별 점수 계산
  // 점수 변환: 1-7 → -3 ~ +3 (4가 중립)
  // direction=1: 1-3이 첫번째 문자(M,F,C,D) 방향 → (4 - score)
  // direction=-1: 1-3이 두번째 문자(E,O,S,N) 방향 → (score - 4)
  const axisScores = {};
  const axisMaxScores = {};

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) return;

    const { axis, direction = 1, weight = 1 } = question;
    
    if (!axisScores[axis]) {
      axisScores[axis] = 0;
      axisMaxScores[axis] = 0;
    }

    // 1-7을 -3~+3으로 변환하고 direction 적용
    const normalizedScore = direction * (4 - answer.score);
    
    axisScores[axis] += normalizedScore * weight;
    axisMaxScores[axis] += 3 * weight;
  });

  // 축별 퍼센티지 계산 (0-100)
  // 높은 % = M, F, C, D 방향
  const axisPercentages = {};
  Object.keys(axisScores).forEach((axis) => {
    const score = axisScores[axis];
    const maxScore = axisMaxScores[axis];
    const percentage = Math.round(((score + maxScore) / (2 * maxScore)) * 100);
    axisPercentages[axis] = Math.max(0, Math.min(100, percentage));
  });

  const resultType = determineResultType(axisPercentages);

  let resultTypeInfo = await prisma.dosResultType.findUnique({
    where: { id: resultType },
  });

  if (!resultTypeInfo) {
    resultTypeInfo = {
      id: resultType,
      name: `유형 ${resultType}`,
      description: '아직 정의되지 않은 유형입니다. 추후 업데이트 예정입니다.',
      traits: '[]',
    };
  }

  await prisma.dosStatistics.upsert({
    where: { resultType },
    update: { count: { increment: 1 } },
    create: { resultType, count: 1 },
  });

  await redis.del(CACHE_KEYS.DOS_STATS);

  let pointsEarned = 0;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasTakenDos: true },
    });

    if (user && !user.hasTakenDos) {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            points: { increment: config.points.dos },
            hasTakenDos: true,
          },
        });

        await tx.pointHistory.create({
          data: {
            userId,
            type: POINT_TYPES.DOS,
            amount: config.points.dos,
            description: POINT_TYPE_DESCRIPTIONS[POINT_TYPES.DOS],
          },
        });
      });

      pointsEarned = config.points.dos;
    }
  }

  return {
    resultType,
    axisPercentages,
    resultTypeInfo,
    pointsEarned,
  };
};

export const getResultTypeInfo = async (resultType) => {
  const info = await prisma.dosResultType.findUnique({
    where: { id: resultType },
  });

  if (!info) {
    throw AppError.notFound('해당 유형을 찾을 수 없습니다.');
  }

  return info;
};

export const getStatistics = async () => {
  const cached = await redis.get(CACHE_KEYS.DOS_STATS);
  if (cached) {
    return JSON.parse(cached);
  }

  const stats = await prisma.dosStatistics.findMany({
    orderBy: { count: 'desc' },
  });

  const total = stats.reduce((sum, s) => sum + s.count, 0);

  const result = {
    total,
    stats: stats.map((s) => ({
      resultType: s.resultType,
      count: s.count,
      percentage: total > 0 ? ((s.count / total) * 100).toFixed(2) : '0.00',
    })),
  };

  await redis.setex(CACHE_KEYS.DOS_STATS, CACHE_TTL.DOS_STATS, JSON.stringify(result));

  return result;
};

/**
 * 결과 유형 결정
 * 각 축에서 50% 이상이면 첫번째 문자, 미만이면 두번째 문자
 * - 변화축: C(Change/변화) vs S(Stability/안정)
 * - 분배축: M(Merit/경쟁) vs E(Equality/평등)
 * - 권리축: F(Freedom/자유) vs O(Order/규율)
 * - 발전축: D(Development/개발) vs N(Nature/환경)
 */
const determineResultType = (axisPercentages) => {
  const axisOrder = ['change', 'distribution', 'rights', 'development'];
  const axisMap = {
    distribution: { high: 'M', low: 'E' },
    rights: { high: 'F', low: 'O' },
    change: { high: 'C', low: 'S' },
    development: { high: 'D', low: 'N' },
  };

  let result = '';
  
  axisOrder.forEach((axis) => {
    const pct = axisPercentages[axis] ?? 50;
    const letters = axisMap[axis];
    result += pct >= 50 ? letters.high : letters.low;
  });

  return result || 'UNKNOWN';
};
