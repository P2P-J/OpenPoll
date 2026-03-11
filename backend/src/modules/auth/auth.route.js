import { Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import * as authController from './auth.controller.js';
import { signupValidation, loginValidation, refreshTokenValidation, changePasswordValidation, sendVerificationCodeValidation, verifyCodeValidation, checkNicknameValidation } from './auth.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// IP 기반: 15분에 30회 제한
const authIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyGenerator: ipKeyGenerator,
  message: { success: false, message: '너무 많은 요청입니다. 15분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 이메일 기반: 15분에 10회 제한 (Brute-Force 방지)
const authEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  message: { success: false, message: '너무 많은 요청입니다. 15분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// IP 기반: 1시간에 10회 제한
const signupIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: ipKeyGenerator,
  message: { success: false, message: '너무 많은 회원가입 시도입니다. 1시간 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 이메일 기반: 1시간에 5회 제한 (대량 계정 생성 방지)
const signupEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  message: { success: false, message: '너무 많은 회원가입 시도입니다. 1시간 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// IP 기반: 1분에 5회 제한
const emailCodeIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: ipKeyGenerator,
  message: { success: false, message: '너무 많은 인증 코드 요청입니다. 1분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 이메일 기반: 1분에 3회 제한
const emailCodeEmailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  message: { success: false, message: '너무 많은 인증 코드 요청입니다. 1분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const nicknameLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/check-nickname', nicknameLimiter, checkNicknameValidation, validate, authController.checkNickname);
router.post('/email/send-code', emailCodeIpLimiter, emailCodeEmailLimiter, sendVerificationCodeValidation, validate, authController.sendVerificationCode);
router.post('/email/verify-code', emailCodeIpLimiter, emailCodeEmailLimiter, verifyCodeValidation, validate, authController.verifyCode);
router.post('/signup', signupIpLimiter, signupEmailLimiter, signupValidation, validate, authController.signup);
router.post('/login', authIpLimiter, authEmailLimiter, loginValidation, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authIpLimiter, authEmailLimiter, refreshTokenValidation, validate, authController.refresh);
router.patch('/password', authenticate, authIpLimiter, authEmailLimiter, changePasswordValidation, validate, authController.changePassword);
router.get('/oauth/:provider', authController.oauthStart);
router.get('/oauth/:provider/callback', authController.oauthCallback);
router.post('/profile/complete', authenticate, signupValidation, authController.completeProfile);
router.delete('/withdraw', authenticate, authController.withdraw);

export default router;
