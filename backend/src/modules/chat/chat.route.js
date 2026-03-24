import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as chatController from './chat.controller.js';
import { sendMessageValidation } from './chat.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticate, optionalAuth } from '../../middlewares/auth.middleware.js';

// 메시지 전송: 1분당 10회 제한
const sendMessageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: '너무 많은 메시지를 보냈습니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 메시지 조회: 1분당 30회 제한
const getMessagesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.get('/stream', chatController.streamChat);
router.get('/messages', optionalAuth, getMessagesLimiter, chatController.getMessages);
router.post('/messages', authenticate, sendMessageLimiter, sendMessageValidation, validate, chatController.sendMessage);

export default router;
