import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2 } from 'lucide-react';
import { playSoundEffect } from '@/shared/utils/sound';

export interface VoteButtonProps {
  isSelected: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

export function VoteButton({
  isSelected,
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
}: VoteButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    // Create ripple effect
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = rippleIdRef.current++;

      setRipples((prev) => [...prev, { x, y, id }]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
      }, 600);
    }

    // Play sound effect
    playSoundEffect('vote');

    // Execute click handler
    onClick();
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        relative overflow-hidden
        px-3 sm:px-4 py-1.5 sm:py-2
        rounded-lg font-semibold text-xs sm:text-sm
        transition-all duration-200
        ${
          isSelected
            ? 'bg-white text-black shadow-lg'
            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileTap={!disabled && !isLoading ? { scale: 0.95 } : {}}
      whileHover={!disabled && !isLoading ? { scale: 1.05 } : {}}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/50 animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center space-x-1">
        {isLoading ? (
          <>
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            <span>투표중...</span>
          </>
        ) : isSelected ? (
          <>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.div>
            <span>투표완료</span>
          </>
        ) : (
          '투표하기 (5P)'
        )}
      </span>

      {/* Success pulse animation */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-lg"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  );
}
