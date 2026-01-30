import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Export for use in other files
export { API_BASE_URL };

// ============================================
// Token Management Utilities
// ============================================

/**
 * JWT 토큰을 디코딩하여 payload 반환
 * 만료 시간 확인 등에 사용
 */
function decodeJWT(token: string): { userId: string; exp: number } | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Access Token이 만료되었거나 곧 만료되는지 확인
 * @param bufferSeconds 만료 전 여유 시간 (초) - 기본 60초
 */
export function isTokenExpiringSoon(bufferSeconds = 60): boolean {
  const token = localStorage.getItem("accessToken");
  if (!token) return true;

  const decoded = decodeJWT(token);
  if (!decoded) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp - currentTime < bufferSeconds;
}

/**
 * Access Token이 완전히 만료되었는지 확인
 */
export function isTokenExpired(): boolean {
  const token = localStorage.getItem("accessToken");
  if (!token) return true;

  const decoded = decodeJWT(token);
  if (!decoded) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

// ============================================
// Token Refresh Management (중복 호출 방지)
// ============================================

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let refreshFailSubscribers: Array<(error: Error) => void> = [];

/**
 * 토큰 갱신 완료 시 대기 중인 요청들에게 새 토큰 전달
 */
function onRefreshSuccess(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
  refreshFailSubscribers = [];
}

/**
 * 토큰 갱신 실패 시 대기 중인 요청들에게 에러 전달
 */
function onRefreshFailure(error: Error) {
  refreshFailSubscribers.forEach((callback) => callback(error));
  refreshSubscribers = [];
  refreshFailSubscribers = [];
}

/**
 * 토큰 갱신 완료를 기다리는 Promise 반환
 */
function waitForTokenRefresh(): Promise<string> {
  return new Promise((resolve, reject) => {
    refreshSubscribers.push(resolve);
    refreshFailSubscribers.push(reject);
  });
}

/**
 * 토큰 갱신 실행 (중복 호출 방지)
 */
export async function refreshTokens(): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    clearTokens();
    return null;
  }

  // 이미 갱신 중이면 완료를 기다림
  if (isRefreshing) {
    const token = await waitForTokenRefresh();
    const newRefreshToken = localStorage.getItem("refreshToken") || "";
    return { accessToken: token, refreshToken: newRefreshToken };
  }

  isRefreshing = true;

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    // 새 토큰 저장
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    // 대기 중인 요청들에게 알림
    onRefreshSuccess(accessToken);

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    onRefreshFailure(error as Error);
    clearTokens();
    return null;
  } finally {
    isRefreshing = false;
  }
}

/**
 * 토큰 삭제 및 로그인 페이지로 리다이렉트
 */
export function clearTokens(redirect = false) {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  if (redirect) {
    window.location.href = "/login";
  }
}

// ============================================
// 선제적 토큰 갱신 (Proactive Refresh)
// ============================================

let proactiveRefreshTimer: NodeJS.Timeout | null = null;

/**
 * Access Token 만료 1분 전에 자동으로 갱신하도록 타이머 설정
 */
export function scheduleProactiveRefresh() {
  // 기존 타이머 취소
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }

  const token = localStorage.getItem("accessToken");
  if (!token) return;

  const decoded = decodeJWT(token);
  if (!decoded) return;

  const currentTime = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = decoded.exp - currentTime;

  // 만료 1분 전에 갱신 (최소 10초 후)
  const refreshIn = Math.max((timeUntilExpiry - 60) * 1000, 10000);

  // 이미 만료됐거나 곧 만료되면 즉시 갱신
  if (timeUntilExpiry <= 60) {
    refreshTokens().then((result) => {
      if (result) {
        scheduleProactiveRefresh(); // 새 토큰으로 다시 스케줄
      }
    });
    return;
  }

  proactiveRefreshTimer = setTimeout(async () => {
    console.log("[Auth] Proactive token refresh triggered");
    const result = await refreshTokens();
    if (result) {
      scheduleProactiveRefresh(); // 새 토큰으로 다시 스케줄
    }
  }, refreshIn);

  console.log(
    `[Auth] Token refresh scheduled in ${Math.round(refreshIn / 1000)}s`
  );
}

/**
 * 선제적 갱신 타이머 취소
 */
export function cancelProactiveRefresh() {
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }
}

// ============================================
// Axios Instance & Interceptors
// ============================================

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("accessToken");

    // 토큰이 곧 만료되면 미리 갱신 시도 (선제적 갱신)
    if (token && isTokenExpiringSoon(30)) {
      console.log("[Auth] Token expiring soon, refreshing proactively");
      const result = await refreshTokens();
      if (result) {
        token = result.accessToken;
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const result = await refreshTokens();

        if (!result) {
          // 갱신 실패, 로그인 페이지로
          clearTokens(true);
          return Promise.reject(error);
        }

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
        }

        // 선제적 갱신 스케줄 재설정
        scheduleProactiveRefresh();

        return apiClient(originalRequest);
      } catch (refreshError) {
        clearTokens(true);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// Helper Functions
// ============================================

// Helper function to handle API errors
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      "알 수 없는 오류가 발생했습니다."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
};
