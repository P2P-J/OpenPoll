import prisma from '../../config/database.js';
import config from '../../config/index.js';
import AppError from '../../utils/AppError.js';
import { POINT_TYPES, POINT_TYPE_DESCRIPTIONS } from '../../constants/pointTypes.js';

/**
 * 한국 시간(KST, UTC+9) 기준으로 오늘 날짜를 UTC midnight로 반환
 * 서버 시간대에 관계없이 항상 KST 기준 날짜를 사용
 */
function getKSTToday() {
  const now = new Date();
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000;
  const kst = new Date(kstMs);
  return new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
}

export const checkAttendance = async (userId) => {
  const today = getKSTToday();

  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      userId_date: { userId, date: today },
    },
  });
  if (existingAttendance) {
    throw AppError.badRequest('오늘 이미 출석 체크를 했습니다.');
  }

  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
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

    if (consecutiveDays > 0 && consecutiveDays % 7 === 0) {
      totalPoints += config.points.consecutiveAttendanceBonus;
      pointRecords.push({
        userId,
        type: POINT_TYPES.CONSECUTIVE_ATTENDANCE_BONUS,
        amount: config.points.consecutiveAttendanceBonus,
        description: POINT_TYPE_DESCRIPTIONS[POINT_TYPES.CONSECUTIVE_ATTENDANCE_BONUS],
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
      isStreakBonus: consecutiveDays > 0 && consecutiveDays % 7 === 0,
    };
  });

  return result;
};


export const getAttendanceStatus = async (userId) => {
  const today = getKSTToday();

  // 오늘 출석 여부
  const todayAttendance = await prisma.attendance.findUnique({
    where: {
      userId_date: { userId, date: today },
    },
  });

  // 현재 연속 출석 일수
  let consecutiveDays = 0;
  if (todayAttendance) {
    consecutiveDays = todayAttendance.consecutiveDays;
  } else {
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date: { userId, date: yesterday },
      },
    });
    consecutiveDays = yesterdayAttendance ? yesterdayAttendance.consecutiveDays : 0;
  }

  // 이번 달 출석 기록 (KST 기준)
  const firstDayOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const lastDayOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  const monthlyAttendances = await prisma.attendance.findMany({
    where: {
      userId,
      date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
    },
    orderBy: { date: 'asc' },
  });

  // 총 누적 출석 일수
  const totalAttendanceDays = await prisma.attendance.count({
    where: { userId },
  });

  return {
    checkedInToday: !!todayAttendance,
    consecutiveDays,
    totalAttendanceDays,
    streakCycle: consecutiveDays % 7 || (consecutiveDays > 0 ? 7 : 0),
    recentAttendances: monthlyAttendances.map((a) => ({
      date: a.date,
      consecutiveDays: a.consecutiveDays,
    })),
  };
};
