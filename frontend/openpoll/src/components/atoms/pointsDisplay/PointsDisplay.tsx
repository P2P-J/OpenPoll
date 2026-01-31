import { motion } from 'motion/react';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface PointsDisplayProps {
  points: number;
  className?: string;
  showAnimation?: boolean;
}

export function PointsDisplay({
  points,
  className = '',
  showAnimation = true
}: PointsDisplayProps) {
  const [prevPoints, setPrevPoints] = useState(points);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    if (points !== prevPoints) {
      setDelta(points - prevPoints);
      setPrevPoints(points);

      // Clear delta after animation
      if (showAnimation) {
        setTimeout(() => setDelta(0), 1000);
      }
    }
  }, [points, prevPoints, showAnimation]);

  const isLowPoints = points < 25; // Warning when less than 5 votes remaining
  const isCriticalPoints = points < 5; // Can't vote anymore

  return (
    <motion.div
      className={`
        flex items-center space-x-2 px-3 sm:px-4 py-2
        rounded-full backdrop-blur-sm
        ${isCriticalPoints
          ? 'bg-red-500/20 border border-red-500/50 text-red-400'
          : isLowPoints
          ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
          : 'bg-white/10 border border-white/20 text-white'
        }
        ${className}
      `}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <Coins className="w-4 h-4 sm:w-5 sm:h-5" />

      <div className="flex items-center space-x-1">
        <motion.span
          className="font-bold text-sm sm:text-base"
          key={points}
          initial={showAnimation ? { scale: 1.2, color: delta < 0 ? '#ef4444' : '#22c55e' } : {}}
          animate={{ scale: 1, color: 'inherit' }}
          transition={{ duration: 0.3 }}
        >
          {points.toLocaleString()}
        </motion.span>
        <span className="text-xs sm:text-sm opacity-70">P</span>
      </div>

      {/* Delta indicator */}
      {delta !== 0 && showAnimation && (
        <motion.div
          className={`flex items-center text-xs ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}
          initial={{ opacity: 0, y: delta > 0 ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {delta > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{delta > 0 ? '+' : ''}{delta}</span>
        </motion.div>
      )}
    </motion.div>
  );
}
