import { apiClient } from "./client";
import type {
  SignupRequest,
  LoginRequest,
  AuthResponse,
  OAuthAuthResponse,
  CompleteSocialProfileRequest,
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
 * 이메일 인증코드 발송
 * POST /auth/email/send-code
 */
export const sendVerificationCode = async (
  email: string,
): Promise<{ message: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/email/send-code",
    { email },
  );
  return response.data.data;
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

/**
 * OAuth 콜백 처리 결과 조회
 * GET /auth/oauth/:provider/callback?code&state
 */
export const oauthCallback = async (
  provider: "google" | "naver",
  code: string,
  state: string,
): Promise<OAuthAuthResponse> => {
  const response = await apiClient.get<ApiResponse<OAuthAuthResponse>>(
    `/auth/oauth/${provider}/callback`,
    {
      params: { code, state },
      withCredentials: true,
    },
  );
  return response.data.data;
};

/**
 * 소셜 가입 추가정보 완료
 * POST /auth/profile/complete
 */
export const completeSocialProfile = async (
  data: CompleteSocialProfileRequest,
): Promise<OAuthAuthResponse | null> => {
  const response = await apiClient.post<ApiResponse<OAuthAuthResponse> | null>(
    "/auth/profile/complete",
    data,
  );
  // Some servers return 204 No Content for this endpoint.
  if (
    !response.data ||
    typeof response.data !== "object" ||
    !("data" in response.data) ||
    !(response.data as ApiResponse<OAuthAuthResponse>).data
  ) {
    return null;
  }
  return (response.data as ApiResponse<OAuthAuthResponse>).data;
};
