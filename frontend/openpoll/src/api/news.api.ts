import { apiClient } from './client';
import type { NewsArticle, ApiResponse } from '@/types/api.types';

/**
 * 뉴스 목록 조회
 * GET /news/articles
 */
export const getArticles = async (): Promise<NewsArticle[]> => {
    const response = await apiClient.get<ApiResponse<NewsArticle[]>>('/news/articles', {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
        },
    });
    return response.data.data;
};
