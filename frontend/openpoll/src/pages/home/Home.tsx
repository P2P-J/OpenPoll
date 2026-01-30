import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Scale, Newspaper, LogIn, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  HeroSection,
  SupportRateSection,
  FeaturesGrid,
  StatsSection,
  CTAButtons,
  CTASection,
} from "./components";
import { Toast } from "@/components/molecules/toast/Toast";
import { useVoting } from "@/contexts/VotingContext";
import { useUser } from "@/contexts/UserContext";

const FEATURES = [
  {
    icon: Brain,
    title: "정치 MBTI",
    description: "8values 기반 테스트로 나의 정치 성향을 발견하세요",
    link: "/mbti",
    color: "from-gray-900 to-gray-700",
  },
  {
    icon: Scale,
    title: "밸런스 게임",
    description: "정치 이슈에 대한 찬반 투표로 의견을 나눠보세요",
    link: "/balance",
    color: "from-gray-700 to-gray-500",
  },
  {
    icon: Newspaper,
    title: "중립 뉴스",
    description: "AI가 순화한 중립적인 정치 뉴스를 읽어보세요",
    link: "/news",
    color: "from-gray-600 to-gray-400",
  },
] as const;

const STATS_DATA = [
  { label: "전체 사용자", value: "12,458" },
  { label: "MBTI 완료", value: "8,234" },
  { label: "투표 참여", value: "15,670" },
  { label: "뉴스 조회", value: "23,891" },
] as const;

export function Home() {
  const navigate = useNavigate();
  const { parties, stats, castVote } = useVoting();
  const { user, isAuthenticated } = useUser();
  const [selectedParty, setSelectedParty] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [showLoginModal, setShowLoginModal] = useState(false);

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
        setToastMessage("투표가 완료되었습니다!");
        setToastType("success");
        setShowToast(true);
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
  const partyData = parties.map((party) => ({
    id: party.id.toString(),
    name: party.name,
    color: party.color,
    logo: "🏛️", // Default logo, can be customized per party
    totalVotes: party.voteCount,
    percentage: stats
      ? stats.stats.find((s) => s.partyId === party.id)?.percentage || 0
      : 0,
  }));

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

     {/* Login Prompt Modal */}
<AnimatePresence>
  {showLoginModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={() => setShowLoginModal(false)}
    >
      {/* Backdrop - Blur Effect */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Content - Enhanced Design */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1] // Custom easing
        }}
        className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-3xl shadow-2xl w-[360px] aspect-square flex flex-col items-center justify-center p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Orbs Background */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
        
        {/* Close Button */}
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-all duration-200 hover:rotate-90 z-10"
          aria-label="닫기"
        >
          
        </button>

        {/* Icon with Animation */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mb-6 relative z-10"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
            <LogIn className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-8 relative z-10"
        >
          <h3 className="text-2xl font-bold text-white mb-3 bg-clip-text text-transparent">
            로그인이 필요합니다
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            투표에 참여하려면<br />
            <span className="text-gray-300">로그인</span>해주세요
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full space-y-3 relative z-10"
        >
          <button
            onClick={() => navigate("/login")}
            className="w-full h-12 bg-gradient-to-r from-black to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" />
            로그인하기
          </button>
          <button
            onClick={() => setShowLoginModal(false)}
            className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200 hover:border-white/20"
          >
            취소
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

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
            />

            <CTAButtons />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
        </section>

        <FeaturesGrid features={FEATURES} />
        <StatsSection stats={STATS_DATA} />
        <CTASection />
      </div>
    </>
  );
}
