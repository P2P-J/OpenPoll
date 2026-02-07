import { useState, useEffect, useMemo, useCallback } from "react";
import { newsApi } from "@/api";
import type { NewsArticle } from "@/types/api.types";
import {
  ITEMS_PER_PAGE,
  POLLING_INTERVAL_MS,
  getCategoryFromTags,
} from "@/shared/utils/newsHelpers";

export interface ArticleWithCategory extends NewsArticle {
  category: string;
}

export interface UseNewsArticlesReturn {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
}

export function useNewsArticles(): UseNewsArticlesReturn {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      const data = await newsApi.getArticles();
      setArticles(data);
      setError(null);
    } catch {
      setError("뉴스를 불러오는데 실패했습니다.");
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      await fetchArticles();
      setIsLoading(false);
    };
    initialFetch();
  }, [fetchArticles]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      newsApi.refreshNews().catch(() => {});
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  return { articles, isLoading, error };
}

export interface UseNewsListReturn {
  selectedCategory: string;
  currentPage: number;
  currentNews: ArticleWithCategory[];
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  handleCategoryChange: (category: string) => void;
  handlePageChange: (page: number) => void;
}

export function useNewsList(): UseNewsListReturn {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const { articles, isLoading, error } = useNewsArticles();

  const articlesWithCategory = useMemo<ArticleWithCategory[]>(
    () =>
      articles.map((article) => ({
        ...article,
        category: getCategoryFromTags(article.relatedTags),
      })),
    [articles]
  );

  const filteredNews = useMemo(
    () =>
      selectedCategory === "전체"
        ? articlesWithCategory
        : articlesWithCategory.filter(
            (news) => news.category === selectedCategory
          ),
    [articlesWithCategory, selectedCategory]
  );

  const { totalPages, currentNews } = useMemo(() => {
    const total = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const current = filteredNews.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    return { totalPages: total, currentNews: current };
  }, [filteredNews, currentPage]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return {
    selectedCategory,
    currentPage,
    currentNews,
    totalPages,
    isLoading,
    error,
    handleCategoryChange,
    handlePageChange,
  };
}
