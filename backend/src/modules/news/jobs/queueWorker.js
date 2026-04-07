import axios from 'axios';
import { load } from 'cheerio';
import { Queue, Worker, QueueEvents } from 'bullmq';

import prisma from '../../../config/database.js';
import { bullRedis } from '../../../config/redis.js';
import { summarizeArticle } from '../ai/aiSummarize.js';

let queue;
let queueEvents;
let workerStarted = false;

export function getQueue() {
    if (!queue) {
        queue = new Queue('article', { connection: bullRedis, prefix: '{bull}' });
        queueEvents = new QueueEvents('article', { connection: bullRedis, prefix: '{bull}' });

        queueEvents.on('error', (err) => {
            console.error('[NEWS_QUEUEEVENTS_Error]', err);
        });
    }
    return { queue, queueEvents };
}

function startWorkerOnce() {
    if (workerStarted) return;
    workerStarted = true;

    const worker = new Worker(
        'article',
        async (job) => {
            const { naverUrl, press } = job.data;

            const res = await axios.get(naverUrl, {
                timeout: 15000,
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
                },
            });

            const $ = load(res.data);

            const title = $('h2#title_area').text().trim() || $('h2#title_area span').text().trim() || null;
            const body = $('article#dic_area').text().trim() || null;
            const originalUrl = $('a.media_end_head_origin_link').attr('href') || naverUrl;

            if (!title) throw new Error('INVALID_TITLE');
            if (!body || body.length < 100) throw new Error('INVALID_BODY');

            let summarizeAi;
            try {
                summarizeAi = await summarizeArticle(title, body);
            } catch {
                throw new Error('AI_SUMMARY_FAILED');
            }

            const h3 = (summarizeAi?.refinedSummary?.match(/^###\s/gm) || []).length;
            const isMarkdownOK =
                h3 >= 3 && h3 <= 4 && summarizeAi?.refinedSummary?.includes('\n\n');

            if (!isMarkdownOK) {
                summarizeAi.refinedSummary = `### 요약\n${summarizeAi.refinedSummary}`;
            }

            await prisma.article.upsert({
                where: { naverUrl },
                create: {
                    naverUrl,
                    originalUrl,
                    originalTitle: title,
                    refinedTitle: summarizeAi.refinedTitle,
                    refinedSummary: summarizeAi.refinedSummary,
                    shortSummary: summarizeAi.shortSummary,
                    relatedTags: summarizeAi.relatedTags,
                    press: press || null,
                },
                update: {
                    originalUrl,
                    originalTitle: title,
                    refinedTitle: summarizeAi.refinedTitle,
                    refinedSummary: summarizeAi.refinedSummary,
                    shortSummary: summarizeAi.shortSummary,
                    relatedTags: summarizeAi.relatedTags,
                    press: press || null,
                },
            });
        },
        {
            connection: bullRedis,
            prefix: '{bull}',
            concurrency: 3,
        }
    );

    worker.on('completed', (job) => {
        console.log('[NEWS_WORKER_Completed]', {
            jobId: job.id,
            naverUrl: job?.data?.naverUrl,
        });
    });

    worker.on('failed', (job, err) => {
        console.warn('[NEWS_WORKER_Failed]', {
            jobId: job.id,
            naverUrl: job?.data?.naverUrl,
            reason: err?.message || String(err),
        });
    });

    console.log('News Queue Worker started');
}

export async function ensureQueueReady() {
    const { queueEvents } = getQueue();
    await queueEvents.waitUntilReady();
    startWorkerOnce();
}