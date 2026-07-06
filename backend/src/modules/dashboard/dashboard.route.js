import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as dashboardController from './dashboard.controller.js';

// SSE 연결 수립: 1분당 30회 제한 (연결 폭주로 인한 자원 고갈 방지)
const streamLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: '너무 많은 연결 요청입니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.get('/stream', streamLimiter, dashboardController.streamDashboard);

router.get('/stats', dashboardController.getOverallStats);

router.get('/stats/by-age', dashboardController.getStatsByAge);

router.get('/stats/by-region', dashboardController.getStatsByRegion);

export default router;
