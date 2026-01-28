import { memo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PartyData } from "@/types/party.types";
import { VoteButton } from "@/components/atoms";
import { useUser } from "@/contexts/UserContext";
import { AlertCircle } from "lucide-react";

interface SupportRateSectionProps {
  partyData: readonly PartyData[] | PartyData[];
  totalParticipants: number;
  selectedParty: string | null;
  onVote: (partyId: string) => void;
  points: number;
}

export const SupportRateSection = memo(function SupportRateSection({
  partyData,
  totalParticipants,
  selectedParty,
  onVote,
  points,
}: SupportRateSectionProps) {
  const [loadingParty, setLoadingParty] = useState<string | null>(null);

  const handleVote = async (partyId: string) => {
    if (points < 5) {
      return; // Button will be disabled anyway
    }

    setLoadingParty(partyId);
    try {
      await onVote(partyId);
    } finally {
      setTimeout(() => setLoadingParty(null), 600);
    }
  };

  const hasInsufficientPoints = points < 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="max-w-4xl mx-auto mb-8 sm:mb-12 lg:mb-16"
    >
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
            실시간 지지율
          </h2>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            총{" "}
            <span className="text-white font-semibold">
              {totalParticipants.toLocaleString()}명
            </span>
            이 참여했습니다
          </p>
        </div>

        {/* Insufficient Points Warning */}
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

        <div className="space-y-4 sm:space-y-6">
          {partyData.map((party, index) => (
            <motion.div
              key={party.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 gap-2">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="text-2xl sm:text-3xl lg:text-4xl">
                    {party.logo}
                  </div>
                  <div>
                    <div className="font-bold text-sm sm:text-base lg:text-lg">
                      {party.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">
                      {party.totalVotes.toLocaleString()}표
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                  <motion.span
                    key={party.percentage}
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: party.color }}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {party.percentage.toFixed(1)}%
                  </motion.span>
                  <VoteButton
                    isSelected={selectedParty === party.id}
                    isLoading={loadingParty === party.id}
                    disabled={hasInsufficientPoints}
                    onClick={() => handleVote(party.id)}
                  />
                </div>
              </div>

              <div className="relative h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  key={party.percentage}
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ backgroundColor: party.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${party.percentage}%` }}
                  transition={{
                    delay: 0.7 + index * 0.1,
                    duration: 1,
                    ease: "easeOut",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

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
