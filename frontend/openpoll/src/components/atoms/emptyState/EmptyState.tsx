import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <Icon
          className="w-12 h-12 mx-auto mb-4 text-foreground-subtle"
        />
      )}
      <p
        className="font-semibold text-lg mb-1 text-foreground-muted"
      >
        {title}
      </p>
      {description && (
        <p
          className="text-sm text-foreground-subtle"
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors bg-primary text-primary-fg"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
