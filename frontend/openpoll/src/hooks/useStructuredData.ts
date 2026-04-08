import { useEffect, useRef } from "react";

export function useStructuredData(schema: Record<string, unknown> | null) {
  const serialized = schema ? JSON.stringify(schema) : null;
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!serialized) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = serialized;
    script.dataset.dynamic = "true";
    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
    };
  }, [serialized]);
}
