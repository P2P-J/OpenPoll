import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { authApi, userApi, getErrorMessage } from "@/api";
import {
  isTokenExpired,
  refreshTokens,
  scheduleProactiveRefresh,
  cancelProactiveRefresh,
  clearTokens,
} from "@/api/client";
import type { AxiosError } from "axios";
import type { User, AuthResponse } from "@/types/api.types";
import { STORAGE_KEYS } from "@/shared/constants";

/** localStorage 세션을 userData와 동기화하고, notify가 true이면 storage 이벤트를 발행 */
function syncSession(userData: { nickname: string; email: string; points: number }, notify = false) {
  const session = {
    nickname: userData.nickname,
    email: userData.email,
    points: userData.points,
  };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  if (notify) window.dispatchEvent(new Event("storage"));
}

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
    verificationCode: string;
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
    let retryTimerId: number | undefined;
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      // 토큰이 없으면 로그인 필요
      if (!accessToken && !refreshToken) {
        localStorage.removeItem(STORAGE_KEYS.SOCIAL_PROFILE_PENDING);
        setIsLoading(false);
        return;
      }

      try {
        // Access Token이 만료됐으면 Refresh Token으로 갱신 시도
        if (isTokenExpired()) {
          if (!refreshToken) {
            clearTokens();
            setIsLoading(false);
            return;
          }

          const result = await refreshTokens();
          if (!result) {
            clearTokens();
            setIsLoading(false);
            return;
          }
        }

        // 사용자 정보 조회
        const userData = await userApi.getMe();
        setUser(userData);

        syncSession(userData);

        // 선제적 토큰 갱신 스케줄 설정
        scheduleProactiveRefresh();
      } catch (err) {
        // 에러 타입에 따라 다르게 처리
        const isNetworkError = err instanceof Error && err.message.includes("Network Error");
        const axiosErr = err as AxiosError;
        const isAuthError =
          axiosErr?.response?.status === 401 ||
          axiosErr?.response?.status === 403;

        if (isNetworkError) {
          // 네트워크 에러: 서버가 꺼져있거나 연결 불가
          tryLoadLocalSession();
        } else if (isAuthError) {
          // 인증 에러: 토큰이 유효하지 않음
          clearTokens();
        } else {
          // 기타 서버 에러 (500 등): 토큰을 유지하고 로컬 세션 사용
          tryLoadLocalSession();
          // 백그라운드에서 재시도
          retryTimerId = window.setTimeout(async () => {
            try {
              const userData = await userApi.getMe();
              setUser(userData);
              syncSession(userData);
            } catch {
              // 백그라운드 갱신 실패는 무시
            }
          }, 5000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // 로컬 세션 정보로 임시 사용자 데이터 설정
    const tryLoadLocalSession = () => {
      try {
        const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          // 세션 정보로 최소한의 User 객체 생성
          setUser({
            id: "", // ID는 알 수 없음
            email: session.email || "",
            nickname: session.nickname || "",
            points: session.points || 0,
            age: 0,
            gender: "MALE",
            region: "",
            hasTakenDos: false,
            createdAt: "",
          });
        }
      } catch {
        // 로컬 세션 로드 실패는 무시
      }
    };

    initializeAuth();

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      cancelProactiveRefresh();
      if (retryTimerId) window.clearTimeout(retryTimerId);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await authApi.login({ email, password });

      // Save tokens
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      localStorage.removeItem(STORAGE_KEYS.SOCIAL_PROFILE_PENDING);
      localStorage.removeItem(STORAGE_KEYS.IS_OAUTH_USER);

      // Set user
      setUser(response.user);

      syncSession(response.user, true);

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
      verificationCode: string;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response: AuthResponse = await authApi.signup(data);

        // Save tokens
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        localStorage.removeItem(STORAGE_KEYS.SOCIAL_PROFILE_PENDING);

        // Set user
        setUser(response.user);

        syncSession(response.user, true);

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
    } catch {
      // 로그아웃 API 에러는 무시
    } finally {
      // Clear tokens and user regardless of API call success
      clearTokens();
      setUser(null);

      // Clear localAuth session
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem(STORAGE_KEYS.SOCIAL_PROFILE_PENDING);
      localStorage.removeItem(STORAGE_KEYS.IS_OAUTH_USER);
      window.dispatchEvent(new Event("storage"));
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
      return;
    }

    try {
      const userData = await userApi.getMe();
      setUser(userData);

      syncSession(userData, true);
    } catch {
      // 사용자 갱신 실패는 무시
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
