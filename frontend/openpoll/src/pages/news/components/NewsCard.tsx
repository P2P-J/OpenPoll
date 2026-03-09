import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ExternalLink, Sparkles } from "lucide-react";
import type { NewsArticle } from "@/types/api.types";
import { getTimeAgo } from "@/shared/utils/newsHelpers";
import { useTheme } from "@/contexts/ThemeContext";

interface NewsCardProps {
  news: NewsArticle;
  index: number;
  category: string;
}

export function NewsCard({ news, index, category }: NewsCardProps) {
  const { isDark } = useTheme();
  const summaryLines = useMemo(
    () => news.shortSummary.split("\n").filter((line) => line.trim()),
    [news.shortSummary]
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-3xl overflow-hidden border shadow-lg hover:shadow-xl transition-shadow p-8 sm:p-10 ${
        isDark
          ? 'bg-gray-900 border-gray-800'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="mb-6 sm:mb-7">
        <div className={`flex items-center justify-between pb-6 sm:pb-7 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 aspect-square shrink-0 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isDark ? '#e5e7eb' : '#1f2937' }}
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" style={{ color: isDark ? '#1f2937' : '#ffffff' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-black'}`}>{news.press}</span>
                <div className="w-4 h-4 min-w-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {getTimeAgo(news.createdAt)}
              </span>
            </div>
          </div>
          <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
            {category}
          </span>
        </div>
      </div>

      <Link to={`/news/${news.id}`} className="block">
        <div className="py-8 sm:py-9">
          <h2 className={`text-xl sm:text-2xl font-bold mb-6 sm:mb-7 leading-tight transition-colors ${
            isDark ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'
          }`}>
            {news.refinedTitle}
          </h2>

          <div className="space-y-3 mb-6 sm:mb-7">
            {summaryLines.map((line, i) => (
              <div key={i} className={`flex items-start gap-3 text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className={`font-bold text-lg flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} style={{ lineHeight: '1.625' }}>
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
                className={`text-sm sm:text-base font-medium hover:underline cursor-pointer ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div>
        <hr className={`border-t mb-6 sm:mb-7 ${isDark ? 'border-gray-800' : 'border-gray-100'}`} />
        <div className="flex gap-3">
          <Link
            to={`/news/${news.id}`}
            className={`flex-1 py-3 rounded-xl font-semibold text-base text-center transition-colors ${
              isDark
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            전문 보기
          </Link>
          <a
            href={news.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-6 py-3 rounded-xl font-semibold text-base transition-colors flex items-center justify-center space-x-2 ${
              isDark
                ? 'bg-gray-800 text-gray-100 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <span>원문</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
