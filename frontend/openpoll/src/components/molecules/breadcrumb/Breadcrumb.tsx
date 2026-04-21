import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useStructuredData } from "@/hooks/useStructuredData";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const ORIGIN = "https://www.openpoll.co.kr";

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: item.label,
        ...(item.href ? { item: `${ORIGIN}${item.href}` } : {}),
      })),
    }),
    [items],
  );

  useStructuredData(jsonLd);

  return (
    <nav
      aria-label="경로"
      className={`text-xs sm:text-sm text-foreground-muted ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${idx}-${item.label}`} className="flex items-center gap-1">
              {idx > 0 && (
                <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-60" aria-hidden="true" />
              )}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="hover:text-foreground transition-colors truncate max-w-[180px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-foreground font-medium truncate max-w-[220px] sm:max-w-none"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
