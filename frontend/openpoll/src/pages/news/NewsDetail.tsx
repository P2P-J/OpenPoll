import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ExternalLink, Sparkles, Clock } from 'lucide-react';
import { newsApi } from '@/api';
import type { NewsArticle } from '@/types/api.types';

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
  return '사회';
};

// Helper function to format published date
const formatPublishedDate = (createdAt: string): string => {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  return `${year}년 ${month}월 ${day}일 ${period} ${displayHours}시 ${minutes}분`;
};

// Helper function to get time ago
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

export function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setError('잘못된 접근입니다.');
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
          setError('뉴스를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError('뉴스를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

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

  if (error || !article) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '뉴스를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate('/news')}
            className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const category = getCategoryFromTags(article.relatedTags);

  return (
    <div className="pt-16 min-h-screen bg-gray-50 pb-12">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <div className="px-4 sm:px-6 py-4">
          <Link
            to="/news"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">뒤로</span>
          </Link>
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden border border-gray-200 shadow-lg mx-4 sm:mx-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base">{article.press}</span>
                  <span className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </span>
                </div>
                <span className="text-sm text-gray-500">{getTimeAgo(article.createdAt)}</span>
              </div>
            </div>
            <span className="px-4 py-1.5 bg-black text-white text-sm font-bold rounded-full">
              {category}
            </span>
          </div>

          {/* Article Content */}
          <div className="px-6 sm:px-8 py-6 sm:py-8">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-5 leading-tight">
              {article.refinedTitle}
            </h1>

            {/* AI Notice */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 mb-8 border border-blue-200/50">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm sm:text-base text-blue-900">
                  <p className="font-bold mb-2">AI 중립화 처리됨</p>
                  <p className="text-blue-800 leading-relaxed">
                    자극적인 표현은 순화되었으며, 객관적인 사실 중심으로 재구성되었습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Article Body */}
            <article className="prose prose-base sm:prose-lg max-w-none text-gray-800 mb-8">
              <div className="whitespace-pre-wrap leading-relaxed">
                {article.refinedSummary}
              </div>
            </article>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100 mb-6">
              {article.relatedTags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm sm:text-base text-blue-600 font-medium hover:underline cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Timestamp */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Clock className="w-4 h-4" />
              <span>{formatPublishedDate(article.createdAt)}</span>
            </div>

            {/* Original Link Button */}
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full py-3.5 bg-black text-white rounded-xl font-semibold text-base hover:bg-gray-800 transition-colors"
            >
              <span>원문 기사 보기</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
