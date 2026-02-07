import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ExternalLink, Sparkles } from "lucide-react";
import type { NewsArticle } from "@/types/api.types";
import { getTimeAgo } from "@/shared/utils/newsHelpers";

interface NewsCardProps {
  news: NewsArticle;
  index: number;
  category: string;
}

export function NewsCard({ news, index, category }: NewsCardProps) {
  const summaryLines = useMemo(
    () => news.shortSummary.split("\n").filter((line) => line.trim()),
    [news.shortSummary]
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow p-8 sm:p-10"
    >
      <div className="mb-6 sm:mb-7">
        <div className="flex items-center justify-between pb-6 sm:pb-7 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 min-w-14 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 rounded-full flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white dark:text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg dark:text-white">{news.press}</span>
                <div className="w-4 h-4 min-w-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getTimeAgo(news.createdAt)}
              </span>
            </div>
          </div>
          <span className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full">
            {category}
          </span>
        </div>
      </div>

      <Link to={`/news/${news.id}`} className="block">
        <div className="py-8 sm:py-9">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-7 leading-tight hover:text-gray-600 dark:hover:text-gray-300 dark:text-white transition-colors">
            {news.refinedTitle}
          </h2>

          <div className="space-y-3 mb-6 sm:mb-7">
            {summaryLines.map((line, i) => (
              <div key={i} className="flex items-start text-base text-gray-700 dark:text-gray-300">
                <span className="text-gray-400 dark:text-gray-600 font-bold text-lg mr-4">
                  ·
                </span>
                <span className="leading-relaxed">{line}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {news.relatedTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-sm sm:text-base text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div>
        <hr className="border-t border-gray-100 dark:border-gray-800 mb-6 sm:mb-7" />
        <div className="flex gap-3">
          <Link
            to={`/news/${news.id}`}
            className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-base text-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            전문 보기
          </Link>
          <a
            href={news.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl font-semibold text-base hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>원문</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
