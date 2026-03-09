import { Fragment } from "react";

interface StatItem {
  label: string;
  value: string | number;
  suffix?: string;
}

interface StatsRowProps {
  items: StatItem[];
  className?: string;
}

export function StatsRow({ items, className = "" }: StatsRowProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && (
            <div
              className="w-px h-8 border-default bg-[var(--color-border)]"
            />
          )}
          <div className="flex-1 text-center">
            <p
              className="text-[11px] mb-0.5 text-foreground-muted"
            >
              {item.label}
            </p>
            <p className="text-base font-bold text-foreground">
              {typeof item.value === "number"
                ? item.value.toLocaleString()
                : item.value}
              {item.suffix && (
                <span
                  className="text-[11px] ml-0.5 font-medium text-foreground-muted"
                >
                  {item.suffix}
                </span>
              )}
            </p>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
