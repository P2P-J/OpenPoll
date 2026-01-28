import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { votingService } from '@/services/voting.service';
import type { PartyData } from '@/types/party.types';
import { useUser } from '@/contexts/UserContext';
import { broadcastVotingUpdate } from '@/hooks/useRealTimeVoting';

interface VotingContextType {
  parties: PartyData[];
  totalVotes: number;
  loading: boolean;
  error: string | null;
  castVote: (partyId: string) => Promise<void>;
  refreshStats: () => void;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export function VotingProvider({ children }: { children: ReactNode }) {
  const { updatePoints } = useUser();
  const [parties, setParties] = useState<PartyData[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Load party stats from localStorage
  const loadStats = useCallback(() => {
    const stats = votingService.getPartyStats();
    setParties(stats.parties);
    setTotalVotes(stats.totalVotes);
  }, []);

  // 초기 로드
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // localStorage 변경 감시 - 1초마다 폴링하여 실시간처럼 동작
  useEffect(() => {
    // BroadcastChannel 초기화 (같은 브라우저 탭 간 통신)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channelRef.current = new BroadcastChannel('voting-channel');
        channelRef.current.onmessage = (event) => {
          if (event.data.type === 'VOTING_UPDATE') {
            setParties(event.data.parties);
            setTotalVotes(event.data.totalVotes);
          }
        };
      } catch (error) {
        console.warn('BroadcastChannel 초기화 실패:', error);
      }
    }

    // 폴링으로 주기적으로 localStorage 확인
    const pollingInterval = setInterval(() => {
      loadStats();
    }, 1000); // 1초마다 확인

    return () => {
      clearInterval(pollingInterval);
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [loadStats]);

  const castVote = useCallback(
    async (partyId: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = votingService.castVote(partyId);

        // Update points in UserContext
        updatePoints(result.pointsRemaining);

        // Refresh stats to show new vote count
        loadStats();

        // 다른 탭에 투표 업데이트 브로드캐스트
        const updatedStats = votingService.getPartyStats();
        broadcastVotingUpdate(updatedStats.parties, updatedStats.totalVotes);

        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '투표에 실패했습니다.';
        setError(errorMessage);
        setLoading(false);
        throw err;
      }
    },
    [updatePoints, loadStats]
  );

  const refreshStats = useCallback(() => {
    loadStats();
  }, [loadStats]);

  return (
    <VotingContext.Provider
      value={{
        parties,
        totalVotes,
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
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
}
