import { useEffect } from "react";

const SITE_NAME = "OpenPoll";

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - 열린 여론조사`;

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") ?? "";

    if (description && metaDesc) {
      metaDesc.setAttribute("content", description);
    }

    return () => {
      document.title = prev;
      if (description && metaDesc) {
        metaDesc.setAttribute("content", prevDesc);
      }
    };
  }, [title, description]);
}
