import { motion } from 'motion/react';
import { cn } from '@/shared/utils/cn';

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  bgColor?: string;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
  animated?: boolean;
  className?: string;
}

const heightClasses = {
  sm: 'h-1.5 sm:h-2',
  md: 'h-2 sm:h-3',
  lg: 'h-6 sm:h-8',
};

export function ProgressBar({
  value,
  max = 100,
  color = 'bg-white',
  bgColor = 'bg-white/10',
  height = 'md',
  showLabel = false,
  labelPosition = 'outside',
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('relative rounded-full overflow-hidden', bgColor, heightClasses[height])}>
        {animated ? (
          <motion.div
            className={cn('absolute left-0 top-0 h-full rounded-full', color)}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ) : (
          <div
            className={cn('absolute left-0 top-0 h-full rounded-full', color)}
            style={{ width: `${percentage}%` }}
          />
        )}
        
        {showLabel && labelPosition === 'inside' && height === 'lg' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-semibold mix-blend-difference">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
      
      {showLabel && labelPosition === 'outside' && (
        <div className="mt-1 text-xs sm:text-sm font-medium text-gray-400">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}
