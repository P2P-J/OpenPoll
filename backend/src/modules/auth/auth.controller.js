import * as authService from './auth.service.js';
import { successResponse, createdResponse, noContentResponse } from '../../utils/response.js';
import catchAsyncError from '../../utils/catchAsyncError.js';

export const signup = catchAsyncError(async (req, res) => {
  const result = await authService.signup(req.body);
  createdResponse(res, result);
});

export const login = catchAsyncError(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  successResponse(res, result);
});

export const logout = catchAsyncError(async (req, res) => {
  await authService.logout(req.user.id);
  noContentResponse(res);
});

export const refresh = catchAsyncError(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshAccessToken(refreshToken);
  successResponse(res, tokens);
});
