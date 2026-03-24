import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { CATEGORIES } from "@/shared/utils/newsHelpers";
import { useNewsList, useTimeAgo } from "./hooks";
import {
  NewsCard,
  Pagination,
  NewsListLoadingState,
  NewsListErrorState,
  EmptyState,
} from "./components";
import { useTheme } from "@/contexts/ThemeContext";
import { AdBanner } from "@/components/atoms/adBanner/AdBanner";

export function NewsList() {
  usePageMeta("중립 뉴스", "AI가 순화한 중립적이고 객관적인 정치 뉴스를 읽어보세요.");
  const { isDark } = useTheme();
  const {
    selectedCategory,
    currentPage,
    currentNews,
    totalPages,
    isLoading,
    error,
    fetchedAt,
    handleCategoryChange,
    handlePageChange,
  } = useNewsList();

  const updatedAgo = useTimeAgo(fetchedAt);

  if (isLoading) return <NewsListLoadingState />;
  if (error) return <NewsListErrorState message={error} />;

  return (
    <div className={`pt-16 pb-24 sm:pb-0 min-h-screen bg-background`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center justify-center space-x-2 mb-3">
            <Sparkles className={`w-7 h-7 sm:w-8 sm:h-8 ${isDark ? 'text-white' : 'text-black'}`} />
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              중립 뉴스
            </h1>
          </div>
          <p className={`text-base sm:text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            AI가 순화한 중립적이고 객관적인 정치 뉴스
          </p>
        </motion.div>

        <motion.nav
          aria-label="뉴스 카테고리"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex overflow-x-auto space-x-3 mb-8 pb-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-bold text-base transition-all ${selectedCategory === category
                ? isDark
                  ? "bg-white text-black shadow-lg"
                  : "bg-black text-white shadow-lg"
                : isDark
                  ? "bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-500"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400"
                }`}
            >
              {category}
            </button>
          ))}
        </motion.nav>

        {updatedAgo && (
          <p className={`text-sm mb-6 -mt-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {updatedAgo}
          </p>
        )}

        <AdBanner className="mb-6" />

        {currentNews.length > 0 ? (
          <>
            <section aria-label="뉴스 목록" className="space-y-6 mb-8">
              {currentNews.map((news, index) => (
                <NewsCard
                  key={news.id}
                  news={news}
                  index={index}
                  category={news.category}
                />
              ))}
            </section>

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
          <EmptyState />
        )}
      </div>
    </div>
  );
}
