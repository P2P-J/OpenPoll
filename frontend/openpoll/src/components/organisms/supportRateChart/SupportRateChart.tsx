import { motion } from 'motion/react';
import { Card } from '@/components/atoms';
import { PartyVoteItem, PartyData } from '@/components/molecules';

export interface SupportRateChartProps {
  partyData: PartyData[];
  totalParticipants: number;
  selectedParty: string | null;
  isLoggedIn: boolean;
  onVote: (partyId: string) => void;
  onLogin: () => void;
  season?: string;
}

export function SupportRateChart({
  partyData,
  totalParticipants,
  selectedParty,
  isLoggedIn,
  onVote,
  onLogin,
  season = 'Season 1',
}: SupportRateChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="max-w-4xl mx-auto mb-8 sm:mb-12 lg:mb-16"
    >
      <Card variant="glass" padding="lg">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
            실시간 지지율
          </h2>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            총 <span className="text-white font-semibold">{totalParticipants.toLocaleString()}명</span>이 참여했습니다
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {partyData.map((party, index) => (
            <PartyVoteItem
              key={party.id}
              party={party}
              totalParticipants={totalParticipants}
              isSelected={selectedParty === party.id}
              isLoggedIn={isLoggedIn}
              onVote={onVote}
              animationDelay={0.5 + index * 0.1}
            />
          ))}
        </div>

        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-6 sm:mt-8 text-center"
          >
            <button
              onClick={onLogin}
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-black rounded-full font-semibold text-sm sm:text-base hover:bg-gray-100 transition-colors"
            >
              로그인하고 투표하기
            </button>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
              로그인하면 지지하는 정당에 투표할 수 있어요
            </p>
          </motion.div>
        )}

        {selectedParty && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center"
          >
            <p className="text-green-400 font-semibold text-sm sm:text-base">
              ✅ {partyData.find(p => p.id === selectedParty)?.name}에 투표하셨습니다
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              변경 시 200P가 차감됩니다
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 text-center text-xs sm:text-sm text-gray-400"
        >
          <p>시즌제로 운영됩니다 · 현재 {season} · 익명 집계</p>
        </motion.div>
      </Card>
    </motion.div>
  );
}
