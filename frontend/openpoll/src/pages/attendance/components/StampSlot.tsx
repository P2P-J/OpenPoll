import { memo } from "react";
import { motion } from "motion/react";
import { Check, Gift, Stamp } from "lucide-react";

interface StampSlotProps {
  dayNumber: number;
  isCompleted: boolean;
  isToday: boolean;
  isBonusDay: boolean;
  isClickable: boolean;
  isChecking: boolean;
  onClick?: () => void;
  animationDelay?: number;
}

export const StampSlot = memo(function StampSlot({
  dayNumber,
  isCompleted,
  isToday,
  isBonusDay,
  isClickable,
  isChecking,
  onClick,
  animationDelay = 0,
}: StampSlotProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      className="flex flex-col items-center gap-2"
    >
      {/* 도장 슬롯 */}
      <motion.button
        type="button"
        disabled={!isClickable || isChecking}
        onClick={onClick}
        whileTap={isClickable ? { scale: 0.9 } : undefined}
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all ${
          isCompleted
            ? isBonusDay
              ? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30"
              : "bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-green-500/20"
            : isToday
              ? "bg-surface-elevated border-2 border-dashed border-default cursor-pointer hover:opacity-80"
              : "bg-surface border border-default"
        }`}
      >
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
              delay: animationDelay + 0.1,
            }}
          >
            {isBonusDay ? (
              <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            ) : (
              <Check className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={3} />
            )}
          </motion.div>
        ) : isToday ? (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Stamp className="w-6 h-6 sm:w-7 sm:h-7 text-foreground-muted" />
          </motion.div>
        ) : (
          <span className="text-foreground-subtle text-lg font-bold">{dayNumber}</span>
        )}

        {/* 오늘 표시 링 */}
        {isToday && !isCompleted && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-default"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Day 라벨 */}
      <span
        className={`text-xs font-semibold ${
          isCompleted
            ? "text-foreground"
            : isToday
              ? "text-foreground-muted"
              : "text-foreground-subtle"
        }`}
      >
        {isBonusDay ? "BONUS" : `Day ${dayNumber}`}
      </span>

      {/* 보너스 포인트 표시 */}
      {isBonusDay && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: animationDelay + 0.2 }}
          className={`text-xs font-bold ${isCompleted ? "text-yellow-300" : "text-yellow-500/50"}`}
        >
          +20P
        </motion.span>
      )}
    </motion.div>
  );
});
