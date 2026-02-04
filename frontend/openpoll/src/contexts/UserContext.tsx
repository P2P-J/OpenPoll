import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authApi, userApi, getErrorMessage } from "@/api";
import {
  isTokenExpired,
  refreshTokens,
  scheduleProactiveRefresh,
  cancelProactiveRefresh,
  clearTokens,
} from "@/api/client";
import type { User, AuthResponse } from "@/types/api.types";

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    nickname: string;
    age: number;
    region: string;
    gender: "MALE" | "FEMALE";
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updatePoints: (points: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      // 토큰이 없으면 로그인 필요
      if (!accessToken && !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Access Token이 만료됐으면 Refresh Token으로 갱신 시도
        if (isTokenExpired()) {
          console.log("[Auth] Access token expired, attempting refresh...");

          if (!refreshToken) {
            console.log("[Auth] No refresh token available");
            clearTokens();
            setIsLoading(false);
            return;
          }

          const result = await refreshTokens();
          if (!result) {
            console.log("[Auth] Token refresh failed");
            clearTokens();
            setIsLoading(false);
            return;
          }

          console.log("[Auth] Token refreshed successfully");
        }

        // 사용자 정보 조회
        const userData = await userApi.getMe();
        setUser(userData);

        // Sync with localAuth session
        const session = {
          nickname: userData.nickname,
          email: userData.email,
          points: userData.points,
        };
        localStorage.setItem("openpoll_session_v1", JSON.stringify(session));

        // 선제적 토큰 갱신 스케줄 설정
        scheduleProactiveRefresh();
      } catch (err) {
        // 네트워크 에러인 경우 조용히 처리 (백엔드 서버가 실행되지 않을 수 있음)
        const isNetworkError = err instanceof Error && err.message.includes("Network Error");
        if (isNetworkError) {
          console.warn("[Auth] Cannot connect to server. Please ensure backend is running.");
        } else {
          console.error("Failed to initialize auth:", err);
        }
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      cancelProactiveRefresh();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await authApi.login({ email, password });

      // Save tokens
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // Set user
      setUser(response.user);

      // Sync with localAuth session for Header compatibility
      const session = {
        nickname: response.user.nickname,
        email: response.user.email,
        points: response.user.points,
      };
      localStorage.setItem("openpoll_session_v1", JSON.stringify(session));
      window.dispatchEvent(new Event("storage"));

      // 선제적 토큰 갱신 스케줄 설정
      scheduleProactiveRefresh();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (data: {
      email: string;
      password: string;
      nickname: string;
      age: number;
      region: string;
      gender: "MALE" | "FEMALE";
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response: AuthResponse = await authApi.signup(data);

        // Save tokens
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        // Set user
        setUser(response.user);

        // Sync with localAuth session for Header compatibility
        const session = {
          nickname: response.user.nickname,
          email: response.user.email,
          points: response.user.points,
        };
        localStorage.setItem("openpoll_session_v1", JSON.stringify(session));
        window.dispatchEvent(new Event("storage"));

        // 선제적 토큰 갱신 스케줄 설정
        scheduleProactiveRefresh();
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    // 선제적 갱신 타이머 취소
    cancelProactiveRefresh();

    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear tokens and user regardless of API call success
      clearTokens();
      setUser(null);

      // Clear localAuth session
      localStorage.removeItem("openpoll_session_v1");
      window.dispatchEvent(new Event("storage"));
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) {
      return;
    }

    try {
      const userData = await userApi.getMe();
      setUser(userData);

      // Sync with localAuth session
      const session = {
        nickname: userData.nickname,
        email: userData.email,
        points: userData.points,
      };
      localStorage.setItem("openpoll_session_v1", JSON.stringify(session));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }, []);

  const updatePoints = useCallback((points: number) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, points };
    });
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        signup,
        logout,
        refreshUser,
        updatePoints,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
