import * as balanceService from './balance.service.js';
import { successResponse, createdResponse, noContentResponse } from '../../utils/response.js';
import catchAsyncError from '../../utils/catchAsyncError.js';

// 얘는 목록 조회고
export const getGames = catchAsyncError(async (req, res) => {
  const userId = req.user?.id || null;
  const games = await balanceService.getGames(userId);
  successResponse(res, games);
});

// 얘는 상세 조회임(s 잘 보셈)
export const getGame = catchAsyncError(async (req, res) => {
  const gameId = parseInt(req.params.id, 10);
  const userId = req.user?.id || null;
  const game = await balanceService.getGame(gameId, userId);
  successResponse(res, game);
});

export const vote = catchAsyncError(async (req, res) => {
  const gameId = parseInt(req.params.id, 10);
  const { isAgree } = req.body;
  const result = await balanceService.vote(req.user.id, gameId, isAgree);
  createdResponse(res, result);
});

// 관리자: 추가
export const createGame = catchAsyncError(async (req, res) => {
  const { title, subtitle, description } = req.body;
  const game = await balanceService.createGame(title, subtitle, description);
  createdResponse(res, game);
});

// 관리자: 수정
export const updateGame = catchAsyncError(async (req, res) => {
  const gameId = parseInt(req.params.id, 10);
  const game = await balanceService.updateGame(gameId, req.body);
  successResponse(res, game);
});

// 관리자: 삭제
export const deleteGame = catchAsyncError(async (req, res) => {
  const gameId = parseInt(req.params.id, 10);
  await balanceService.deleteGame(gameId);
  noContentResponse(res);
});


export const getComments = catchAsyncError(async (req, res) => {
  const gameId = parseInt(req.params.id, 10);
  const userId = req.user?.id || null;
  const comments = await balanceService.getComments(gameId, userId);
  successResponse(res, comments);
});


export const createComment = catchAsyncError(async (req, res) => {
  const gameId = parseInt(req.params.id, 10);
  const { content, parentId } = req.body;
  const comment = await balanceService.createComment(req.user.id, gameId, content, parentId);
  createdResponse(res, comment);
});


export const deleteComment = catchAsyncError(async (req, res) => {
  const commentId = parseInt(req.params.commentId, 10);
  await balanceService.deleteComment(req.user.id, req.user.role, commentId);
  noContentResponse(res);
});

export const updateComment = catchAsyncError(async (req, res) => {
  const commentId = parseInt(req.params.commentId, 10);
  const { content } = req.body;
  const comment = await balanceService.updateComment(req.user.id, req.user.role, commentId, content);
  successResponse(res, comment);
});

export const toggleCommentLike = catchAsyncError(async (req, res) => {
  const commentId = parseInt(req.params.commentId, 10);
  const result = await balanceService.toggleCommentLike(req.user.id, commentId);
  successResponse(res, result);
});
