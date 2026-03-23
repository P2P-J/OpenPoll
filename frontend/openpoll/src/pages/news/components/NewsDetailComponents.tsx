import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ExternalLink, Sparkles, Clock } from "lucide-react";
import { getTimeAgo, formatPublishedDate } from "@/shared/utils/newsHelpers";
import { useTheme } from "@/contexts/ThemeContext";

export function DetailLoadingState() {
  const { isDark } = useTheme();
  return (
    <div className={`pt-16 min-h-screen flex items-center justify-center bg-background`}>
      <div className="text-center">
        <Sparkles className={`w-12 h-12 mx-auto mb-4 animate-pulse ${isDark ? 'text-white' : 'text-black'}`} />
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>뉴스를 불러오는 중...</p>
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
  const { isDark } = useTheme();
  return (
    <div className={`pt-16 min-h-screen flex items-center justify-center bg-background`}>
      <div className="text-center">
        <p className={`mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{message}</p>
        <button
          onClick={onBack}
          className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
            isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export function BackButton() {
  const { isDark } = useTheme();
  return (
    <div className="px-4 sm:px-6 py-4">
      <Link
        to="/news"
        className={`inline-flex items-center space-x-2 transition-colors ${
          isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
        }`}
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
  const { isDark } = useTheme();
  return (
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
              <span className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-black'}`}>{press}</span>
              <div className="w-4 h-4 min-w-4 rounded-full bg-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {getTimeAgo(createdAt)}
            </span>
          </div>
        </div>
        <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
          {category}
        </span>
      </div>
    </div>
  );
}

export function AINotice() {
  const { isDark } = useTheme();
  return (
    <div className={`rounded-2xl p-5 mb-8 border ${
      isDark ? 'bg-blue-950/30 border-blue-900/50' : 'bg-blue-50 border-blue-100'
    }`}>
      <div className="flex items-start space-x-3">
        <Sparkles className={`w-6 h-6 mt-0.5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <div className={`text-sm sm:text-base ${isDark ? 'text-blue-100' : 'text-blue-900'}`}>
          <p className="font-bold mb-2">AI 중립화 처리됨</p>
          <p className={`leading-relaxed ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
            자극적인 표현은 순화되었으며, 객관적인 사실 중심으로
            재구성되었습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SummarySection({ shortSummary }: { shortSummary: string }) {
  const { isDark } = useTheme();
  const summaryLines = useMemo(
    () => shortSummary.split("\n").filter((line) => line.trim()),
    [shortSummary]
  );

  return (
    <div className={`rounded-2xl p-6 sm:p-8 mb-8 border ${
      isDark
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
    }`}>
      <h2 className={`text-lg sm:text-xl font-bold mb-4 flex items-center space-x-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        <span>핵심 요약</span>
      </h2>
      <div className="space-y-3">
        {summaryLines.map((line, index) => (
          <div
            key={index}
            className={`flex items-start text-base sm:text-lg ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
          >
            <span className={`font-bold text-xl mr-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
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
  const { isDark } = useTheme();
  return (
    <div className={`flex flex-wrap gap-2 pt-8 border-t mb-8 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className={`text-sm sm:text-base font-medium hover:underline cursor-pointer ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

export function Timestamp({ createdAt }: { createdAt: string }) {
  const { isDark } = useTheme();
  return (
    <div className={`flex items-center space-x-2 text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
      <Clock className="w-4 h-4" />
      <span>{formatPublishedDate(createdAt)}</span>
    </div>
  );
}

export function OriginalLinkButton({ url }: { url: string }) {
  const { isDark } = useTheme();
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center space-x-2 w-full py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg transition-colors ${
        isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
      }`}
    >
      <span>원문 기사 보기</span>
      <ExternalLink className="w-5 h-5" />
    </a>
  );
}
