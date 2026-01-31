import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold relative overflow-hidden button-press focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all',
  {
    variants: {
      variant: {
        primary: [
          'text-white shadow-smooth hover-lift',
          'bg-gradient-primary',
          'hover:shadow-primary',
        ].join(' '),
        secondary: [
          'border-2',
          'hover-lift',
        ].join(' '),
        ghost: [
          'bg-transparent',
          'hover:shadow-sm',
        ].join(' '),
        outline: [
          'bg-transparent border-2',
          'hover-lift',
        ].join(' '),
        danger: [
          'text-white shadow-smooth hover-lift',
          'hover:shadow-error',
        ].join(' '),
        success: [
          'text-white shadow-smooth hover-lift',
          'hover:shadow-success',
        ].join(' '),
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        icon: 'p-2',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      rounded: {
        default: '',
        sm: 'rounded-lg',
        md: 'rounded-xl',
        lg: 'rounded-2xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      rounded: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, rounded, isLoading, children, disabled, ...props }, ref) => {
    // Generate dynamic styles based on variant
    const getVariantStyles = () => {
      switch (variant) {
        case 'secondary':
          return {
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-secondary-foreground)',
            borderColor: 'var(--color-border)',
          };
        case 'ghost':
          return {
            color: 'var(--color-foreground-muted)',
            backgroundColor: 'transparent',
          };
        case 'outline':
          return {
            borderColor: 'var(--color-border)',
            color: 'var(--color-foreground)',
            backgroundColor: 'transparent',
          };
        case 'danger':
          return {
            backgroundColor: 'var(--color-error)',
          };
        case 'success':
          return {
            backgroundColor: 'var(--color-success)',
          };
        default:
          return {};
      }
    };

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, rounded }), className)}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-label={isLoading ? '로딩중' : undefined}
        style={{
          ...getVariantStyles(),
          transitionDuration: 'var(--duration-fast)',
          transitionTimingFunction: 'var(--ease-out)',
        }}
        {...props}
      >
        {/* Shine effect on hover */}
        <span className="absolute inset-0 hover-shine pointer-events-none" aria-hidden="true" />

        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>로딩중...</span>
            </>
          ) : (
            children
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
