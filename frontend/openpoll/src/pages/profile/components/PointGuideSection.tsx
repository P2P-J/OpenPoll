import { motion } from "motion/react";
import { Info, Plus, Minus } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function PointGuideSection() {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`rounded-3xl border shadow-sm p-6 sm:p-8 mb-6 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}
    >
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <Info className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
        <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>포인트 가이드</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <Plus className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
              포인트 획득
            </h4>
          </div>
          <div className="space-y-3">
            <PointGuideItem label="회원가입 완료" points="+500P" type="earn" isDark={isDark} />
            <PointGuideItem label="DOS 검사 완료" points="+300P" type="earn" isDark={isDark} />
            <PointGuideItem label="밸런스 게임 참여 (1회)" points="+50P" type="earn" isDark={isDark} />
            <PointGuideItem label="일일 출석" points="+30P" type="earn" isDark={isDark} />
            <PointGuideItem label="연속 출석 보너스 (7일)" points="+20P" type="earn" isDark={isDark} />
            <PointGuideItem label="뉴스 읽기 (1개)" points="+10P" type="earn" isDark={isDark} />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <Minus className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
              포인트 사용
            </h4>
          </div>
          <div className="space-y-3">
            <PointGuideItem label="정당 지지 투표" points="-5P" type="spend" isDark={isDark} />
            <div className={`p-4 border rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
              }`}>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                포인트가 부족하신가요? 위의 활동들을 통해 포인트를
                획득하세요!
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PointGuideItem({
  label,
  points,
  type,
  isDark,
}: {
  label: string;
  points: string;
  type: "earn" | "spend";
  isDark: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      <span
        className={`font-bold ${type === "earn"
            ? isDark ? "text-green-400" : "text-green-600"
            : isDark ? "text-red-400" : "text-red-600"
          }`}
      >
        {points}
      </span>
    </div>
  );
}
