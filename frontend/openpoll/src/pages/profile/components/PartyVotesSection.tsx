import { motion } from "motion/react";
import { Vote } from "lucide-react";
import type { UserVoteStats } from "@/types/api.types";

interface PartyVotesSectionProps {
  voteStats: UserVoteStats | null;
}

export function PartyVotesSection({ voteStats }: PartyVotesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 mb-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Vote className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        <h3 className="text-xl font-bold dark:text-white">
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
                      <span className="font-semibold dark:text-white">
                        {item.partyName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg dark:text-white">
                        {item.count}회
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        ({item.count * -5}P)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
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

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                총 투표 횟수
              </span>
              <span className="font-bold text-xl dark:text-white">
                {voteStats.totalVotes}회
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Vote className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>아직 투표 내역이 없습니다</p>
          <p className="text-sm mt-1">홈에서 정당 투표에 참여해보세요!</p>
        </div>
      )}
    </motion.div>
  );
}
