import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  badge?: string;
  withDivider?: boolean;
}

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  centered,
  className = "",
  badge,
  withDivider,
}: SectionHeaderProps) {
  return (
    <div
      className={`${
        centered
          ? "flex flex-col items-center text-center gap-2"
          : "flex items-center gap-3"
      } ${withDivider ? "pb-5 mb-5 border-b border-default" : ""} ${className}`}
    >
      {Icon && !centered && (
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <Icon
            className="w-5 h-5 sm:w-6 sm:h-6"
            style={{ color: "var(--color-primary-foreground)" }}
          />
        </div>
      )}
      {Icon && centered && (
        <Icon
          className="w-7 h-7 sm:w-8 sm:h-8 text-foreground"
        />
      )}
      <div>
        <div className="flex items-center gap-2">
          <p
            className="font-bold text-base sm:text-lg text-foreground"
          >
            {title}
          </p>
          {badge && (
            <span
              className="px-3 py-1 text-xs font-bold rounded-full bg-primary text-primary-fg"
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p
            className="text-sm text-foreground-muted"
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
