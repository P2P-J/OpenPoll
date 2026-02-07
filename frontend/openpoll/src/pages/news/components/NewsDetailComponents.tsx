import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ExternalLink, Sparkles, Clock } from "lucide-react";
import { getTimeAgo, formatPublishedDate } from "@/shared/utils/newsHelpers";

export function DetailLoadingState() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse dark:text-white" />
        <p className="text-gray-600 dark:text-gray-400">뉴스를 불러오는 중...</p>
      </div>
    </div>
  );
}

export function DetailErrorState({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{message}</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export function BackButton() {
  return (
    <div className="px-4 sm:px-6 py-4">
      <Link
        to="/news"
        className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="font-medium">뒤로</span>
      </Link>
    </div>
  );
}

interface ArticleHeaderProps {
  press: string;
  createdAt: string;
  category: string;
}

export function ArticleHeader({ press, createdAt, category }: ArticleHeaderProps) {
  return (
    <div className="mb-6 sm:mb-7">
      <div className="flex items-center justify-between pb-6 sm:pb-7 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 min-w-14 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 rounded-full flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white dark:text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg dark:text-white">{press}</span>
              <div className="w-4 h-4 min-w-4 rounded-full bg-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getTimeAgo(createdAt)}
            </span>
          </div>
        </div>
        <span className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full">
          {category}
        </span>
      </div>
    </div>
  );
}

export function AINotice() {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-5 mb-8 border border-blue-100 dark:border-blue-900/50">
      <div className="flex items-start space-x-3">
        <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm sm:text-base text-blue-900 dark:text-blue-100">
          <p className="font-bold mb-2">AI 중립화 처리됨</p>
          <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
            자극적인 표현은 순화되었으며, 객관적인 사실 중심으로
            재구성되었습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SummarySection({ shortSummary }: { shortSummary: string }) {
  const summaryLines = useMemo(
    () => shortSummary.split("\n").filter((line) => line.trim()),
    [shortSummary]
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 rounded-2xl p-6 sm:p-8 mb-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center space-x-2">
        <span>핵심 요약</span>
      </h2>
      <div className="space-y-3">
        {summaryLines.map((line, index) => (
          <div
            key={index}
            className="flex items-start text-base sm:text-lg text-gray-800 dark:text-gray-200"
          >
            <span className="text-gray-400 dark:text-gray-600 font-bold text-xl mr-4">
              ·
            </span>
            <span className="leading-relaxed">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 pt-8 border-t border-gray-100 dark:border-gray-800 mb-8">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-sm sm:text-base text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

export function Timestamp({ createdAt }: { createdAt: string }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
      <Clock className="w-4 h-4" />
      <span>{formatPublishedDate(createdAt)}</span>
    </div>
  );
}

export function OriginalLinkButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center space-x-2 w-full py-4 sm:py-5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
    >
      <span>원문 기사 보기</span>
      <ExternalLink className="w-5 h-5" />
    </a>
  );
}
