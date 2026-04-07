import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ExternalLink, Sparkles, Clock, ArrowRight, Shield, Newspaper } from "lucide-react";
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
        <Shield className={`w-6 h-6 mt-0.5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <div className={`text-sm sm:text-base ${isDark ? 'text-blue-100' : 'text-blue-900'}`}>
          <p className="font-bold mb-2">AI 중립화 처리됨</p>
          <p className={`leading-relaxed ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
            이 기사는 OpenPoll AI가 원본 뉴스의 자극적·편향적 표현을 제거하고,
            객관적 사실만을 중심으로 재구성한 콘텐츠입니다.
            원본 기사의 의견, 추측, 감정적 표현은 모두 순화되었습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

interface NeutralityAnalysisProps {
  originalTitle: string | null;
  refinedTitle: string;
}

export function NeutralityAnalysis({ originalTitle, refinedTitle }: NeutralityAnalysisProps) {
  const { isDark } = useTheme();

  return (
    <div className={`rounded-2xl p-6 sm:p-8 mb-8 border ${
      isDark
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
    }`}>
      <h2 className={`text-lg sm:text-xl font-bold mb-5 flex items-center space-x-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        <Sparkles className="w-5 h-5" style={{ color: isDark ? '#60a5fa' : '#2563eb' }} />
        <span>중립도 분석</span>
      </h2>

      {originalTitle && originalTitle !== refinedTitle && (
        <div className="mb-6">
          <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            제목 중립화 비교
          </p>
          <div className="space-y-3">
            <div className={`rounded-xl p-4 border ${isDark ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50 border-red-100'}`}>
              <p className={`text-xs font-bold mb-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>원본 제목</p>
              <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-red-200' : 'text-red-900'}`}
                 style={{ textDecoration: 'line-through', opacity: 0.8 }}>
                {originalTitle}
              </p>
            </div>
            <div className="flex justify-center">
              <ArrowRight className={`w-5 h-5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} style={{ transform: 'rotate(90deg)' }} />
            </div>
            <div className={`rounded-xl p-4 border ${isDark ? 'bg-green-950/20 border-green-900/30' : 'bg-green-50 border-green-100'}`}>
              <p className={`text-xs font-bold mb-1.5 ${isDark ? 'text-green-400' : 'text-green-600'}`}>중립화된 제목</p>
              <p className={`text-sm sm:text-base leading-relaxed font-medium ${isDark ? 'text-green-200' : 'text-green-900'}`}>
                {refinedTitle}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`rounded-xl p-4 border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          OpenPoll 중립화 처리 과정
        </p>
        <div className="space-y-2.5">
          {[
            { step: '1', text: '네이버 뉴스에서 원본 기사를 수집합니다.' },
            { step: '2', text: '자극적·선정적 표현과 편향된 어조를 감지합니다.' },
            { step: '3', text: '의견·추측·감정 표현을 제거하고 사실만 추출합니다.' },
            { step: '4', text: '객관적이고 중립적인 어조로 기사를 재구성합니다.' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: isDark ? '#1e40af' : '#dbeafe',
                  color: isDark ? '#93c5fd' : '#1e40af',
                }}
              >
                {step}
              </span>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className={`text-xs mt-4 leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        OpenPoll은 특정 정치적 입장을 지지하거나 반대하지 않습니다.
        모든 기사는 AI를 통해 동일한 기준으로 중립화 처리됩니다.
      </p>
    </div>
  );
}

interface SourceAttributionProps {
  press: string;
  originalUrl: string;
  naverUrl: string;
  createdAt: string;
}

export function SourceAttribution({ press, originalUrl, naverUrl, createdAt }: SourceAttributionProps) {
  const { isDark } = useTheme();

  return (
    <div className={`rounded-2xl p-6 mb-8 border ${
      isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
    }`}>
      <h3 className={`text-base font-bold mb-4 flex items-center space-x-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        <Newspaper className="w-5 h-5" />
        <span>출처 정보</span>
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>언론사</span>
          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{press}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>발행일</span>
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{formatPublishedDate(createdAt)}</span>
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <a
          href={originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2 ${
            isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          <span>원문 기사</span>
          <ExternalLink className="w-4 h-4" />
        </a>
        <a
          href={naverUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2 ${
            isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          <span>네이버 뉴스</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <p className={`text-xs mt-4 leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        이 콘텐츠는 {press}의 원본 기사를 바탕으로 OpenPoll AI가 중립적 관점에서
        재구성한 것입니다. 원본 기사의 저작권은 해당 언론사에 있습니다.
      </p>
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
