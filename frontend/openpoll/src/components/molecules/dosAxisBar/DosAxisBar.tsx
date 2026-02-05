import { motion } from 'motion/react';

export interface DosAxisBarProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  leftScore: number;
  rightScore: number;
  animationDelay?: number;
}

export function DosAxisBar({
  label,
  leftLabel,
  rightLabel,
  leftScore,
  rightScore,
  animationDelay = 0,
}: DosAxisBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 gap-1">
        <span className="font-semibold text-base sm:text-lg">{label}</span>
        <span className="text-xs sm:text-sm text-gray-400">
          {leftLabel} {leftScore}% · {rightScore}% {rightLabel}
        </span>
      </div>
      <div className="relative h-6 sm:h-8 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${leftScore}%` }}
          transition={{ delay: animationDelay + 0.2, duration: 0.8 }}
        />
        <div className="absolute inset-0 flex items-center justify-between px-3 sm:px-4">
          <span className="text-xs sm:text-sm font-semibold relative z-10 mix-blend-difference">
            {leftLabel}
          </span>
          <span className="text-xs sm:text-sm font-semibold relative z-10 mix-blend-difference">
            {rightLabel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
