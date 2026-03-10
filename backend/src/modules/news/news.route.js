import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as newsController from './news.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';

const router = Router();

const refreshLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1분
    max: 1,
    message: '잠시 후 다시 시도해주세요.',
});

// 뉴스 크롤링: 관리자 인증 필수 (OpenAI API 비용 보호)
router.post('/refresh', authenticate, requireAdmin, refreshLimiter, newsController.refreshArticles);
router.get('/articles', newsController.getArticles);

export default router;
