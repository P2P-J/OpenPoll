import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { userApi } from "@/api";
import type { PointRecord, UserVoteStats } from "@/types/api.types";
import { ROUTES } from "@/shared/constants";

export interface UseProfileReturn {
  user: ReturnType<typeof useUser>["user"];
  pointHistory: PointRecord[];
  voteStats: UserVoteStats | null;
  isLoading: boolean;
  showPasswordModal: boolean;
  setShowPasswordModal: (show: boolean) => void;
  handleBack: () => void;
}

export function useProfile(): UseProfileReturn {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useUser();

  const [pointHistory, setPointHistory] = useState<PointRecord[]>([]);
  const [voteStats, setVoteStats] = useState<UserVoteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        const [pointHistoryRes, voteStatsRes] = await Promise.all([
          userApi.getPointHistory({ limit: 20 }),
          userApi.getMyVotes(),
        ]);

        setPointHistory(pointHistoryRes.data);
        setVoteStats(voteStatsRes);
      } catch {
        // 프로필 데이터 로드 실패
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const handleBack = () => navigate(ROUTES.HOME);

  const combinedLoading = authLoading || isLoading || !user;

  return {
    user: combinedLoading ? null : user,
    pointHistory,
    voteStats,
    isLoading: combinedLoading,
    showPasswordModal,
    setShowPasswordModal,
    handleBack,
  };
}
