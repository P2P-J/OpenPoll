import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import AppError from '../utils/AppError.js';
import prisma from '../config/database.js';
import catchAsyncError from '../utils/catchAsyncError.js';

export const authenticate = catchAsyncError(async (req, res, next) => {

  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw AppError.unauthorized('인증 토큰이 필요합니다.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw AppError.unauthorized('토큰이 만료되었습니다.');
    }
    throw AppError.unauthorized('유효하지 않은 토큰입니다.');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
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
  });

  if (!user) {
    throw AppError.unauthorized('해당 사용자가 존재하지 않습니다.');
  }

  req.user = user;
  next();
});
