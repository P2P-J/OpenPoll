import { memo } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import type { PartyData } from '@/types/party.types';

interface SupportRateSectionProps {
  partyData: readonly PartyData[] | PartyData[];
  totalParticipants: number;
  selectedParty: string | null;
  onVote: (partyId: string) => void;
}

export const SupportRateSection = memo(function SupportRateSection({
  partyData,
  totalParticipants,
  selectedParty,
  onVote,
}: SupportRateSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="max-w-4xl mx-auto mb-8 sm:mb-12 lg:mb-16"
    >
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">실시간 지지율</h2>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            총 <span className="text-white font-semibold">{totalParticipants.toLocaleString()}명</span>이 참여했습니다
          </p>
        </div>

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
                  <div className="text-2xl sm:text-3xl lg:text-4xl">{party.logo}</div>
                  <div>
                    <div className="font-bold text-sm sm:text-base lg:text-lg">{party.name}</div>
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
                  <button
                    onClick={() => onVote(party.id)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                      selectedParty === party.id
                        ? 'bg-white text-black'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {selectedParty === party.id ? (
                      <span className="flex items-center space-x-1">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>선택됨</span>
                      </span>
                    ) : (
                      '투표하기 (5P)'
                    )}
                  </button>
                </div>
              </div>

              <div className="relative h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  key={party.percentage}
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ backgroundColor: party.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${party.percentage}%` }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {selectedParty && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center"
          >
            <p className="text-green-400 font-semibold text-sm sm:text-base">
              ✅ 투표가 완료되었습니다!
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              투표할 때마다 5P가 차감됩니다
            </p>
          </motion.div>
        )}

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
