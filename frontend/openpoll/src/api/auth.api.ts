import { apiClient } from "./client";
import type {
  SignupRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ApiResponse,
} from "@/types/api.types";

/**
 * 회원가입
 * POST /auth/signup
 */
export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    "/auth/signup",
    data,
  );
  return response.data.data;
};

/**
 * 로그인
 * POST /auth/login
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    data,
  );
  return response.data.data;
};

/**
 * 로그아웃
 * POST /auth/logout
 */
export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

/**
 * 토큰 재발급
 * POST /auth/refresh
 */
export const refreshToken = async (
  data: RefreshTokenRequest,
): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
    "/auth/refresh",
    data,
  );
  return response.data.data;
};
