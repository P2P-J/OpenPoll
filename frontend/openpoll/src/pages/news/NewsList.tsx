import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ExternalLink, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { newsApi } from '@/api';
import type { NewsArticle } from '@/types/api.types';

const categories = ['전체', '경제', '외교', '국회', '선거', '사회'];

const ITEMS_PER_PAGE = 5;

// Helper function to get category from tags
const getCategoryFromTags = (tags: string[]): string => {
  const categoryMap: Record<string, string> = {
    '경제': '경제',
    '금리': '경제',
    '수출': '경제',
    '물가': '경제',
    '외교': '외교',
    '정상회담': '외교',
    '국제협력': '외교',
    '국회': '국회',
    '법안': '국회',
    '예산안': '국회',
    '선거': '선거',
    '투표': '선거',
    '여론조사': '선거',
    '사회': '사회',
    '복지': '사회',
    '교육': '사회',
    '민생': '국회',
    '개혁': '국회',
  };

  for (const tag of tags) {
    if (categoryMap[tag]) {
      return categoryMap[tag];
    }
  }
  return '사회'; // 기본값
};

// Helper function to format time ago
const getTimeAgo = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}시간 전`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}일 전`;
  }
};

interface NewsCardProps {
  news: NewsArticle;
  index: number;
  category: string;
}

function NewsCard({ news, index, category }: NewsCardProps) {
  const summaryLines = news.shortSummary.split('\n').filter(line => line.trim());

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-shadow"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base">{news.press}</span>
              <span className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </span>
            </div>
            <span className="text-sm text-gray-500">{getTimeAgo(news.createdAt)}</span>
          </div>
        </div>
        <span className="px-4 py-1.5 bg-black text-white text-sm font-bold rounded-full">
          {category}
        </span>
      </div>

      {/* Main Content Area */}
      <Link to={`/news/${news.id}`} className="block">
        <div className="px-6 sm:px-8 py-6 sm:py-7">
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 leading-tight hover:text-gray-600 transition-colors">
            {news.refinedTitle}
          </h2>

          {/* Summary */}
          <div className="space-y-3 mb-5">
            {summaryLines.map((line, i) => (
              <div key={i} className="flex items-start text-base text-gray-700">
                <span className="mr-3 text-gray-400 font-bold text-lg">·</span>
                <span className="leading-relaxed">{line}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {news.relatedTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-sm sm:text-base text-blue-600 font-medium hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="px-6 sm:px-8 py-4 border-t border-gray-100">
        <div className="flex gap-3">
          <Link
            to={`/news/${news.id}`}
            className="flex-1 py-3 bg-black text-white rounded-xl font-semibold text-base text-center hover:bg-gray-800 transition-colors"
          >
            전문 보기
          </Link>
          <a
            href={news.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold text-base hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <span>원문</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-xl border transition-all ${currentPage === 1
          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`min-w-[40px] h-10 px-3 rounded-xl font-semibold transition-all ${currentPage === page
              ? 'bg-black text-white shadow-lg'
              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
              }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-xl border transition-all ${currentPage === totalPages
          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export function NewsList() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch articles function
  const fetchArticles = async () => {
    try {
      const data = await newsApi.getArticles();
      setArticles(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      setError('뉴스를 불러오는데 실패했습니다.');
    }
  };

  // Refresh news (trigger crawling + fetch new articles)
  const refreshNews = async () => {
    try {
      console.log('[News Polling] Triggering news refresh...');
      await newsApi.refreshNews();
      console.log('[News Polling] Refresh complete, fetching articles...');
      await fetchArticles();
      console.log('[News Polling] Articles updated');
    } catch (err) {
      console.error('[News Polling] Failed to refresh news:', err);
      // Don't show error to user for background polling failures
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    const initialFetch = async () => {
      try {
        setIsLoading(true);
        await fetchArticles();
      } finally {
        setIsLoading(false);
      }
    };

    initialFetch();
  }, []);

  // Polling: refresh news every 30 seconds (for testing, change to 5 minutes in production)
  useEffect(() => {
    const POLLING_INTERVAL = 30 * 1000; // 30 seconds (테스트용)
    // const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes (프로덕션용)

    console.log('[News Polling] Starting polling with interval:', POLLING_INTERVAL / 1000, 'seconds');

    const intervalId = setInterval(() => {
      refreshNews();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => {
      console.log('[News Polling] Stopping polling');
      clearInterval(intervalId);
    };
  }, []);

  // Add category to each article based on tags
  const articlesWithCategory = articles.map(article => ({
    ...article,
    category: getCategoryFromTags(article.relatedTags),
  }));

  const filteredNews = selectedCategory === '전체'
    ? articlesWithCategory
    : articlesWithCategory.filter((news) => news.category === selectedCategory);

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentNews = filteredNews.slice(startIndex, endIndex);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">뉴스를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center justify-center space-x-2 mb-3">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">중립 뉴스</h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg">
            AI가 순화한 중립적이고 객관적인 정치 뉴스
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex overflow-x-auto space-x-3 mb-8 pb-2 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-bold text-base transition-all ${selectedCategory === category
                ? 'bg-black text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'
                }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* News Feed */}
        {currentNews.length > 0 ? (
          <>
            <div className="space-y-6 mb-8">
              {currentNews.map((news, index) => (
                <NewsCard key={news.id} news={news} index={index} category={news.category} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-12"
              >
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">해당 카테고리의 뉴스가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
