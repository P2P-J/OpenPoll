import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as balanceController from './balance.controller.js';
import {
  createGameValidation,
  updateGameValidation,
  voteValidation,
  commentValidation,
  updateCommentValidation,
} from './balance.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticate, optionalAuth } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';

// 밸런스 게임 투표: 1분당 20회 제한
const balanceVoteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 밸런스 게임 댓글: 1분당 20회 제한
const balanceCommentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// 조회 자체는 비로그인도 가능
router.get('/', optionalAuth, balanceController.getGames);
router.get('/:id', optionalAuth, balanceController.getGame);
router.get('/:id/comments', optionalAuth, balanceController.getComments);

router.post('/:id/vote', authenticate, balanceVoteLimiter, voteValidation, validate, balanceController.vote);
router.post('/:id/comments', authenticate, balanceCommentLimiter, commentValidation, validate, balanceController.createComment);
router.patch('/:id/comments/:commentId', authenticate, updateCommentValidation, validate, balanceController.updateComment);
router.delete('/:id/comments/:commentId', authenticate, balanceController.deleteComment);
router.post('/:id/comments/:commentId/like', authenticate, balanceController.toggleCommentLike);

router.post('/', authenticate, requireAdmin, createGameValidation, validate, balanceController.createGame);
router.patch('/:id', authenticate, requireAdmin, updateGameValidation, validate, balanceController.updateGame);
router.delete('/:id', authenticate, requireAdmin, balanceController.deleteGame);

export default router;
