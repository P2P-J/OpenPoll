import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { Badge, Card } from '@/components/atoms';

export interface NewsCardProps {
  id: number;
  category: string;
  title: string;
  summary: string[];
  tags: string[];
  source: string;
  publishedAt: string;
  isNeutralized?: boolean;
  animationDelay?: number;
}

export function NewsCard({
  id,
  category,
  title,
  summary,
  tags,
  source,
  publishedAt,
  isNeutralized = true,
  animationDelay = 0,
}: NewsCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
    >
      <Card variant="gradient" hoverable className="shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Badge variant="default">{category}</Badge>
              {isNeutralized && (
                <div className="flex items-center space-x-1 text-blue-600 text-xs sm:text-sm font-semibold">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>AI 중립화</span>
                </div>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 leading-tight">
              {title}
            </h2>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2">
            📝 3줄 요약
          </h3>
          <ul className="space-y-1.5 sm:space-y-2">
            {summary.map((line, i) => (
              <li key={i} className="flex items-start text-gray-700 text-sm sm:text-base">
                <span className="mr-2 text-gray-400">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 sm:px-3 py-1 bg-gray-50 text-gray-600 text-xs sm:text-sm font-medium rounded-lg"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-100">
          <div className="text-xs sm:text-sm text-gray-500">
            {source} · {publishedAt}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link
              to={`/news/${id}`}
              className="px-4 py-2 bg-black text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-800 transition-colors text-center"
            >
              전문 보기
            </Link>
            <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-200 transition-colors">
              <span>원문 보기</span>
              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      </Card>
    </motion.article>
  );
}
