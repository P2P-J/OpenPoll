import { type InputHTMLAttributes, forwardRef, useId } from "react";
import type { LucideIcon } from "lucide-react";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  inputSize?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, icon: Icon, inputSize = "md", className = "", ...props },
    ref,
  ) => {
    const id = useId();

    const baseSizeClasses = {
      sm: "pl-3 py-2 text-sm",
      md: "pl-4 py-3 text-base",
      lg: "pl-5 py-4 text-lg",
    };

    const defaultRightPad = {
      sm: "pr-3",
      md: "pr-4",
      lg: "pr-5",
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold mb-2 text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-foreground-muted"
            />
          )}
          <input
            id={id}
            ref={ref}
            className={`w-full rounded-xl border border-default transition-colors outline-none focus:ring-2 bg-surface text-foreground placeholder:text-foreground-subtle focus:ring-[var(--color-primary)]/20 focus:border-hover ${baseSizeClasses[inputSize]} ${
              Icon ? "pr-11" : defaultRightPad[inputSize]
            } ${
              error
                ? "border-red-500 focus:ring-red-500/30"
                : ""
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p
            className="mt-1.5 text-sm text-error"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
