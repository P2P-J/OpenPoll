import * as authService from "./auth.service.js";
import {
  successResponse,
  createdResponse,
  noContentResponse,
} from "../../utils/response.js";
import catchAsyncError from "../../utils/catchAsyncError.js";

export const sendVerificationCode = catchAsyncError(async (req, res) => {
  const { email } = req.body;
  await authService.sendVerificationCode(email);
  successResponse(res, { message: "인증 코드가 발송되었습니다." });
});

export const verifyCode = catchAsyncError(async (req, res) => {
  const { email, code } = req.body;
  await authService.verifyEmailCode(email, code);
  successResponse(res, { message: "인증 코드가 확인되었습니다." });
});

export const checkNickname = catchAsyncError(async (req, res) => {
  const { nickname } = req.query;
  const result = await authService.checkNickname(nickname);
  successResponse(res, result);
});

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

export const changePassword = catchAsyncError(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  noContentResponse(res);
});

export const oauthStart = catchAsyncError(async (req, res) => {
  const { provider } = req.params;
  const { mode } = req.query;
  const authUrl = await authService.getOAuthRedirectUrl({
    providerName: provider,
    mode,
  });
  return res.redirect(authUrl);
});

export const oauthCallback = catchAsyncError(async (req, res) => {
  const { provider } = req.params;
  const { code, state } = req.query;
  try {
    const result = await authService.handleOAuthCallback({
      providerName: provider,
      code,
      state,
    });
    return successResponse(res, result);
  } catch (error) {
    if (
      provider === "google" &&
      error?.statusCode === 409 &&
      error?.message === "REJOIN_REQUIRED"
    ) {
      return res.redirect("/api/auth/oauth/google?mode=rejoin");
    }
    throw error;
  }
});

export const completeProfile = catchAsyncError(async (req, res) => {
  const result = await authService.completeProfile(req.user.id, req.body);
  return successResponse(res, result);
});

export const withdraw = catchAsyncError(async (req, res) => {
  await authService.withdrawUser(req.user.id, req.user.provider);
  noContentResponse(res);
});
