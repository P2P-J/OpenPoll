import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/database.js';
import redis, { CACHE_KEYS, CACHE_TTL } from '../../config/redis.js';
import config from '../../config/index.js';
import AppError from '../../utils/AppError.js';
import { POINT_TYPES, POINT_TYPE_DESCRIPTIONS } from '../../constants/pointTypes.js';


// nodemailer transporter
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});


// 인증 코드 발송
export const sendVerificationCode = async (email) => {

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw AppError.conflict('이미 사용 중인 이메일입니다.');
  }

  const cacheKey = `${CACHE_KEYS.EMAIL_VERIFY}${email}`;
  const ttl = await redis.ttl(cacheKey);
  if (ttl > CACHE_TTL.EMAIL_VERIFY - 60) {
    throw AppError.badRequest('인증 코드가 이미 발송되었습니다. 60초 후에 다시 시도해주세요.');
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));

  // Redis에 저장 (5분 TTL)
  await redis.setex(cacheKey, CACHE_TTL.EMAIL_VERIFY, code);

  // 이메일 발송
  await transporter.sendMail({
    from: `"OpenPoll" <${config.smtp.from}>`,
    to: email,
    subject: '[OpenPoll] 이메일 인증 코드',
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #333; margin-bottom: 24px;">이메일 인증</h2>
        <p style="color: #666; margin-bottom: 16px;">아래 인증 코드를 입력해주세요.</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 16px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
        </div>
        <p style="color: #999; font-size: 13px;">이 코드는 5분간 유효합니다.</p>
      </div>
    `,
  });
};


export const signup = async (userData) => {
  const { email, password, nickname, age, region, gender, verificationCode } = userData;

  // 인증 코드 검증
  const cacheKey = `${CACHE_KEYS.EMAIL_VERIFY}${email}`;
  const storedCode = await redis.get(cacheKey);

  if (!storedCode) {
    throw AppError.badRequest('인증 코드가 만료되었거나 발송되지 않았습니다. 인증 코드를 다시 요청해주세요.');
  }
  if (storedCode !== verificationCode) {
    throw AppError.badRequest('인증 코드가 일치하지 않습니다.');
  }

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

  // 사용된 인증 코드 삭제
  await redis.del(cacheKey);

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
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
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


export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw AppError.notFound('사용자를 찾을 수 없습니다.');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw AppError.unauthorized('현재 비밀번호가 올바르지 않습니다.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // 보안을 위해 기존 refresh token 삭제 (재로그인 필요)
  await redis.del(`${CACHE_KEYS.USER_REFRESH_TOKEN}${userId}`);
};


const generateTokens = async (userId) => {
  const accessToken = jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiresIn }
  );

  const refreshToken = jwt.sign(
    { userId, tokenId: uuidv4() },
    config.jwt.refreshSecret,
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

