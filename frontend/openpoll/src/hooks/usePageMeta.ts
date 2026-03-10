import { useEffect } from "react";

const SITE_NAME = "OpenPoll";

function setMeta(selector: string, attr: string, value: string): string {
  const el = document.querySelector(selector);
  if (!el) return "";
  const prev = el.getAttribute(attr) ?? "";
  el.setAttribute(attr, value);
  return prev;
}

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - 열린 여론조사`;

    // document.title
    const prevTitle = document.title;
    document.title = fullTitle;

    // meta description
    const prevDesc = description ? setMeta('meta[name="description"]', "content", description) : "";

    // Open Graph
    const prevOgTitle = setMeta('meta[property="og:title"]', "content", fullTitle);
    const prevOgDesc = description ? setMeta('meta[property="og:description"]', "content", description) : "";
    const prevOgUrl = setMeta('meta[property="og:url"]', "content", window.location.href);

    // Twitter Card
    const prevTwTitle = setMeta('meta[name="twitter:title"]', "content", fullTitle);
    const prevTwDesc = description ? setMeta('meta[name="twitter:description"]', "content", description) : "";

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    const prevCanonical = canonical?.getAttribute("href") ?? "";
    canonical?.setAttribute("href", window.location.href);

    return () => {
      document.title = prevTitle;
      if (prevDesc) setMeta('meta[name="description"]', "content", prevDesc);
      if (prevOgTitle) setMeta('meta[property="og:title"]', "content", prevOgTitle);
      if (prevOgDesc) setMeta('meta[property="og:description"]', "content", prevOgDesc);
      if (prevOgUrl) setMeta('meta[property="og:url"]', "content", prevOgUrl);
      if (prevTwTitle) setMeta('meta[name="twitter:title"]', "content", prevTwTitle);
      if (prevTwDesc) setMeta('meta[name="twitter:description"]', "content", prevTwDesc);
      if (prevCanonical && canonical) canonical.setAttribute("href", prevCanonical);
    };
  }, [title, description]);
}
