import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Share2, Download, RotateCcw, Home } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { dosApi } from "@/api";
import type { DosResult as DosResultData, DosResultType } from "@/types/api.types";
import { dosResultTypes } from "@/constants/dosResultTypes";

const ERROR_REDIRECT_DELAY_MS = 2000;

interface AxisResult {
  label: string;
  left: string;
  right: string;
  leftScore: number;
  rightScore: number;
}

interface UseResultDataReturn {
  resultTypeInfo: DosResultType | null;
  isLoading: boolean;
}

const useResultData = (
  type: string | undefined,
  navigate: ReturnType<typeof useNavigate>
): UseResultDataReturn => {
  const [resultTypeInfo, setResultTypeInfo] = useState<DosResultType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResultType = async () => {
      if (!type) {
        navigate("/dos");
        return;
      }

      try {
        const data = await dosApi.getResultType(type);
        setResultTypeInfo(data);
      } catch (error) {
        console.error("Failed to fetch result type:", error);
        setTimeout(() => navigate("/dos"), ERROR_REDIRECT_DELAY_MS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResultType();
  }, [type, navigate]);

  return { resultTypeInfo, isLoading };
};

const createAxisResults = (resultData: DosResultData | undefined): AxisResult[] => {
  if (!resultData) return [];

  return [
    {
      label: "변화 인식",
      left: "안정",
      right: "변화",
      leftScore: Math.round(100 - resultData.axisPercentages.change),
      rightScore: Math.round(resultData.axisPercentages.change),
    },
    {
      label: "분배 인식",
      left: "경쟁",
      right: "평등",
      leftScore: Math.round(100 - resultData.axisPercentages.distribution),
      rightScore: Math.round(resultData.axisPercentages.distribution),
    },
    {
      label: "권리 인식",
      left: "자유",
      right: "규율",
      leftScore: Math.round(100 - resultData.axisPercentages.rights),
      rightScore: Math.round(resultData.axisPercentages.rights),
    },
    {
      label: "발전 인식",
      left: "환경",
      right: "개발",
      leftScore: Math.round(100 - resultData.axisPercentages.development),
      rightScore: Math.round(resultData.axisPercentages.development),
    },
  ];
};

const MARKDOWN_COMPONENTS: Components = {
  p: ({ children }) => <p className="mb-3 sm:mb-4 text-gray-300">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 text-gray-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 sm:space-y-2 ml-2 text-gray-300">{children}</ol>
  ),
  li: ({ children }) => <li className="text-gray-300">{children}</li>,
  h1: ({ children }) => (
    <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg sm:text-xl font-bold mb-2 mt-4 text-white">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-white">{children}</h3>
  ),
  code: ({ children }) => (
    <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-gray-200">{children}</code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-white/20 pl-4 italic text-gray-400 my-2">{children}</blockquote>
  ),
  hr: () => (
    <hr className="my-4 sm:my-6 border-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  ),
};

function LoadingState() {
  return (
    <div className="min-h-screen bg-black text-white pt-16 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-lg text-gray-400">결과를 불러오는 중...</p>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-screen bg-black text-white pt-16 flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-gray-400">결과를 찾을 수 없습니다.</p>
        <Link to="/dos" className="mt-4 inline-block text-white hover:underline">
          돌아가기
        </Link>
      </div>
    </div>
  );
}

function ResultHeader({ type, name, description }: { type: string; name: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8 sm:mb-12"
    >
      <div className="inline-block mb-4 sm:mb-6 px-4 sm:px-6 py-1.5 sm:py-2 bg-white/10 rounded-full text-xs sm:text-sm font-semibold">
        당신의 DOS 유형
      </div>
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 tracking-tight">
        {type}
      </h1>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-300 mb-4 sm:mb-6">{name}</h2>
      <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
        {description}
      </p>
    </motion.div>
  );
}

function AxisResultItem({ axis, index }: { axis: AxisResult; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 gap-1">
        <span className="font-semibold text-base sm:text-lg">{axis.label}</span>
        <span className="text-xs sm:text-sm text-gray-400">
          {axis.left} {axis.leftScore}% · {axis.rightScore}% {axis.right}
        </span>
      </div>
      <div className="relative h-6 sm:h-8 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${axis.leftScore}%` }}
          transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
        />
        <div className="absolute inset-0 flex items-center justify-between px-3 sm:px-4">
          <span className="text-xs sm:text-sm font-semibold relative z-10 mix-blend-difference">
            {axis.left}
          </span>
          <span className="text-xs sm:text-sm font-semibold relative z-10 mix-blend-difference">
            {axis.right}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function AxesResultsSection({ axisResults, hasData }: { axisResults: AxisResult[]; hasData: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 mb-6 sm:mb-8"
    >
      <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">당신의 정치 좌표</h3>
      {hasData && axisResults.length > 0 ? (
        <div className="space-y-6 sm:space-y-8">
          {axisResults.map((axis, index) => (
            <AxisResultItem key={axis.label} axis={axis} index={index} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400">점수 데이터를 찾을 수 없습니다.</p>
      )}
    </motion.div>
  );
}

function DescriptionSection({ detail }: { detail: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 mb-6 sm:mb-8"
    >
      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">📝 상세 설명</h3>
      {detail.length > 0 ? (
        <div className="text-gray-300 text-sm sm:text-base leading-relaxed space-y-3 sm:space-y-4">
          {detail.map((section, index) => (
            <div key={index} className="markdown-content">
              <ReactMarkdown components={MARKDOWN_COMPONENTS}>{section}</ReactMarkdown>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">상세 설명을 불러올 수 없습니다.</p>
      )}
    </motion.div>
  );
}

function CharacteristicsSection({ features, tags }: { features: string[]; tags: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
    >
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">💡 주요 특징</h3>
        <ul className="space-y-1.5 sm:space-y-2 text-gray-300 text-sm sm:text-base">
          {features.length > 0 ? (
            features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{feature}</span>
              </li>
            ))
          ) : (
            <li className="text-gray-400">주요 특징을 불러올 수 없습니다.</li>
          )}
        </ul>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">🎯 관심 이슈</h3>
        <div className="flex flex-wrap gap-2">
          {tags.length > 0 ? (
            tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-white/10 rounded-full text-xs sm:text-sm font-medium"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">관심 이슈를 불러올 수 없습니다.</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function NoticeSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8"
    >
      <h3 className="font-bold text-yellow-500 mb-2 sm:mb-3 text-sm sm:text-base">⚠️ 참고사항</h3>
      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
        이 결과는 특정 정당을 지지해야 한다는 의미가 아닙니다. 정치 성향은 다양한 요소로 구성되며, 시간에 따라 변할 수 있습니다.
        이 테스트는 자신의 정치적 위치를 이해하는 참고 자료로만 활용해주세요.
      </p>
    </motion.div>
  );
}

function ActionButtons() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8"
    >
      <button className="flex items-center justify-center space-x-2 px-6 py-3 sm:py-4 bg-white text-black rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-100 transition-colors">
        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>결과 공유하기</span>
      </button>
      <button className="flex items-center justify-center space-x-2 px-6 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/20 transition-colors">
        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>이미지 저장</span>
      </button>
    </motion.div>
  );
}

function NavigationLinks() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="flex flex-col sm:flex-row gap-3 sm:gap-4"
    >
      <Link
        to="/dos/test"
        className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/10 transition-colors"
      >
        <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>다시 테스트하기</span>
      </Link>
      <Link
        to="/"
        className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/10 transition-colors"
      >
        <Home className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>홈으로 돌아가기</span>
      </Link>
    </motion.div>
  );
}

export function DosResult() {
  const { type } = useParams<{ type: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { resultTypeInfo, isLoading } = useResultData(type, navigate);

  const resultData = location.state?.result as DosResultData | undefined;

  const localResultData = useMemo(
    () => dosResultTypes.find((rt) => rt.id === type),
    [type]
  );

  const { detail, features, tags } = useMemo(() => ({
    detail: localResultData?.detail || [],
    features: localResultData?.features || [],
    tags: localResultData?.tag || [],
  }), [localResultData]);

  const axisResults = useMemo(() => createAxisResults(resultData), [resultData]);

  if (isLoading) return <LoadingState />;
  if (!resultTypeInfo) return <ErrorState />;

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <ResultHeader
          type={type || ""}
          name={resultTypeInfo.name}
          description={resultTypeInfo.description}
        />
        <AxesResultsSection axisResults={axisResults} hasData={!!resultData} />
        <DescriptionSection detail={detail} />
        <CharacteristicsSection features={features} tags={tags} />
        <NoticeSection />
        <ActionButtons />
        <NavigationLinks />
      </div>
    </div>
  );
}
