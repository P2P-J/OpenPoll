import * as userService from './user.service.js';
import { successResponse, paginatedResponse } from '../../utils/response.js';
import catchAsyncError from '../../utils/catchAsyncError.js';

export const getMe = catchAsyncError(async (req, res) => {
  const user = await userService.getMe(req.user.id);
  successResponse(res, user);
});

export const updateMe = catchAsyncError(async (req, res) => {
  const user = await userService.updateMe(req.user.id, req.body);
  successResponse(res, user);
});

export const getPointHistory = catchAsyncError(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1; // 페이지 번호
  const limit = parseInt(req.query.limit, 10) || 20; // 페이지당 20개씩(내역)
  
  const result = await userService.getPointHistory(req.user.id, page, limit);
  paginatedResponse(res, result.history, result.pagination); // 페이지네이션 응답은 따로 있음
});

export const getMyVoteStats = catchAsyncError(async (req, res) => {
  const stats = await userService.getMyVoteStats(req.user.id);
  successResponse(res, stats);
});
