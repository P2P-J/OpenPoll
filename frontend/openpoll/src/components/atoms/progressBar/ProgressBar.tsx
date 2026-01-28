import { motion } from 'motion/react';
import { cn } from '@/shared/utils/cn';

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  color?: string;
  bgColor?: string;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
  animated?: boolean;
  showGlow?: boolean;
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
  variant = 'default',
  color,
  bgColor,
  height = 'md',
  showLabel = false,
  labelPosition = 'outside',
  animated = true,
  showGlow = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Get colors based on variant
  const getVariantColors = () => {
    if (color && bgColor) {
      return { foreground: color, background: bgColor };
    }

    switch (variant) {
      case 'success':
        return {
          foreground: 'var(--color-success)',
          background: 'var(--color-success-bg)',
        };
      case 'warning':
        return {
          foreground: 'var(--color-warning)',
          background: 'var(--color-warning-bg)',
        };
      case 'error':
        return {
          foreground: 'var(--color-error)',
          background: 'var(--color-error-bg)',
        };
      case 'info':
        return {
          foreground: 'var(--color-info)',
          background: 'var(--color-info-bg)',
        };
      default:
        return {
          foreground: 'var(--color-primary)',
          background: 'var(--color-secondary)',
        };
    }
  };

  const colors = getVariantColors();

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative rounded-full overflow-hidden transition-all duration-300',
          heightClasses[height]
        )}
        style={{
          backgroundColor: colors.background,
        }}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={showLabel ? undefined : `${Math.round(percentage)}% 완료`}
      >
        {animated ? (
          <motion.div
            className={cn('absolute left-0 top-0 h-full rounded-full', {
              'shadow-inner-glow': showGlow,
            })}
            style={{
              backgroundColor: colors.foreground,
              boxShadow: showGlow ? `0 0 20px ${colors.foreground}` : undefined,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        ) : (
          <div
            className={cn('absolute left-0 top-0 h-full rounded-full transition-all', {
              'shadow-inner-glow': showGlow,
            })}
            style={{
              width: `${percentage}%`,
              backgroundColor: colors.foreground,
              boxShadow: showGlow ? `0 0 20px ${colors.foreground}` : undefined,
            }}
          />
        )}

        {/* Shimmer effect for animated progress */}
        {animated && percentage > 0 && percentage < 100 && (
          <div
            className="absolute inset-0 animate-shimmer opacity-30"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 255, 255, 0.4) 50%,
                transparent 100%
              )`,
              backgroundSize: '200% 100%',
            }}
          />
        )}

        {showLabel && labelPosition === 'inside' && height === 'lg' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-semibold mix-blend-difference text-white">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>

      {showLabel && labelPosition === 'outside' && (
        <div
          className="mt-1 text-xs sm:text-sm font-medium"
          style={{ color: 'var(--color-foreground-muted)' }}
        >
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}
