import { motion } from "motion/react";
import { Info, Plus, Minus } from "lucide-react";

export function PointGuideSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 mb-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Info className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        <h3 className="text-xl font-bold dark:text-white">포인트 가이드</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-bold text-lg dark:text-white">
              포인트 획득
            </h4>
          </div>
          <div className="space-y-3">
            <PointGuideItem label="회원가입 완료" points="+500P" type="earn" />
            <PointGuideItem label="정치 MBTI 완료" points="+300P" type="earn" />
            <PointGuideItem label="밸런스 게임 참여 (1회)" points="+50P" type="earn" />
            <PointGuideItem label="일일 출석" points="+30P" type="earn" />
            <PointGuideItem label="연속 출석 보너스 (7일)" points="+20P" type="earn" />
            <PointGuideItem label="뉴스 읽기 (1개)" points="+10P" type="earn" />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Minus className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="font-bold text-lg dark:text-white">
              포인트 사용
            </h4>
          </div>
          <div className="space-y-3">
            <PointGuideItem label="정당 지지 투표" points="-5P" type="spend" />
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
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
}: {
  label: string;
  points: string;
  type: "earn" | "spend";
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <span className="text-sm dark:text-gray-300">{label}</span>
      <span
        className={`font-bold ${
          type === "earn"
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {points}
      </span>
    </div>
  );
}
