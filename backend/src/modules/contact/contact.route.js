import { Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import * as contactController from './contact.controller.js';
import { contactValidation } from './contact.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// 건의사항: 15분에 3회 제한 (스팸 방지)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
  message: { success: false, message: '너무 많은 건의사항 요청입니다. 15분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', authenticate, contactLimiter, contactValidation, validate, contactController.sendContact);

export default router;
