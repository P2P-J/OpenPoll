import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { voteApi, dashboardApi, partyApi, getErrorMessage } from "@/api";
import type { Party, DashboardStats } from "@/types/api.types";
import { useUser } from "@/contexts/UserContext";

interface VotingContextType {
  parties: Party[];
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  castVote: (partyId: number) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export function VotingProvider({ children }: { children: ReactNode }) {
  const { updatePoints, refreshUser } = useUser();
  const [parties, setParties] = useState<Party[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        console.error("Failed to load voting data:", err);
        setError(getErrorMessage(err));
      }
    };

    loadInitialData();
  }, []);

  // Subscribe to real-time updates via SSE
  useEffect(() => {
    const eventSource = dashboardApi.subscribeToStream(
      (data) => {
        setStats(data);
      },
      (error) => {
        console.error("SSE connection error:", error);
      },
    );

    return () => {
      eventSource.close();
    };
  }, []);

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
