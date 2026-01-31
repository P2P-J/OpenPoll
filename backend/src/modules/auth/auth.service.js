import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/database.js';
import redis, { CACHE_KEYS, CACHE_TTL } from '../../config/redis.js';
import config from '../../config/index.js';
import AppError from '../../utils/AppError.js';
import { POINT_TYPES, POINT_TYPE_DESCRIPTIONS } from '../../constants/pointTypes.js';


export const signup = async (userData) => {
  const { email, password, nickname, age, region, gender } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw AppError.conflict('이미 사용 중인 이메일입니다.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
        age,
        region,
        gender,
        points: config.points.signup,
      },
    });

    await tx.pointHistory.create({
      data: {
        userId: newUser.id,
        type: POINT_TYPES.SIGNUP,
        amount: config.points.signup,
        description: POINT_TYPE_DESCRIPTIONS[POINT_TYPES.SIGNUP],
      },
    });

    return newUser;
  });

  const tokens = await generateTokens(user.id);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};


export const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw AppError.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw AppError.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const tokens = await generateTokens(user.id);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};


export const logout = async (userId) => {
  await redis.del(`${CACHE_KEYS.USER_REFRESH_TOKEN}${userId}`);
};


export const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.secret);
  } catch (err) {
    throw AppError.unauthorized('유효하지 않은 Refresh Token입니다.');
  }

  const storedToken = await redis.get(`${CACHE_KEYS.USER_REFRESH_TOKEN}${decoded.userId}`);
  if (!storedToken || storedToken !== refreshToken) {
    throw AppError.unauthorized('유효하지 않은 Refresh Token입니다.');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });
  if (!user) {
    throw AppError.unauthorized('사용자를 찾을 수 없습니다.');
  }

  const tokens = await generateTokens(user.id);

  return tokens;
};


const generateTokens = async (userId) => {
  const accessToken = jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiresIn }
  );

  const refreshToken = jwt.sign(
    { userId, tokenId: uuidv4() },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  await redis.setex(
    `${CACHE_KEYS.USER_REFRESH_TOKEN}${userId}`,
    CACHE_TTL.REFRESH_TOKEN,
    refreshToken
  );

  return { accessToken, refreshToken };
};


const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};
