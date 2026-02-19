import axios from 'axios';
import { load } from 'cheerio';

export async function crawlPoliticsHeadlineUrls(urlMax) {
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