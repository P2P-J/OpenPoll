import { useState, useEffect } from "react";
import { newsApi } from "@/api";
import type { NewsArticle } from "@/types/api.types";

export interface UseArticleDetailReturn {
  article: NewsArticle | null;
  isLoading: boolean;
  error: string | null;
}

export function useArticleDetail(id: string | undefined): UseArticleDetailReturn {
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setError("잘못된 접근입니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await newsApi.getArticleById(parseInt(id));
        if (data) {
          setArticle(data);
          setError(null);
        } else {
          setError("뉴스를 찾을 수 없습니다.");
        }
      } catch {
        setError("뉴스를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  return { article, isLoading, error };
}
