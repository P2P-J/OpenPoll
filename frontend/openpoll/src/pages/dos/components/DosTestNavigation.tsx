import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function LoadingState() {
  const { isDark } = useTheme();
  return (
    <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="text-center">
        <div className={`inline-block w-12 h-12 border-4 rounded-full animate-spin mb-4 ${isDark ? 'border-white/20 border-t-white' : 'border-black/20 border-t-black'}`} />
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>질문을 불러오는 중...</p>
      </div>
    </div>
  );
}

export function ProgressBar({ progress }: { progress: number }) {
  const { isDark } = useTheme();
  return (
    <div className={`fixed top-0 left-0 right-0 h-1 z-50 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
      <motion.div
        className={`h-full ${isDark ? 'bg-white' : 'bg-black'}`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

interface HeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
  onBack: () => void;
}

export function Header({
  currentQuestion,
  totalQuestions,
  progress,
  onBack,
}: HeaderProps) {
  const { isDark } = useTheme();
  return (
    <div className="pt-3 sm:pt-4 md:pt-6 pb-1 sm:pb-2 md:pb-3 px-4">
      <button
        onClick={onBack}
        className={`fixed top-4 sm:top-6 left-4 z-50 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-all backdrop-blur-sm shadow-lg group ${isDark ? 'bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20' : 'bg-black/10 hover:bg-black/20 border border-black/10 hover:border-black/20'}`}
        aria-label="테스트 나가기"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
          <span className={`text-xs sm:text-sm md:text-base font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {currentQuestion + 1} / {totalQuestions}
          </span>
        </div>
        <div className={`h-1.5 sm:h-2 rounded-full overflow-hidden max-w-3xl mx-auto ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
          <motion.div
            className={`h-full rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}

interface CarouselArrowsProps {
  currentQuestion: number;
  totalQuestions: number;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function CarouselArrows({
  currentQuestion,
  totalQuestions,
  canGoNext,
  onPrev,
  onNext,
}: CarouselArrowsProps) {
  const { isDark } = useTheme();
  const arrowClass = isDark
    ? 'bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20'
    : 'bg-black/10 hover:bg-black/20 border border-black/10 hover:border-black/20';
  return (
    <>
      {currentQuestion > 0 && (
        <button
          onClick={onPrev}
          className={`carousel-arrow carousel-arrow-left z-30 px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 rounded-2xl transition-all backdrop-blur-sm shadow-lg group ${arrowClass}`}
          aria-label="이전 질문"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}
      {currentQuestion < totalQuestions - 1 && (
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`carousel-arrow carousel-arrow-right z-30 px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 rounded-2xl transition-all disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-sm shadow-lg group ${arrowClass}`}
          aria-label="다음 질문"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </>
  );
}

interface NavigationButtonsProps {
  currentQuestion: number;
  totalQuestions: number;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function NavigationButtons({
  currentQuestion,
  totalQuestions,
  canGoNext,
  onPrev,
  onNext,
}: NavigationButtonsProps) {
  const { isDark } = useTheme();
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <div className="px-4 sm:px-6 pt-1 pb-2 sm:pb-4 shrink-0">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
          {currentQuestion > 0 ? (
            <button
              onClick={onPrev}
              className={`flex-1 py-3 sm:py-4 md:py-5 rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all flex items-center justify-center space-x-1 sm:space-x-2 shadow-lg group ${isDark ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/30' : 'bg-black/10 text-black hover:bg-black/20 border border-black/20 hover:border-black/30'}`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
              <span>이전</span>
            </button>
          ) : (
            <div className="flex-1" />
          )}

          <div className="px-3 sm:px-4 md:px-6">
            <span className="text-sm sm:text-base md:text-lg font-bold whitespace-nowrap">
              {currentQuestion + 1}/{totalQuestions}
            </span>
          </div>

          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={`flex-1 py-3 sm:py-4 md:py-5 rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 shadow-lg group ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'}`}
          >
            <span>{isLastQuestion ? "결과 보기" : "다음"}</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className={`text-center text-xs sm:text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>키보드 1-7 입력 답안 선택 · ←, → 다음 질문 이전 질문 이동</p>
        </div>
      </div>
    </div>
  );
}
