import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as newsController from './news.controller.js';

const router = Router();

const refreshLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1분
    max: 1,
    message: '잠시 후 다시 시도해주세요.',
});

router.post('/refresh', refreshLimiter, newsController.refreshArticles);
router.get('/articles', newsController.getArticles);

export default router;
