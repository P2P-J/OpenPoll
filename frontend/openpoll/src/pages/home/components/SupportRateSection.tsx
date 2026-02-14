import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "motion/react";
import type { PartyData } from "@/types/party.types";
import { VoteButton } from "@/components/atoms";
import { useUser } from "@/contexts/UserContext";
import { AlertCircle, TrendingUp } from "lucide-react";

type SSEConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface SupportRateSectionProps {
  partyData: readonly PartyData[] | PartyData[];
  totalParticipants: number;
  selectedParty: string | null;
  onVote: (partyId: string) => void;
  points: number;
  sseStatus?: SSEConnectionStatus;
}

/**
 * 실시간 숫자 애니메이션 컴포넌트
 * 코인/주식 호가창처럼 부드럽게 카운트업
 */
const AnimatedValue = memo(function AnimatedValue({
  value,
  decimals = 0,
  color,
  suffix = "",
  showChangeIndicator = false,
}: {
  value: number;
  decimals?: number;
  color?: string;
  suffix?: string;
  showChangeIndicator?: boolean;
}) {
  const [prevValue, setPrevValue] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [changeAmount, setChangeAmount] = useState(0);
  const [showChange, setShowChange] = useState(false);

  const spring = useSpring(value, {
    stiffness: 80,
    damping: 15,
  });

  const displayValue = useTransform(spring, (latest) =>
    decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toLocaleString()
  );

  // Render-time 변화 감지 (React 권장 패턴)
  if (value !== prevValue) {
    setPrevValue(value);
    if (hasAnimated && showChangeIndicator) {
      setChangeAmount(value - prevValue);
      setShowChange(true);
    }
    setHasAnimated(true);
  }

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    if (showChange) {
      const timeout = setTimeout(() => setShowChange(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [showChange]);

  return (
    <span className="relative inline-flex items-center">
      <motion.span
        key={`animated-${value}`}
        initial={{ scale: 1 }}
        animate={
          hasAnimated
            ? {
                scale: [1, 1.12, 1],
                textShadow: [
                  "0 0 0px transparent",
                  `0 0 25px ${color || "#ffffff"}`,
                  "0 0 0px transparent",
                ],
              }
            : {}
        }
        transition={{ duration: 0.4 }}
        style={{ color }}
      >
        <motion.span>{displayValue}</motion.span>
        {suffix}
      </motion.span>

      {/* 변화량 표시 */}
      <AnimatePresence>
        {showChange && changeAmount !== 0 && (
          <motion.span
            initial={{ opacity: 0, y: 5, x: 5 }}
            animate={{ opacity: 1, y: -15, x: 5 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.3 }}
            className={`absolute top-0 right-0 text-xs font-bold whitespace-nowrap ${
              changeAmount > 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {changeAmount > 0 ? "+" : ""}
            {decimals > 0 ? changeAmount.toFixed(decimals) : changeAmount}
            {suffix}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
});

/**
 * 실시간 프로그레스 바
 * 부드러운 너비 전환 + 글로우 효과
 */
const AnimatedProgressBar = memo(function AnimatedProgressBar({
  percentage,
  color,
}: {
  percentage: number;
  color: string;
}) {
  const [prevPercentage, setPrevPercentage] = useState(percentage);
  const [hasChanged, setHasChanged] = useState(false);

  // Render-time 변화 감지 (React 권장 패턴)
  if (percentage !== prevPercentage) {
    setPrevPercentage(percentage);
    setHasChanged(true);
  }

  useEffect(() => {
    if (hasChanged) {
      const timeout = setTimeout(() => setHasChanged(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [hasChanged]);

  return (
    <div className="relative h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{
          width: `${percentage}%`,
          boxShadow: hasChanged
            ? `0 0 20px ${color}, 0 0 40px ${color}40`
            : `0 0 8px ${color}60`,
        }}
        transition={{
          width: {
            duration: 0.8,
            ease: "easeOut",
          },
          boxShadow: {
            duration: 0.3,
          },
        }}
      />

      {/* 글로우 펄스 효과 */}
      <AnimatePresence>
        {hasChanged && (
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              backgroundColor: color,
              width: `${percentage}%`,
            }}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

/**
 * 개별 정당 카드 컴포넌트
 */
const PartyCard = memo(function PartyCard({
  party,
  index,
  isSelected,
  isLoading,
  disabled,
  onVote,
}: {
  party: PartyData;
  index: number;
  isSelected: boolean;
  isLoading: boolean;
  disabled: boolean;
  onVote: () => void;
}) {
  const [prevVotes, setPrevVotes] = useState(party.totalVotes);
  const [voteJustChanged, setVoteJustChanged] = useState(false);

  // Render-time 변화 감지 (React 권장 패턴)
  if (party.totalVotes !== prevVotes) {
    setPrevVotes(party.totalVotes);
    setVoteJustChanged(true);
  }

  useEffect(() => {
    if (voteJustChanged) {
      const timeout = setTimeout(() => setVoteJustChanged(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [voteJustChanged]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.1 }}
      className="group"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 gap-2">
        {/* 정당 정보 */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <motion.div
            className="text-2xl sm:text-3xl lg:text-4xl"
            animate={
              voteJustChanged
                ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, -5, 5, 0],
                  }
                : {}
            }
            transition={{ duration: 0.4 }}
          >
            {party.logo}
          </motion.div>
          <div>
            <div className="font-bold text-sm sm:text-base lg:text-lg">
              {party.name}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
              <AnimatedValue
                value={party.totalVotes}
                showChangeIndicator={true}
              />
              <span>표</span>
              {voteJustChanged && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center"
                >
                  <TrendingUp className="w-3 h-3 text-green-400 ml-1" />
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* 퍼센트 및 투표 버튼 */}
        <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
          <span className="text-2xl sm:text-3xl font-bold relative">
            <AnimatedValue
              value={party.percentage}
              decimals={1}
              color={party.color}
              suffix="%"
              showChangeIndicator={true}
            />
          </span>
          <VoteButton
            isSelected={isSelected}
            isLoading={isLoading}
            disabled={disabled}
            onClick={onVote}
          />
        </div>
      </div>

      {/* 프로그레스 바 */}
      <AnimatedProgressBar
        percentage={party.percentage}
        color={party.color}
      />
    </motion.div>
  );
});

/**
 * 실시간 지지율 대시보드 섹션
 * SSE를 통해 실시간으로 업데이트되는 투표 현황을 표시
 */
export const SupportRateSection = memo(function SupportRateSection({
  partyData,
  totalParticipants,
  selectedParty,
  onVote,
  points,
  sseStatus = "connected",
}: SupportRateSectionProps) {
  const [loadingParty, setLoadingParty] = useState<string | null>(null);
  const { isAuthenticated } = useUser();

  const handleVote = async (partyId: string) => {
    setLoadingParty(partyId);
    try {
      await onVote(partyId);
    } finally {
      setTimeout(() => setLoadingParty(null), 600);
    }
  };

  const hasInsufficientPoints = isAuthenticated && points < 5;

  // SSE 연결 상태에 따른 인디케이터 색상
  const getStatusColor = () => {
    switch (sseStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "disconnected":
        return "bg-orange-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusTitle = () => {
    switch (sseStatus) {
      case "connected":
        return "실시간 연결됨";
      case "connecting":
        return "연결 중...";
      case "disconnected":
        return "연결 끊김 - 재연결 시도 중";
      case "error":
        return "연결 오류";
      default:
        return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="max-w-4xl mx-auto mb-8 sm:mb-12 lg:mb-16"
    >
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-12">
        {/* 헤더 */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              실시간 지지율
            </h2>
            <motion.div
              animate={
                sseStatus === "connected"
                  ? { opacity: [1, 0.5, 1] }
                  : sseStatus === "connecting"
                    ? { scale: [1, 1.2, 1] }
                    : {}
              }
              transition={{ duration: sseStatus === "connecting" ? 0.8 : 2, repeat: Infinity }}
              className={`w-2 h-2 rounded-full ${getStatusColor()}`}
              title={getStatusTitle()}
            />
          </div>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            총{" "}
            <span className="text-white font-semibold">
              <AnimatedValue value={totalParticipants} />명
            </span>
            이 참여했습니다
          </p>
        </div>

        {/* 포인트 부족 경고 */}
        <AnimatePresence>
          {hasInsufficientPoints && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm font-semibold">
                    포인트가 부족합니다! 투표하려면 5P가 필요합니다.
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-6 sm:ml-7">
                  포인트는 매일 자동으로 충전됩니다.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 정당 목록 */}
        <div className="space-y-4 sm:space-y-6">
          {partyData.map((party, index) => (
            <PartyCard
              key={party.id}
              party={party}
              index={index}
              isSelected={selectedParty === party.id}
              isLoading={loadingParty === party.id}
              disabled={hasInsufficientPoints}
              onVote={() => handleVote(party.id)}
            />
          ))}
        </div>

        {/* 푸터 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 text-center text-xs sm:text-sm text-gray-400"
        >
          <p>시즌제로 운영됩니다 · 현재 Season 1 · 익명 집계</p>
        </motion.div>
      </div>
    </motion.div>
  );
});
