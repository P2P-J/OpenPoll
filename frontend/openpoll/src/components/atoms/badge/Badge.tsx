import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-fg',
        primary: 'bg-primary text-primary-fg',
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-error',
        info: 'badge-info',
        outline: 'bg-transparent border border-default text-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs rounded',
        md: 'px-2.5 py-1 text-xs sm:text-sm rounded-full',
        lg: 'px-4 py-1.5 text-sm rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
