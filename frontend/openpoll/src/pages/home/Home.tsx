import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Scale, Newspaper } from "lucide-react";
import { dosApi } from "@/api";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  HeroSection,
  SupportRateSection,
  FeaturesGrid,
  StatsSection,
  CTAButtons,
  CTASection,
} from "./components";
import { Toast } from "@/components/molecules/toast/Toast";
import { LoginModal } from "@/components/molecules/loginModal";
import { useVoting } from "@/contexts/VotingContext";
import { useUser } from "@/contexts/UserContext";

const FEATURES = [
  {
    icon: Brain,
    title: "DOS 테스트",
    description:
      "정치 MBTI? DOS 테스트로 나의 정치적 DNA를 8가지 차원으로 분석해보세요!",
    link: "/dos",
    color: "from-gray-900 to-gray-700",
  },
  {
    icon: Scale,
    title: "밸런스 게임",
    description: "정치 이슈에 대한 찬반 투표로 의견을 나눠보세요!",
    link: "/balance",
    color: "from-gray-700 to-gray-500",
  },
  {
    icon: Newspaper,
    title: "중립 뉴스",
    description: "AI가 순화한 중립적인 정치 뉴스를 읽어보세요!",
    link: "/news",
    color: "from-gray-600 to-gray-400",
  },
] as const;

export function Home() {
  usePageMeta("홈", "정치 성향 테스트, 밸런스 게임, 중립 뉴스를 한 곳에서. OpenPoll과 함께 정치 참여의 첫 걸음을 내딛어보세요.");
  const navigate = useNavigate();
  const { parties, stats, castVote, sseStatus } = useVoting();
  const { user, isAuthenticated } = useUser();
  const [selectedParty, setSelectedParty] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dosCompletedCount, setDosCompletedCount] = useState<number>(0);
  const [balanceParticipants, setBalanceParticipants] = useState<number>(0);

  // Fetch DOS 완료 수 and 밸런스 게임 참여 수 on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // DOS 통계
        const dosStats = await dosApi.getStatistics();
        setDosCompletedCount(dosStats.total);
      } catch (error) {
        console.error("Failed to fetch DOS statistics:", error);
      }

      try {
        // 밸런스 게임 목록에서 totalVotes 합산
        const { getBalanceList } = await import("@/api/balance.api");
        const balanceList = await getBalanceList();
        const totalBalanceParticipants = balanceList.reduce(
          (sum, game) => sum + (game.totalVotes || 0),
          0
        );
        setBalanceParticipants(totalBalanceParticipants);
      } catch (error) {
        console.error("Failed to fetch balance statistics:", error);
      }
    };
    fetchStats();
  }, []);

  // Build dynamic stats array
  const homeStats = useMemo(() => [
    { label: "DOS 테스트 완료", value: dosCompletedCount.toLocaleString() },
    { label: "투표 참여", value: (stats?.totalVotes || 0).toLocaleString() },
    { label: "밸런스 게임 참여", value: balanceParticipants.toLocaleString() },
  ], [dosCompletedCount, stats?.totalVotes, balanceParticipants]);

  const handleVote = useCallback(
    async (partyId: number) => {
      // Check if user is logged in before voting
      if (!isAuthenticated) {
        setShowLoginModal(true);
        return;
      }

      // Check if user has enough points
      const userPoints = user?.points || 0;
      if (userPoints < 5) {
        setToastMessage("포인트가 부족합니다! 투표하려면 5P가 필요합니다.");
        setToastType("error");
        setShowToast(true);
        return;
      }

      try {
        await castVote(partyId);
        setSelectedParty(partyId);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "투표에 실패했습니다.";
        setToastMessage(errorMessage);
        setToastType("error");
        setShowToast(true);
      }
    },
    [castVote, isAuthenticated, user?.points],
  );

  // Convert API Party data to PartyData format for display
  // SSE에서 실시간으로 받은 stats 데이터를 우선 사용
  const partyData = parties.map((party) => {
    const partyStat = stats?.stats.find((s) => s.partyId === party.id);
    return {
      id: party.id.toString(),
      name: party.name,
      color: party.color,
      logo: "🏛️", // Default logo, can be customized per party
      totalVotes: partyStat?.count ?? party.voteCount, // SSE에서 받은 count 우선 사용
      percentage: partyStat?.percentage ?? 0,
    };
  });

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <div className="pt-16">
        {/* Hero Section with Support Rate */}
        <section className="relative overflow-hidden bg-black text-white">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 4px),
                             repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px)`,
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
            <HeroSection />

            <SupportRateSection
              partyData={partyData}
              totalParticipants={stats?.totalVotes || 0}
              selectedParty={selectedParty?.toString() || null}
              onVote={(partyId) => handleVote(parseInt(partyId))}
              points={user?.points || 0}
              sseStatus={sseStatus}
            />

            <CTAButtons />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
        </section>

        <FeaturesGrid features={FEATURES} />
        <StatsSection stats={homeStats} />
        <CTASection />
      </div>
    </>
  );
}

