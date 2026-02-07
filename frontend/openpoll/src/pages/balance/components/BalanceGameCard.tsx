import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Flame,
  CheckCircle,
  Users,
  ArrowRight,
  X,
  Pencil,
} from "lucide-react";
import type {
  BalanceListItem,
  BalanceListItemExtended,
} from "@/types/balance.types";

interface BalanceGameCardProps {
  issue: BalanceListItem;
  isLoggedIn: boolean;
  isAdmin: boolean;
  hideAdminActions: boolean;
  onEdit: (issue: BalanceListItem) => void;
  onDelete: (issue: BalanceListItem) => void;
}

export function BalanceGameCard({
  issue,
  isLoggedIn,
  isAdmin,
  hideAdminActions,
  onEdit,
  onDelete,
}: BalanceGameCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipAnimating, setIsFlipAnimating] = useState(false);
  const flipTimerRef = useRef<number | null>(null);

  const issueEx = issue as BalanceListItemExtended;

  const participantsSafe = Number(issue.participants ?? issue.totalVotes ?? 0);
  const agreePercentSafe =
    participantsSafe <= 0 ? 0 : Number(issue.agreePercent ?? 0);
  const disagreePercentSafe =
    participantsSafe <= 0 ? 0 : Math.max(0, 100 - agreePercentSafe);

  const isHotIssue = participantsSafe >= 3000;
  const showCompleted =
    isLoggedIn && (Boolean(issueEx.voted) || issue.myVote !== null);

  const agreeCountSafe =
    participantsSafe <= 0
      ? 0
      : Math.round((agreePercentSafe / 100) * participantsSafe);
  const disagreeCountSafe =
    participantsSafe <= 0 ? 0 : participantsSafe - agreeCountSafe;

  const startFlip = (next: boolean) => {
    if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current);
    setIsFlipAnimating(true);
    setIsFlipped(next);
    flipTimerRef.current = window.setTimeout(() => {
      setIsFlipAnimating(false);
      flipTimerRef.current = null;
    }, 650);
  };

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current);
    };
  }, []);

  const showAdminActions = isAdmin && !hideAdminActions && !isFlipAnimating;
  const isBackFace = isFlipped && !isFlipAnimating;

  const adminBtnClass = isBackFace
    ? "w-11 h-11 bg-transparent border-0 rounded-none shadow-none hover:bg-transparent transition-all flex items-center justify-center"
    : "w-11 h-11 rounded-full bg-black/80 border border-white/25 hover:border-white/50 hover:bg-black transition-all flex items-center justify-center";

  const adminIconClass = isBackFace ? "text-black" : "text-white";

  return (
    <div
      className="relative group h-full"
      onMouseEnter={() => startFlip(true)}
      onMouseLeave={() => startFlip(false)}
      style={{ isolation: "isolate" }}
    >
      {showAdminActions && (
        <div
          className="pointer-events-auto flex gap-0.5"
          style={{
            position: "absolute",
            top: 4,
            right: 6,
            zIndex: 99999,
            isolation: "isolate",
            pointerEvents: "auto",
          }}
        >
          <button
            type="button"
            title="수정"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(issue);
            }}
            className={adminBtnClass}
            style={{ transform: "translateX(8px)" }}
          >
            <Pencil className={`w-5 h-5 ${adminIconClass}`} />
          </button>

          <button
            type="button"
            title="삭제"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(issue);
            }}
            className={adminBtnClass}
          >
            <X className={`w-5 h-5 ${adminIconClass}`} />
          </button>
        </div>
      )}

      <Link to={`/balance/${issue.id}`} className="block h-full">
        <div
          className="relative h-full preserve-3d"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            className="relative w-full h-full"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front Face */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-all shadow-lg"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="relative p-6 sm:p-8 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                    <span className="text-4xl sm:text-5xl">{issue.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold mb-1 group-hover:text-gray-300 transition-colors">
                        {issue.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2 flex flex-col items-end space-y-2">
                    {isHotIssue && (
                      <div
                        className="flex items-center space-x-1 px-3 py-1.5 text-white rounded-full text-xs font-bold animate-pulse border border-white/25 shadow-[0_10px_22px_rgba(239,68,68,0.45)]"
                        style={{ backgroundColor: "#ef4444" }}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>핫이슈!</span>
                      </div>
                    )}

                    {showCompleted && (
                      <div className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 border border-white/20 text-white rounded-full text-xs font-bold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>완료</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-400 text-sm sm:text-base mb-6 leading-relaxed flex-1">
                  {issue.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">참여 인원</span>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-white" />
                      <span className="font-bold text-2xl sm:text-3xl text-white">
                        {participantsSafe.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 font-semibold">
                        명
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-white font-bold text-sm group-hover:translate-x-1 transition-transform">
                    <span>투표하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Back Face */}
            <div
              className="absolute inset-0 bg-white rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-black shadow-lg"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="relative p-6 sm:p-8 h-full flex flex-col">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-6">
                  <span className="text-4xl sm:text-5xl">{issue.emoji}</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-black">
                    {issue.title}
                  </h3>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-black rounded-full" />
                        <span className="text-sm font-semibold text-black">
                          찬성
                        </span>
                        <span className="text-2xl font-bold text-black">
                          {agreePercentSafe}%
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-600">
                          {disagreePercentSafe}%
                        </span>
                        <span className="text-sm font-semibold text-gray-600">
                          반대
                        </span>
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      </div>
                    </div>

                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                      <div
                        className="absolute left-0 top-0 h-full bg-black rounded-full transition-all duration-500"
                        style={{ width: `${agreePercentSafe}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-black/5 rounded-xl">
                      <div className="text-xs text-gray-600 font-semibold mb-1">
                        찬성
                      </div>
                      <div className="text-lg font-bold text-black">
                        {agreeCountSafe.toLocaleString()}명
                      </div>
                    </div>

                    <div className="text-center p-3 bg-black/5 rounded-xl">
                      <div className="text-xs text-gray-600 font-semibold mb-1">
                        반대
                      </div>
                      <div className="text-lg font-bold text-gray-600">
                        {disagreeCountSafe.toLocaleString()}명
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-300 mt-4">
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">
                    마우스를 떼면 다시 뒤집혀요
                  </div>
                  <div className="flex items-center space-x-2 text-black font-bold text-sm">
                    <span>클릭해서 투표</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Link>
    </div>
  );
}
