import { Router } from 'express';
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

const router = Router();

// 조회 자체는 비로그인도 가능
router.get('/', optionalAuth, balanceController.getGames);
router.get('/:id', optionalAuth, balanceController.getGame);
router.get('/:id/comments', optionalAuth, balanceController.getComments);

router.post('/:id/vote', authenticate, voteValidation, validate, balanceController.vote);
router.post('/:id/comments', authenticate, commentValidation, validate, balanceController.createComment);
router.patch('/:id/comments/:commentId', authenticate, updateCommentValidation, validate, balanceController.updateComment);
router.delete('/:id/comments/:commentId', authenticate, balanceController.deleteComment);
router.post('/:id/comments/:commentId/like', authenticate, balanceController.toggleCommentLike);

router.post('/', authenticate, requireAdmin, createGameValidation, validate, balanceController.createGame);
router.patch('/:id', authenticate, requireAdmin, updateGameValidation, validate, balanceController.updateGame);
router.delete('/:id', authenticate, requireAdmin, balanceController.deleteGame);

export default router;
