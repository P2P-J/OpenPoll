import { useMemo } from "react";
import { useNewsContext } from "@/contexts/NewsContext";
import type { NewsArticle } from "@/types/api.types";

export interface UseArticleDetailReturn {
  article: NewsArticle | null;
  isLoading: boolean;
  error: string | null;
}

export function useArticleDetail(id: string | undefined): UseArticleDetailReturn {
  const { articles, isLoading, error } = useNewsContext();

  const article = useMemo(() => {
    if (!id || articles.length === 0) return null;
    return articles.find((a) => a.id === parseInt(id)) || null;
  }, [id, articles]);

  const detailError = useMemo(() => {
    if (error) return error;
    if (!id) return "잘못된 접근입니다.";
    if (!isLoading && articles.length > 0 && !article) return "뉴스를 찾을 수 없습니다.";
    return null;
  }, [id, error, isLoading, articles, article]);

  return { article, isLoading, error: detailError };
}
