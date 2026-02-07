import { motion } from "motion/react";
import { ThumbsUp, ThumbsDown, TrendingUp, Check } from "lucide-react";
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl p-8 sm:p-12 border-2 border-white/10 mb-8 overflow-hidden"
    >
      <div className="relative">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <TrendingUp className="w-6 h-6" />
          <h2 className="text-2xl sm:text-3xl font-bold">투표 현황</h2>
        </div>

        <div className="mb-8">
          <div
            className="relative bg-white/5 rounded-2xl overflow-hidden border border-white/10"
            style={{ height: 80 }}
          >
            <div
              className={`absolute left-0 top-0 h-full bg-white flex items-center justify-start transition-all duration-500 overflow-hidden ${
                agreePercentBar <= 0 ? "px-0" : "px-6 sm:px-8"
              }`}
              style={{ width: `${agreePercentBar}%` }}
            >
              {agreePercentBar > 0 && (
                <div className="text-black">
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
              className={`absolute right-0 top-0 h-full bg-gray-800 flex items-center justify-end transition-all duration-500 overflow-hidden ${
                disagreePercentBar <= 0 ? "px-0" : "px-6 sm:px-8"
              }`}
              style={{ width: `${disagreePercentBar}%` }}
            >
              {disagreePercentBar > 0 && (
                <div className="text-white text-right">
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
              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                아직 투표가 없어요
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-4 sm:p-6 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-sm text-gray-400 font-semibold mb-2">
                찬성 인원
              </div>
              <div className="text-2xl sm:text-3xl font-bold">
                {agreeCountView.toLocaleString()}명
              </div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-sm text-gray-400 font-semibold mb-2">
                반대 인원
              </div>
              <div className="text-2xl sm:text-3xl font-bold">
                {disagreeCountView.toLocaleString()}명
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <h3 className="text-xl font-bold mb-4 text-center">당신의 선택은?</h3>
          {!isLoggedIn && (
            <div className="mb-4 text-center text-sm text-gray-400">
              로그인 후 투표할 수 있어요.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onVote("agree")}
              disabled={isVoting}
              className={`relative p-6 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                selectedOption === "agree"
                  ? "bg-white text-black border-2 border-white"
                  : "bg-white/10 text-white border-2 border-white/20 hover:bg-white/20"
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
              className={`relative p-6 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                selectedOption === "disagree"
                  ? "bg-white text-black border-2 border-white"
                  : "bg-white/10 text-white border-2 border-white/20 hover:bg-white/20"
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

        <div className="text-center py-4 mt-6 border-t border-white/10">
          <p className="text-gray-400">
            총{" "}
            <span className="font-bold text-white text-lg">
              {totalVotesSafe.toLocaleString()}명
            </span>
            이 참여했습니다
          </p>
        </div>
      </div>
    </motion.div>
  );
}
