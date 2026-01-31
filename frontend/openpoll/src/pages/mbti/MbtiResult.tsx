import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Share2, Download, RotateCcw, Home } from 'lucide-react';
import { dosApi } from '@/api';
import type { DosResult, DosResultType } from '@/types/api.types';

export function MbtiResult() {
  const { type } = useParams<{ type: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [resultTypeInfo, setResultTypeInfo] = useState<DosResultType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get result data from navigation state (passed from MbtiTest)
  const resultData = location.state?.result as DosResult | undefined;

  useEffect(() => {
    const fetchResultType = async () => {
      if (!type) {
        navigate('/mbti');
        return;
      }

      try {
        const data = await dosApi.getResultType(type);
        setResultTypeInfo(data);
      } catch (error) {
        console.error('Failed to fetch result type:', error);
        // If API fails, redirect back to intro
        setTimeout(() => navigate('/mbti'), 2000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResultType();
  }, [type, navigate]);


  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-lg text-gray-400">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!resultTypeInfo) {
    return (
      <div className="min-h-screen bg-black text-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-400">결과를 찾을 수 없습니다.</p>
          <Link to="/mbti" className="mt-4 inline-block text-white hover:underline">
            돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // Parse traits from JSON string
  const traits = resultTypeInfo.traits ? JSON.parse(resultTypeInfo.traits) : [];

  // Prepare axis results from result data
  const axisResults = resultData ? [
    {
      label: '변화 인식',
      left: '안정',
      right: '변화',
      leftScore: Math.round(100 - resultData.axisPercentages.change),
      rightScore: Math.round(resultData.axisPercentages.change)
    },
    {
      label: '분배 인식',
      left: '경쟁',
      right: '평등',
      leftScore: Math.round(100 - resultData.axisPercentages.distribution),
      rightScore: Math.round(resultData.axisPercentages.distribution)
    },
    {
      label: '권리 인식',
      left: '자유',
      right: '규율',
      leftScore: Math.round(100 - resultData.axisPercentages.rights),
      rightScore: Math.round(resultData.axisPercentages.rights)
    },
    {
      label: '발전 인식',
      left: '환경',
      right: '개발',
      leftScore: Math.round(100 - resultData.axisPercentages.development),
      rightScore: Math.round(resultData.axisPercentages.development)
    },
  ] : [];

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Result Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-block mb-4 sm:mb-6 px-4 sm:px-6 py-1.5 sm:py-2 bg-white/10 rounded-full text-xs sm:text-sm font-semibold">
            당신의 정치 MBTI
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 tracking-tight">
            {type}
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-300 mb-4 sm:mb-6">
            {resultTypeInfo.name}
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
            {resultTypeInfo.description}
          </p>
        </motion.div>

        {/* Axes Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 mb-6 sm:mb-8"
        >
          <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">당신의 정치 좌표</h3>
          {resultData && axisResults.length > 0 ? (
            <div className="space-y-6 sm:space-y-8">
              {axisResults.map((axis, index) => (
                <motion.div
                  key={axis.label}
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
              ))}
            </div>
          ) : (
            <p className="text-gray-400">점수 데이터를 찾을 수 없습니다.</p>
          )}
        </motion.div>

        {/* Description Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 mb-6 sm:mb-8"
        >
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">📝 상세 설명</h3>
          {traits.length > 0 ? (
            <div className="text-gray-300 text-sm sm:text-base leading-relaxed space-y-3 sm:space-y-4">
              {traits.map((trait: string, index: number) => (
                <p key={index}>{trait}</p>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">상세 설명을 불러올 수 없습니다.</p>
          )}
        </motion.div>

        {/* Characteristics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">💡 주요 특징</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-300 text-sm sm:text-base">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>경제적 분배와 사회 안전망 확충에 관심</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>국가 주권과 독립성을 중요하게 생각</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>개인의 자유와 권리를 적극 옹호</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>급진적 변화보다는 점진적 개선 선호</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">🎯 관심 이슈</h3>
            <div className="flex flex-wrap gap-2">
              {['복지 정책', '노동권', '국방', '표현의 자유', '경제 정의', '교육'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-white/10 rounded-full text-xs sm:text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8"
        >
          <h3 className="font-bold text-yellow-500 mb-2 sm:mb-3 text-sm sm:text-base">⚠️ 참고사항</h3>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            이 결과는 특정 정당을 지지해야 한다는 의미가 아닙니다. 정치 성향은 다양한 요소로 구성되며,
            시간에 따라 변할 수 있습니다. 이 테스트는 자신의 정치적 위치를 이해하는 참고 자료로만 활용해주세요.
          </p>
        </motion.div>

        {/* Action Buttons */}
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

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <Link
            to="/mbti/test"
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
      </div>
    </div>
  );
}