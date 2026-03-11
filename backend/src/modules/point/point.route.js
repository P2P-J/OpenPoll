import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as pointController from './point.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

// 출석 어뷰징 방지: 1분당 6회 제한
const attendanceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  message: { success: false, message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.use(authenticate);

router.get('/attendance/status', pointController.getAttendanceStatus);
router.post('/attendance', attendanceLimiter, pointController.checkAttendance);

export default router;
