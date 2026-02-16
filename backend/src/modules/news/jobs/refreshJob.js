import { refreshArticles } from '../news.service.js';

let timer = null;

export function startNewsRefreshJob({ intervalMs = 60_000 } = {}) {
  if (timer) return;

  timer = setInterval(() => {
    refreshArticles().catch((e) => {
      console.error('[NEWS_REFRESH_Interval_Failed]', e);
    });
  }, intervalMs);
}

export function stopNewsRefreshJob() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}
