import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ExternalLink, Sparkles, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { newsApi } from '@/api';
import type { NewsArticle } from '@/types/api.types';

const CATEGORY_TAG_MAP: Record<string, string> = {
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

const DEFAULT_CATEGORY = '사회';

interface UseArticleDetailReturn {
  article: NewsArticle | null;
  isLoading: boolean;
  error: string | null;
}

const getCategoryFromTags = (tags: string[]): string => {
  for (const tag of tags) {
    if (CATEGORY_TAG_MAP[tag]) {
      return CATEGORY_TAG_MAP[tag];
    }
  }
  return DEFAULT_CATEGORY;
};

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

const getTimeAgo = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }
  if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}시간 전`;
  }
  return `${Math.floor(diffInMinutes / 1440)}일 전`;
};

const useArticleDetail = (id: string | undefined): UseArticleDetailReturn => {
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

  return { article, isLoading, error };
};

function LoadingState() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600">뉴스를 불러오는 중...</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-4">{message}</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}

function BackButton() {
  return (
    <div className="px-4 sm:px-6 py-4">
      <Link
        to="/news"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="font-medium">뒤로</span>
      </Link>
    </div>
  );
}

function ArticleHeader({ press, createdAt, category }: { press: string; createdAt: string; category: string }) {
  return (
    <div className="mb-6 sm:mb-7">
      <div className="flex items-center justify-between pb-6 sm:pb-7 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div
            className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center"
            style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px' }}
          >
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{press}</span>
              <div
                className="rounded-full flex items-center justify-center"
                style={{ width: '16px', height: '16px', minWidth: '16px', backgroundColor: '#3b82f6' }}
              >
                <div className="rounded-full bg-white" style={{ width: '8px', height: '8px' }} />
              </div>
            </div>
            <span className="text-sm text-gray-500">{getTimeAgo(createdAt)}</span>
          </div>
        </div>
        <span className="px-4 py-1.5 bg-black text-white text-sm font-bold rounded-full">
          {category}
        </span>
      </div>
    </div>
  );
}

function AINotice() {
  return (
    <div className="bg-blue-50 rounded-2xl p-5 mb-8 border border-blue-100">
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
  );
}

function SummarySection({ shortSummary }: { shortSummary: string }) {
  const summaryLines = useMemo(
    () => shortSummary.split('\n').filter(line => line.trim()),
    [shortSummary]
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8 mb-8 border border-gray-200">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 flex items-center space-x-2">
        <span>핵심 요약</span>
      </h2>
      <div className="space-y-3">
        {summaryLines.map((line, index) => (
          <div key={index} className="flex items-start text-base sm:text-lg text-gray-800">
            <span className="text-gray-400 font-bold text-xl" style={{ marginRight: '16px' }}>·</span>
            <span className="leading-relaxed">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 pt-8 border-t border-gray-100 mb-8">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-sm sm:text-base text-blue-600 font-medium hover:underline cursor-pointer"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

function Timestamp({ createdAt }: { createdAt: string }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      <Clock className="w-4 h-4" />
      <span>{formatPublishedDate(createdAt)}</span>
    </div>
  );
}

function OriginalLinkButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center space-x-2 w-full py-4 sm:py-5 bg-black text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-800 transition-colors"
    >
      <span>원문 기사 보기</span>
      <ExternalLink className="w-5 h-5" />
    </a>
  );
}

const MARKDOWN_COMPONENTS: Components = {
  h3: ({ children }) => (
    <h3 className="text-xl sm:text-2xl font-bold mt-6 mb-4 text-gray-900">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-gray-800 leading-relaxed">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4 space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4 space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-gray-800 leading-relaxed">
      {children}
    </li>
  ),
};

export function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { article, isLoading, error } = useArticleDetail(id);

  const handleGoBack = useCallback(() => navigate('/news'), [navigate]);

  const category = useMemo(
    () => article ? getCategoryFromTags(article.relatedTags) : '',
    [article]
  );

  if (isLoading) return <LoadingState />;
  if (error || !article) return <ErrorState message={error || '뉴스를 찾을 수 없습니다.'} onBack={handleGoBack} />;

  return (
    <div className="pt-16 min-h-screen bg-gray-50 pb-12">
      <div className="max-w-3xl mx-auto">
        <BackButton />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden border border-gray-200 shadow-lg mx-4 sm:mx-0 p-8 sm:p-10"
        >
          <ArticleHeader press={article.press} createdAt={article.createdAt} category={category} />

          <div className="py-8 sm:py-9">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 leading-tight">
              {article.refinedTitle}
            </h1>

            <AINotice />

            <article className="prose prose-base sm:prose-lg max-w-none text-gray-800 mb-8">
              <ReactMarkdown components={MARKDOWN_COMPONENTS}>
                {article.refinedSummary}
              </ReactMarkdown>
            </article>

            <SummarySection shortSummary={article.shortSummary} />
            <TagList tags={article.relatedTags} />
            <Timestamp createdAt={article.createdAt} />
            <OriginalLinkButton url={article.originalUrl} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
