import { motion } from "motion/react";
import { Vote } from "lucide-react";
import type { UserVoteStats } from "@/types/api.types";
import { useTheme } from "@/contexts/ThemeContext";

interface PartyVotesSectionProps {
  voteStats: UserVoteStats | null;
}

export function PartyVotesSection({ voteStats }: PartyVotesSectionProps) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`rounded-3xl border shadow-sm p-6 sm:p-8 mb-6 ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <Vote className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
        <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          정당별 투표 통계
        </h3>
      </div>

      {voteStats && voteStats.stats.length > 0 ? (
        <>
          <div className="space-y-4">
            {voteStats.stats
              .filter((item) => item.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((item, index) => (
                <div key={item.partyId} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                        {item.partyName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
                        {item.count}회
                      </span>
                      <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({item.count * -5}P)
                      </span>
                    </div>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(item.count / voteStats.totalVotes) * 100}%`,
                      }}
                      transition={{
                        delay: 0.3 + index * 0.1,
                        duration: 0.5,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                총 투표 횟수
              </span>
              <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-black'}`}>
                {voteStats.totalVotes}회
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Vote className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>아직 투표 내역이 없습니다</p>
          <p className="text-sm mt-1">홈에서 정당 투표에 참여해보세요!</p>
        </div>
      )}
    </motion.div>
  );
}
