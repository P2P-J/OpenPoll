import prisma from '../../config/database.js';
import AppError from '../../utils/AppError.js';

import { ensureQueueReady, getQueue } from './jobs/queueWorker.js';
import { crawlPoliticsHeadlineUrls } from './jobs/crawler.js';
import { tryNewsRefreshGuard, releaseNewsRefreshLock } from './jobs/redisGuard.js';

const NEWS = {
  URL_MAX: 10,
  KEEP_LATEST: 50,
  WAIT_MS: 120_000,
};

export const refreshArticles = async () => {
  console.log('[NEWS_REFRESH_Start]', new Date().toISOString());

  const guard = await tryNewsRefreshGuard();
  if (!guard.ok) {
    const why = guard.reason === 0 ? 'COOLDOWN' : 'LOCKED';
    console.log(`[NEWS_REFRESH_Skip] ${why}`);
    return { skipped: true, reason: why };
  }

  try {
    await ensureQueueReady();

    const items = await crawlPoliticsHeadlineUrls(NEWS.URL_MAX);
    const { queue, queueEvents } = getQueue();

    const jobStart = process.hrtime.bigint();

    const jobs = [];
    for (const item of items) {
      const jobId = Buffer.from(item.naverUrl).toString('base64url');
      const job = await queue.add('crawling', item, {
        jobId,
        removeOnComplete: true,
        removeOnFail: true,
      });
      jobs.push(job);
    }

    try {
      await Promise.all(jobs.map((job) => job.waitUntilFinished(queueEvents, NEWS.WAIT_MS)));
    } catch (err) {
      const msg = err?.message || err?.failedReason || err?.cause?.message || String(err);

      if (msg === 'INVALID_TITLE' || msg === 'INVALID_BODY') throw AppError.badRequest('기사 파싱 실패');
      if (msg === 'AI_SUMMARY_FAILED') throw AppError.internal('AI 요약 생성 실패');
      throw err;
    }

    const keep = await prisma.article.findMany({
      select: { id: true },
      orderBy: { createdAt: 'desc' },
      take: NEWS.KEEP_LATEST,
    });

    const keepIds = keep.map((x) => x.id);
    if (keepIds.length > 0) {
      await prisma.article.deleteMany({
        where: { id: { notIn: keepIds } },
      });
    } else {
      console.warn('[NEWS_REFRESH_Failed] Skip cleanup deleteMany');
    }

    const jobFinish = process.hrtime.bigint();
    const jobTime = Number(jobFinish - jobStart) / 1e9;

    console.log(`[NEWS_REFRESH_Success] enqueue + work + delete done in ${jobTime.toFixed(2)}s`);
    
    return { enqueued: items.length, urls: items.map((i) => i.naverUrl) };
  } finally {
    await releaseNewsRefreshLock(guard.lockVal);
  }
};

export const getArticles = async () => {
  return prisma.article.findMany({ orderBy: { id: 'desc' } });
};