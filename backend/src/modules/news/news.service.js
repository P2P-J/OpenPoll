import axios from 'axios';
import { load } from 'cheerio';
import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

import prisma from '../../config/database.js';
import { summarizeArticle } from './AI/aiSummarize.js';
import AppError from '../../utils/AppError.js';

// ---- BullMQ (ioredis 전용) ----
let bullConnection;
let queue;
let queueEvents;
let workerStarted = false;

function getBullConnection() {
    if (!bullConnection) {
        bullConnection = new IORedis(process.env.REDIS_URL, {
            maxRetriesPerRequest: null,
        });
    }
    return bullConnection;
}

function getQueue() {
    if (!queue) {
        queue = new Queue('article', { connection: getBullConnection(), prefix : '{bull}' });
        queueEvents = new QueueEvents('article', { connection: getBullConnection(), prefix : '{bull}' });
    }
    return { queue, queueEvents };
}

function startWorkerOnce() {
    if (workerStarted) return;
    workerStarted = true;

    new Worker('article', async (job) => {
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
        } catch (err) {
            throw new Error('AI_SUMMARY_FAILED');
        }

        function isMarkdownOK(s) {
            const h3 = (s?.match(/^###\s/gm) || []).length;
            return h3 >= 3 && h3 <= 4 && s.includes("\n\n");
        }

        if (!isMarkdownOK(summarizeAi.refinedSummary)) {
            summarizeAi.refinedSummary = `### 요약\n${summarizeAi.refinedSummary}`;
        }

        await prisma.article.upsert({
            where: { naverUrl },
            create: {
                naverUrl,
                originalUrl,
                refinedTitle: summarizeAi.refinedTitle,
                refinedSummary: summarizeAi.refinedSummary,
                shortSummary: summarizeAi.shortSummary,
                relatedTags: summarizeAi.relatedTags, // String[]
                press: press || null,
            },
            update: {
                originalUrl,
                refinedTitle: summarizeAi.refinedTitle,
                refinedSummary: summarizeAi.refinedSummary,
                shortSummary: summarizeAi.shortSummary,
                relatedTags: summarizeAi.relatedTags,
                press: press || null,
            },
        });
    },
        {
            connection: getBullConnection(),
            prefix : '{bull}',
            concurrency: 3,
            removeOnComplete: { count: 200 },
            removeOnFail: { count: 200 },
        }
    );

    console.log('News Queue Worker started');
}

async function ensureQueueReady() {
    const { queueEvents } = getQueue();
    await queueEvents.waitUntilReady();
    startWorkerOnce();
}

async function crawlPoliticsHeadlineUrls(urlMax) {
    const url = 'https://news.naver.com/section/100';
    const res = await axios.get(url, { timeout: 15000 });
    const $ = load(res.data);

    const items = [];
    const urls = new Set();

    $('ul[id^="_SECTION_HEADLINE_LIST"] li.sa_item._SECTION_HEADLINE').each((_, li) => {
        const href = $(li).find('a.sa_text_title[href]').attr('href');

        if (!href || !href.startsWith('https://n.news.naver.com/mnews/article/')) return;

        const naverUrl = href.split('#')[0].trim();
        if (urls.has(naverUrl)) return;

        const press = $(li).find('.sa_text_press').first().text().trim() || null;

        urls.add(naverUrl);
        items.push({ naverUrl, press });

        if (items.length >= urlMax) return false;
    });

    return items;
}

export const refreshArticles = async () => {
    await ensureQueueReady();

    const urlMax = 10;
    const items = await crawlPoliticsHeadlineUrls(urlMax);

    const { queue, queueEvents } = getQueue();

    const jobStart = process.hrtime.bigint();

    const jobs = [];
    for (const item of items) {
        const jobId = Buffer.from(item.naverUrl).toString('base64url');
        const job = await queue.add('crawling', item, { jobId });
        jobs.push(job);
    }

    try {
        await Promise.all(jobs.map(job => job.waitUntilFinished(queueEvents, 60000)));
    } catch (err) {
        const msg = err?.message || err?.failedReason || err?.cause?.message || String(err);

        if (msg === 'INVALID_TITLE' || msg === 'INVALID_BODY') {
            throw AppError.badRequest('기사 파싱 실패');
        }
        if (msg === 'AI_SUMMARY_FAILED') {
            throw AppError.internal('AI 요약 생성 실패');
        }
        throw err;
    }


    const keep = await prisma.article.findMany({
        select: { id: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
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

    return { enqueued: items.length, urls: items.map(i => i.naverUrl) };
};

export const getArticles = async () => {
    const articles = await prisma.article.findMany({
        orderBy: { id: 'desc' },
    });

    return articles;
};
