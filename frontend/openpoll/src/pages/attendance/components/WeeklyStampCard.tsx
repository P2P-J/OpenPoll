import { memo } from "react";
import { motion } from "motion/react";
import { Flame } from "lucide-react";
import { StampSlot } from "./StampSlot";

interface WeeklyStampCardProps {
  streakCycle: number; // 현재 7일 주기 내 위치 (0~7)
  checkedInToday: boolean;
  onCheckIn: () => void;
  isChecking: boolean;
}

export const WeeklyStampCard = memo(function WeeklyStampCard({
  streakCycle,
  checkedInToday,
  onCheckIn,
  isChecking,
}: WeeklyStampCardProps) {
  const days = Array.from({ length: 7 }, (_, i) => i + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-effect rounded-3xl p-6 sm:p-8"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">주간 출석 카드</h2>
            <p className="text-xs sm:text-sm text-foreground-muted">매일 출석하고 보상을 받으세요</p>
          </div>
        </div>
        {streakCycle > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 rounded-full">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-sm font-bold text-orange-400">{streakCycle}일</span>
          </div>
        )}
      </div>

      {/* 7일 스탬프 그리드 */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4">
        {days.map((day, index) => {
          const isCompleted = day <= streakCycle;
          const isToday = day === streakCycle + 1 && !checkedInToday;
          const isBonusDay = day === 7;

          return (
            <StampSlot
              key={day}
              dayNumber={day}
              isCompleted={isCompleted}
              isToday={isToday}
              isBonusDay={isBonusDay}
              isClickable={isToday}
              isChecking={isChecking}
              onClick={isToday ? onCheckIn : undefined}
              animationDelay={index * 0.05}
            />
          );
        })}
      </div>

      {/* 프로그레스 바 */}
      <div className="mt-6 sm:mt-8">
        <div className="flex justify-between text-xs text-foreground-muted mb-2">
          <span>진행률</span>
          <span>{streakCycle}/7일</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--color-success)' }}
            initial={{ width: 0 }}
            animate={{ width: `${(streakCycle / 7) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
});
