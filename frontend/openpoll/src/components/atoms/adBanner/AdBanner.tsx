import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

export function AdBanner({ format = "auto", className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  return (
    <div
      className={`ad-container overflow-hidden ${className}`}
      role="complementary"
      aria-label="광고"
    >
      <span
        aria-hidden="true"
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 1.5,
          color: "var(--color-foreground-subtle)",
          marginBottom: 4,
          textTransform: "uppercase",
        }}
      >
        광고 · Ad
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5298926970289056"
        data-ad-slot="auto"
        data-ad-format={format}
        data-full-width-responsive="true"
        ref={adRef}
      />
    </div>
  );
}
