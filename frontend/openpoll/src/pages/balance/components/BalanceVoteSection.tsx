import { motion } from "motion/react";
import { ThumbsUp, ThumbsDown, TrendingUp, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { VoteState, VoteOption } from "@/types/balance.types";

interface BalanceVoteSectionProps {
  isLoggedIn: boolean;
  isVoting: boolean;
  selectedOption: VoteState;
  agreeCountView: number;
  disagreeCountView: number;
  totalVotesSafe: number;
  agreePercentBar: number;
  disagreePercentBar: number;
  onVote: (option: VoteOption) => void;
}

export function BalanceVoteSection({
  isLoggedIn,
  isVoting,
  selectedOption,
  agreeCountView,
  disagreeCountView,
  totalVotesSafe,
  agreePercentBar,
  disagreePercentBar,
  onVote,
}: BalanceVoteSectionProps) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`relative bg-gradient-to-br ${isDark ? 'from-gray-900 to-black border-white/10' : 'from-gray-100 to-white border-black/10'} rounded-2xl sm:rounded-3xl p-8 sm:p-12 border-2 mb-8 overflow-hidden`}
    >
      <div className="relative">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <TrendingUp className="w-6 h-6" />
          <h2 className="text-2xl sm:text-3xl font-bold">투표 현황</h2>
        </div>

        <div className="mb-8">
          <div
            className={`relative ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} rounded-2xl overflow-hidden border`}
            style={{ height: 80 }}
          >
            <div
              className={`absolute left-0 top-0 h-full ${isDark ? 'bg-white' : 'bg-black'} flex items-center justify-start transition-all duration-500 overflow-hidden ${
                agreePercentBar <= 0 ? "px-0" : "px-6 sm:px-8"
              }`}
              style={{ width: `${agreePercentBar}%` }}
            >
              {agreePercentBar > 0 && (
                <div className={isDark ? "text-black" : "text-white"}>
                  <div className="flex items-center space-x-2 mb-1">
                    <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-bold text-sm sm:text-lg">찬성</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {agreePercentBar}%
                  </div>
                </div>
              )}
            </div>

            <div
              className={`absolute right-0 top-0 h-full flex items-center justify-end transition-all duration-500 overflow-hidden ${
                disagreePercentBar <= 0 ? "px-0" : "px-6 sm:px-8"
              }`}
              style={{
                width: `${disagreePercentBar}%`,
                backgroundColor: isDark ? "#1F2937" : "#E5E7EB",
                backgroundImage: isDark
                  ? "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(255,255,255,0.12) 4px, rgba(255,255,255,0.12) 8px)"
                  : "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(0,0,0,0.12) 4px, rgba(0,0,0,0.12) 8px)",
              }}
            >
              {disagreePercentBar > 0 && (
                <div className="text-right" style={{ color: isDark ? "#FFFFFF" : "#000000" }}>
                  <div className="flex items-center justify-end space-x-2 mb-1">
                    <span className="font-bold text-sm sm:text-lg">반대</span>
                    <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {disagreePercentBar}%
                  </div>
                </div>
              )}
            </div>

            {totalVotesSafe === 0 && (
              <div className={`absolute inset-0 flex items-center justify-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                아직 투표가 없어요
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className={`text-center p-4 sm:p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} border rounded-xl`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} font-semibold mb-2`}>
                찬성 인원
              </div>
              <div className="text-2xl sm:text-3xl font-bold">
                {agreeCountView.toLocaleString()}명
              </div>
            </div>
            <div className={`text-center p-4 sm:p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} border rounded-xl`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} font-semibold mb-2`}>
                반대 인원
              </div>
              <div className="text-2xl sm:text-3xl font-bold">
                {disagreeCountView.toLocaleString()}명
              </div>
            </div>
          </div>
        </div>

        <div className={`pt-6 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <h3 className="text-xl font-bold mb-4 text-center">당신의 선택은?</h3>
          {!isLoggedIn && (
            <div className={`mb-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              로그인 후 투표할 수 있어요.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onVote("agree")}
              disabled={isVoting}
              aria-pressed={selectedOption === "agree"}
              className={`relative p-6 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                selectedOption === "agree"
                  ? isDark ? "bg-white text-black border-2 border-white" : "bg-black text-white border-2 border-black"
                  : isDark ? "bg-white/10 text-white border-2 border-white/20 hover:bg-white/20" : "bg-black/10 text-black border-2 border-black/20 hover:bg-black/20"
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <ThumbsUp className="w-8 h-8" />
                <span className="font-bold text-lg">찬성</span>
                {selectedOption === "agree" && (
                  <div className="flex items-center space-x-1 text-sm">
                    <Check className="w-4 h-4" />
                    <span>선택됨</span>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => onVote("disagree")}
              disabled={isVoting}
              aria-pressed={selectedOption === "disagree"}
              className={`relative p-6 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                selectedOption === "disagree"
                  ? isDark ? "bg-white text-black border-2 border-white" : "bg-black text-white border-2 border-black"
                  : isDark ? "bg-white/10 text-white border-2 border-white/20 hover:bg-white/20" : "bg-black/10 text-black border-2 border-black/20 hover:bg-black/20"
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <ThumbsDown className="w-8 h-8" />
                <span className="font-bold text-lg">반대</span>
                {selectedOption === "disagree" && (
                  <div className="flex items-center space-x-1 text-sm">
                    <Check className="w-4 h-4" />
                    <span>선택됨</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className={`text-center py-4 mt-6 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            총{" "}
            <span className={`font-bold ${isDark ? 'text-white' : 'text-black'} text-lg`}>
              {totalVotesSafe.toLocaleString()}명
            </span>
            이 참여했습니다
          </p>
        </div>
      </div>
    </motion.div>
  );
}
