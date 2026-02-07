import { motion } from "motion/react";
import { History, TrendingUp, TrendingDown } from "lucide-react";
import type { PointRecord } from "@/types/api.types";
import { getPointTypeText, formatProfileDate } from "@/shared/utils/profileHelpers";

interface PointHistorySectionProps {
  pointHistory: PointRecord[];
}

export function PointHistorySection({ pointHistory }: PointHistorySectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 mb-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <History className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        <h3 className="text-xl font-bold dark:text-white">포인트 내역</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          (최근 20개)
        </span>
      </div>

      {pointHistory.length > 0 ? (
        <div className="space-y-3">
          {pointHistory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {item.amount > 0 ? (
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold dark:text-white">
                    {item.description ||
                      getPointTypeText(item.type, item.amount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatProfileDate(item.createdAt)}
                  </p>
                </div>
              </div>
              <div
                className={`font-bold text-lg ${
                  item.amount > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {item.amount > 0 ? "+" : ""}
                {item.amount}P
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>아직 포인트 내역이 없습니다</p>
        </div>
      )}
    </motion.div>
  );
}
