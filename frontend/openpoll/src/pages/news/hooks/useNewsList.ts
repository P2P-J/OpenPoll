import { useState, useEffect, useMemo, useCallback } from "react";
import { newsApi } from "@/api";
import type { NewsArticle } from "@/types/api.types";
import {
  ITEMS_PER_PAGE,
  getCategoryFromTags,
} from "@/shared/utils/newsHelpers";

export interface ArticleWithCategory extends NewsArticle {
  category: string;
}

export interface UseNewsArticlesReturn {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  fetchedAt: Date | null;
}

export function useNewsArticles(): UseNewsArticlesReturn {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      const data = await newsApi.getArticles();
      setArticles(data);
      setFetchedAt(new Date());
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

  return { articles, isLoading, error, fetchedAt };
}

/** fetchedAt으로부터 상대 시간 문자열을 계산하고 30초마다 갱신 */
export function useTimeAgo(date: Date | null): string {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!date) return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [date]);

  if (!date) return "";

  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "방금 업데이트";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전 업데이트`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}시간 전 업데이트`;
}

export interface UseNewsListReturn {
  selectedCategory: string;
  currentPage: number;
  currentNews: ArticleWithCategory[];
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchedAt: Date | null;
  handleCategoryChange: (category: string) => void;
  handlePageChange: (page: number) => void;
}

export function useNewsList(): UseNewsListReturn {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const { articles, isLoading, error, fetchedAt } = useNewsArticles();

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
    fetchedAt,
    handleCategoryChange,
    handlePageChange,
  };
}
