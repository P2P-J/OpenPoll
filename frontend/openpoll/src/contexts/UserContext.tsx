import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authApi, userApi, getErrorMessage } from "@/api";
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
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await userApi.getMe();
        setUser(userData);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        // Token might be invalid, clear it
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
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
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear tokens and user regardless of API call success
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) {
      return;
    }

    try {
      const userData = await userApi.getMe();
      setUser(userData);
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
