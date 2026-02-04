import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { voteApi, dashboardApi, partyApi, getErrorMessage } from "@/api";
import type { Party, DashboardStats } from "@/types/api.types";
import { useUser } from "@/contexts/UserContext";

type SSEConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface VotingContextType {
  parties: Party[];
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  sseStatus: SSEConnectionStatus;
  castVote: (partyId: number) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export function VotingProvider({ children }: { children: ReactNode }) {
  const { refreshUser } = useUser();
  const [parties, setParties] = useState<Party[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sseStatus, setSseStatus] = useState<SSEConnectionStatus>("connecting");

  // SSE 재연결 관련 ref
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000; // 1초

  // Load parties and stats on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [partiesData, statsData] = await Promise.all([
          partyApi.getParties(),
          dashboardApi.getStats(),
        ]);
        setParties(partiesData);
        setStats(statsData);
      } catch (err) {
        // 네트워크 에러인 경우 조용히 처리 (백엔드 서버가 실행되지 않을 수 있음)
        const isNetworkError = err instanceof Error && err.message.includes("Network Error");
        if (isNetworkError) {
          console.warn("[Voting] Cannot connect to server. Please ensure backend is running.");
        } else {
          console.error("Failed to load voting data:", err);
          setError(getErrorMessage(err));
        }
      }
    };

    loadInitialData();
  }, []);

  // SSE 연결 함수 (재연결 로직 포함)
  const connectSSE = useCallback(() => {
    // 이전 연결 정리
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setSseStatus("connecting");

    const eventSource = dashboardApi.subscribeToStream(
      (data) => {
        setStats(data);
        setSseStatus("connected");
        reconnectAttempts.current = 0; // 성공 시 재시도 횟수 초기화
      },
      (event) => {
        // 네트워크 에러는 조용히 처리
        if (reconnectAttempts.current === 0) {
          console.warn("SSE connection error: Cannot connect to server. Please ensure backend is running.");
        }

        // EventSource.CLOSED = 2
        if (eventSource.readyState === 2) {
          setSseStatus("disconnected");

          // 재연결 시도
          if (reconnectAttempts.current < maxReconnectAttempts) {
            // 지수 백오프: 1초, 2초, 4초, 8초... (최대 30초)
            const delay = Math.min(
              baseReconnectDelay * Math.pow(2, reconnectAttempts.current),
              30000
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current += 1;
              connectSSE();
            }, delay);
          } else {
            setSseStatus("error");
            console.warn("SSE max reconnect attempts reached. Backend may not be running.");
          }
        }
      }
    );

    eventSourceRef.current = eventSource;

    // 연결 성공 시 상태 업데이트
    eventSource.onopen = () => {
      setSseStatus("connected");
      reconnectAttempts.current = 0;
    };
  }, []);

  // Subscribe to real-time updates via SSE
  useEffect(() => {
    connectSSE();

    return () => {
      // 정리
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectSSE]);

  const castVote = useCallback(
    async (partyId: number) => {
      setLoading(true);
      setError(null);

      try {
        await voteApi.castVote({ partyId });

        // Refresh user to get updated points
        await refreshUser();

        // Refresh stats to show new vote count
        const updatedStats = await dashboardApi.getStats();
        setStats(updatedStats);

        setLoading(false);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      }
    },
    [refreshUser],
  );

  const refreshStats = useCallback(async () => {
    try {
      const [partiesData, statsData] = await Promise.all([
        partyApi.getParties(),
        dashboardApi.getStats(),
      ]);
      setParties(partiesData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to refresh stats:", err);
      setError(getErrorMessage(err));
    }
  }, []);

  return (
    <VotingContext.Provider
      value={{
        parties,
        stats,
        loading,
        error,
        sseStatus,
        castVote,
        refreshStats,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error("useVoting must be used within a VotingProvider");
  }
  return context;
}
