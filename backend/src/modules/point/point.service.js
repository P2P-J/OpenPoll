import prisma from '../../config/database.js';
import config from '../../config/index.js';
import AppError from '../../utils/AppError.js';
import { POINT_TYPES, POINT_TYPE_DESCRIPTIONS } from '../../constants/pointTypes.js';


export const checkAttendance = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간 0으로 해서 날짜만 비교

  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      userId_date: { userId, date: today },
    },
  });
  if (existingAttendance) {
    throw AppError.badRequest('오늘 이미 출석 체크를 했습니다.');
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayAttendance = await prisma.attendance.findUnique({
    where: {
      userId_date: { userId, date: yesterday },
    },
  });
  const consecutiveDays = yesterdayAttendance ? yesterdayAttendance.consecutiveDays + 1 : 1;

  const result = await prisma.$transaction(async (tx) => {
    const attendance = await tx.attendance.create({
      data: {
        userId,
        date: today,
        consecutiveDays,
      },
    });

    let totalPoints = config.points.dailyAttendance;
    const pointRecords = [];

    pointRecords.push({
      userId,
      type: POINT_TYPES.DAILY_ATTENDANCE,
      amount: config.points.dailyAttendance,
      description: POINT_TYPE_DESCRIPTIONS[POINT_TYPES.DAILY_ATTENDANCE],
    });

    if (consecutiveDays === 7) {
      totalPoints += config.points.streakBonus;
      pointRecords.push({
        userId,
        type: POINT_TYPES.STREAK_BONUS,
        amount: config.points.streakBonus,
        description: POINT_TYPE_DESCRIPTIONS[POINT_TYPES.STREAK_BONUS],
      });
    }

    await tx.pointHistory.createMany({ data: pointRecords });

    await tx.user.update({
      where: { id: userId },
      data: { points: { increment: totalPoints } },
    });

    return {
      attendance,
      pointsEarned: totalPoints,
      consecutiveDays,
      isStreakBonus: consecutiveDays === 7,
    };
  });

  return result;
};

