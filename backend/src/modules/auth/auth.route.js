import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from './auth.controller.js';
import { signupValidation, loginValidation, refreshTokenValidation, changePasswordValidation, sendVerificationCodeValidation } from './auth.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// 로그인/비밀번호 변경: 15분에 10회 제한 (Brute-Force 방지)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: '너무 많은 요청입니다. 15분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 회원가입: 1시간에 5회 제한 (대량 계정 생성 방지)
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: '너무 많은 회원가입 시도입니다. 1시간 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 이메일 인증 코드 발송: 1분에 3회 제한
const emailCodeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { success: false, message: '너무 많은 인증 코드 요청입니다. 1분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/email/send-code', emailCodeLimiter, sendVerificationCodeValidation, validate, authController.sendVerificationCode);
router.post('/signup', signupLimiter, signupValidation, validate, authController.signup);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authLimiter, refreshTokenValidation, validate, authController.refresh);
router.patch('/password', authenticate, authLimiter, changePasswordValidation, validate, authController.changePassword);

export default router;
