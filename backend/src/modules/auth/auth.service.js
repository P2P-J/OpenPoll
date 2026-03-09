import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/database.js';
import redis, { CACHE_KEYS, CACHE_TTL } from '../../config/redis.js';
import config from '../../config/index.js';
import AppError from '../../utils/AppError.js';
import { POINT_TYPES, POINT_TYPE_DESCRIPTIONS } from '../../constants/pointTypes.js';
import { getProvider } from './oauth/index.js';
import { saveOAuthState, consumeOAuthState } from './oauth/oauth.state.js';


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


// 인증 코드 검증 (코드 삭제 없이 확인만)
export const verifyEmailCode = async (email, code) => {
  const cacheKey = `${CACHE_KEYS.EMAIL_VERIFY}${email}`;
  const storedCode = await redis.get(cacheKey);

  if (!storedCode) {
    throw AppError.badRequest('인증 코드가 만료되었거나 발송되지 않았습니다.');
  }
  if (storedCode !== code) {
    throw AppError.badRequest('인증 코드가 일치하지 않습니다.');
  }
};


// 닉네임 중복 확인
export const checkNickname = async (nickname) => {
  const existing = await prisma.user.findUnique({
    where: { nickname },
  });
  return { available: !existing };
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


export const getOAuthRedirectUrl = async ({ providerName, mode }) => {
  const provider = getProvider(providerName);

  const state = uuidv4();
  await saveOAuthState(state, {
    providerName,
    mode: mode ?? null, // 'rejoin' | null
  });

  return provider.getAuthUrl({
    state,
    forceConsent: mode === 'rejoin', // rejoin이면 동의 화면 강제
    redirectUri: config.oauth[providerName].redirectUri,
    clientId: config.oauth[providerName].clientId,
  });
};


export const handleOAuthCallback = async ({ providerName, code, state }) => {
  const oauthState = await consumeOAuthState(state);
  if (!oauthState || oauthState.providerName !== providerName) {
    throw AppError.unauthorized('유효하지 않은 OAuth state입니다.');
  }

  const provider = getProvider(providerName);
  const profile = await provider.getProfileFromCode({
    code,
    state, // naver에서 필요
    redirectUri: config.oauth[providerName].redirectUri,
    clientId: config.oauth[providerName].clientId,
    clientSecret: config.oauth[providerName].clientSecret,
  });

  // 탈퇴 이력 체크
  const withdrawn = await prisma.withdrawnOauth.findUnique({
    where: { provider_providerUserId: { provider: profile.provider, providerUserId: profile.providerUserId } },
  });

  // 탈퇴 이력 존재하면 rejoin 이여야함 => 재가입 절차
  // 탈퇴 이력 존재 + rejoin 모드 아니면 에러
  if (withdrawn && oauthState.mode !== 'rejoin') {
    throw AppError.conflict('REJOIN_REQUIRED');
  }

  // rejoin이면 탈퇴 이력 삭제
  if (withdrawn && oauthState.mode === 'rejoin') {
    await prisma.withdrawnOauth.delete({
      where: { provider_providerUserId: { provider: profile.provider, providerUserId: profile.providerUserId } },
    });
  }

  // oauth 계정으로 가입/로그인 처리
  const user = await prisma.$transaction(async (tx) => {
    const existingAccount = await tx.oAuthAccount.findUnique({
      where: { provider_providerUserId: { provider: profile.provider, providerUserId: profile.providerUserId } },
      include: { user: true },
    });
    if (existingAccount) {
      if (profile.oauthRefreshToken) { // 새 refresh token 갱신
        await tx.oAuthAccount.update({
          where: { id: existingAccount.id },
          data: { oauthRefreshToken: profile.oauthRefreshToken },
        });
      }
      return existingAccount.user;
    };

    if (!profile.email) {
      throw AppError.badRequest('이 OAuth 계정에서 이메일을 가져올 수 없습니다.');
    }

    // 나중에 일반 로그인과 소셜 연동 기능이 생길 수 있으니 이메일 중복 체크
    const emailTaken = await tx.user.findUnique({ where: { email: profile.email } });
    if (emailTaken) {
      throw AppError.conflict('이미 가입된 이메일입니다. 일반 로그인 후 소셜 연동을 진행하세요.');
    }

    const newUser = await tx.user.create({
      data: {
        email: profile.email,
        password: null,
        nickname: null,
        age: null,
        region: null,
        gender: null,
        points: config.points.signup,
      },
    });

    await tx.oAuthAccount.create({
      data: {
        userId: newUser.id,
        provider: profile.provider,
        providerUserId: profile.providerUserId,
        email: profile.email,
        name: profile.name,
        oauthRefreshToken: profile.oauthRefreshToken ?? null,
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

  const profileComplete = Boolean(user.nickname && user.age && user.region && user.gender);

  return {
    user: sanitizeUser(user),
    profileComplete,
    ...tokens,
  };
};


export const completeProfile = async (userId, { nickname, age, region, gender }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { nickname, age, region, gender },
  });

  const tokens = await generateTokens(user.id);

  return {
    user: sanitizeUser(user),
    profileComplete: true,
    ...tokens,
  };
};


export const withdrawUser = async (userId, currentProvider) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      oauthAccounts: {
        select: {
          provider: true,
          providerUserId: true,
          oauthRefreshToken: true,
        },
      },
    },
  });

  if (!user) return;
  // throw AppError.notFound('유저를 찾을 수 없습니다.');

  if (!currentProvider) {
    await prisma.$transaction(async (tx) => {
      await tx.user.delete({ where: { id: userId } });
    });
    return;
  }

  if (currentProvider !== 'google' && currentProvider !== 'naver') {
    console.warn('UNKNOWN_PROVIDER:', currentProvider);
    throw AppError.badRequest('지원하지 않는 provider입니다.');
  }

  const oauth = user.oauthAccounts.find((a) => a.provider === currentProvider) ?? null;

  if (!oauth) {
    console.warn('OAUTH_ACCOUNT_NOT_FOUND_FOR_PROVIDER:', { userId, currentProvider });
    throw AppError.badRequest('현재 로그인 provider 계정을 찾을 수 없습니다.');
  }

  const providerUserId = oauth.providerUserId ?? null;
  const refreshToken = oauth.oauthRefreshToken ?? null;

  try {
    const provider = getProvider(currentProvider);
    const revokeFunc = provider?.revokeToken;

    if (!revokeFunc) {
      console.warn('OAUTH_REVOKE_FUNC_MISSING:', currentProvider);
    } else if (!refreshToken) {
      // refresh token 없으면 revoke 불가
      console.warn('OAUTH_REFRESH_TOKEN_MISSING:', currentProvider, userId);
    } else {
      if (currentProvider === 'google') {
        await revokeFunc(refreshToken); // google revoke는 token만
      } else {
        // naver revoke는 clientId/clientSecret 필요
        const { clientId, clientSecret } = config.oauth.naver;
        await revokeFunc(refreshToken, { clientId, clientSecret });
      }
    }
  } catch (error) {
    console.error('OAUTH_REVOKE_FAILED:',
      currentProvider, error?.response?.data || error?.message
    );
    // throw AppError.internal('서버 에러가 발생했습니다.');
  }

  await prisma.$transaction(async (tx) => {
    if ((currentProvider === 'google' || currentProvider === 'naver') && providerUserId) {
      await tx.withdrawnOauth.upsert({
        where: {
          provider_providerUserId: { provider: currentProvider, providerUserId },
        },
        update: { withdrawnAt: new Date() },
        create: { provider: currentProvider, providerUserId, withdrawnAt: new Date() },
      });
    }

    await tx.user.delete({ where: { id: userId } });
  });
  return;
};
