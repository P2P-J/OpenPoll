import { motion } from "motion/react";
import { History, TrendingUp, TrendingDown } from "lucide-react";
import type { PointRecord } from "@/types/api.types";
import { getPointTypeText, formatProfileDate } from "@/shared/utils/profileHelpers";
import { useTheme } from "@/contexts/ThemeContext";

interface PointHistorySectionProps {
  pointHistory: PointRecord[];
}

export function PointHistorySection({ pointHistory }: PointHistorySectionProps) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`rounded-3xl border shadow-sm p-6 sm:p-8 mb-6 ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <History className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
        <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>포인트 내역</h3>
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          (최근 20개)
        </span>
      </div>

      {pointHistory.length > 0 ? (
        <div className="space-y-3">
          {pointHistory.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.amount > 0 ? (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <TrendingUp className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
                    <TrendingDown className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                )}
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                    {item.description ||
                      getPointTypeText(item.type, item.amount)}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatProfileDate(item.createdAt)}
                  </p>
                </div>
              </div>
              <div
                className={`font-bold text-lg ${
                  item.amount > 0
                    ? isDark ? "text-green-400" : "text-green-600"
                    : isDark ? "text-red-400" : "text-red-600"
                }`}
              >
                {item.amount > 0 ? "+" : ""}
                {item.amount}P
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>아직 포인트 내역이 없습니다</p>
        </div>
      )}
    </motion.div>
  );
}
