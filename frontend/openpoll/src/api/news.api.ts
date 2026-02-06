import { apiClient } from './client';
import type { NewsArticle, ApiResponse } from '@/types/api.types';

/**
 * 뉴스 목록 조회
 * GET /news/articles
 */
export const getArticles = async (): Promise<NewsArticle[]> => {
    const response = await apiClient.get<ApiResponse<NewsArticle[]>>('/news/articles');
    return response.data.data;
};

/**
 * 뉴스 상세 조회 (ID로 필터링)
 */
export const getArticleById = async (id: number): Promise<NewsArticle | null> => {
    const articles = await getArticles();
    return articles.find(article => article.id === id) || null;
};

/**
 * 뉴스 새로고침 (크롤링 트리거)
 * POST /news/refresh
 */
export const refreshNews = async (): Promise<{ enqueued: number; urls: string[] }> => {
    const response = await apiClient.post<ApiResponse<{ enqueued: number; urls: string[] }>>('/news/refresh');
    return response.data.data;
};
