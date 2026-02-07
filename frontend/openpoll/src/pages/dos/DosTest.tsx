import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { dosApi } from '@/api';
import type { DosQuestion } from '@/types/api.types';
import { Toast } from '@/components/molecules/toast/Toast';

import 'swiper/swiper-bundle.css';
import './DosTest.css';

const SCALE_LABELS = [
  '전혀 그렇지 않다',
  '그렇지 않다',
  '약간 그렇지 않다',
  '보통이다',
  '약간 그렇다',
  '그렇다',
  '매우 그렇다',
] as const;

const ERROR_REDIRECT_DELAY_MS = 2000;
const FOCUS_DELAY_MS = 100;

const SWIPER_BREAKPOINTS = {
  640: { slidesPerView: 1.5, coverflowEffect: { stretch: -80, depth: 220 } },
  768: { slidesPerView: 1.6, coverflowEffect: { stretch: -100, depth: 240 } },
  1024: { slidesPerView: 1.7, coverflowEffect: { stretch: -120, depth: 260 } },
} as const;

interface ToastState {
  show: boolean;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface QuestionCardProps {
  question: DosQuestion;
  answer: number | undefined;
  onAnswer: (questionId: number, value: number) => void;
  isActive: boolean;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const convertAnswerToBackendFormat = (value: number): number => value + 4;

interface UseDosQuestionsReturn {
  questions: DosQuestion[];
  isLoading: boolean;
  showErrorToast: (message: string) => void;
}

const useDosQuestions = (
  navigate: ReturnType<typeof useNavigate>,
  setToast: (state: ToastState) => void
): UseDosQuestionsReturn => {
  const [questions, setQuestions] = useState<DosQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const showErrorToast = useCallback((message: string) => {
    setToast({ show: true, message, type: 'error' });
  }, [setToast]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await dosApi.getQuestions();
        setQuestions(shuffleArray(data));
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        showErrorToast('질문을 불러오는데 실패했습니다');
        setTimeout(() => navigate('/dos'), ERROR_REDIRECT_DELAY_MS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [navigate, showErrorToast]);

  return { questions, isLoading, showErrorToast };
};

const useScrollLock = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);
};

const useAutoFocus = (isLoading: boolean, hasQuestions: boolean) => {
  useEffect(() => {
    if (!isLoading && hasQuestions) {
      const focusableDiv = document.getElementById('dos-test-container');
      if (focusableDiv) {
        setTimeout(() => focusableDiv.focus(), FOCUS_DELAY_MS);
      }
    }
  }, [isLoading, hasQuestions]);
};

const useKeyboardShortcuts = (
  questions: DosQuestion[],
  currentQuestion: number,
  canGoNext: boolean,
  handlePrev: () => void,
  handleNext: () => void,
  handleAnswer: (questionId: number, value: number) => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!questions.length || currentQuestion >= questions.length) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (canGoNext) handleNext();
      } else if (event.key >= '1' && event.key <= '7') {
        event.preventDefault();
        const answerValue = parseInt(event.key) - 4;
        handleAnswer(questions[currentQuestion].id, answerValue);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, canGoNext, questions, handlePrev, handleNext, handleAnswer]);
};

function LoadingState() {
  return (
    <div className="h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-lg text-gray-400">질문을 불러오는 중...</p>
      </div>
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
      <motion.div
        className="h-full bg-white"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

function Header({
  currentQuestion,
  totalQuestions,
  progress,
  onBack,
}: {
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
  onBack: () => void;
}) {
  return (
    <div className="pt-3 sm:pt-4 md:pt-6 pb-1 sm:pb-2 md:pb-3 px-4">
      <button
        onClick={onBack}
        className="fixed top-4 sm:top-6 left-4 z-50 px-3 py-2.5 sm:px-4 sm:py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm border border-white/10 hover:border-white/20 shadow-lg group"
        aria-label="테스트 나가기"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
          <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-400">
            {currentQuestion + 1} / {totalQuestions}
          </span>
        </div>
        <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden max-w-3xl mx-auto">
          <motion.div
            className="h-full bg-white rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}

function CarouselArrows({
  currentQuestion,
  totalQuestions,
  canGoNext,
  onPrev,
  onNext,
}: {
  currentQuestion: number;
  totalQuestions: number;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <>
      {currentQuestion > 0 && (
        <button
          onClick={onPrev}
          className="carousel-arrow carousel-arrow-left z-30 px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 bg-white/10 hover:bg-white/20 rounded-2xl transition-all backdrop-blur-sm border border-white/10 hover:border-white/20 shadow-lg group"
          aria-label="이전 질문"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}
      {currentQuestion < totalQuestions - 1 && (
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="carousel-arrow carousel-arrow-right z-30 px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 bg-white/10 hover:bg-white/20 rounded-2xl transition-all disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-sm border border-white/10 hover:border-white/20 shadow-lg group"
          aria-label="다음 질문"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </>
  );
}

function NavigationButtons({
  currentQuestion,
  totalQuestions,
  canGoNext,
  onPrev,
  onNext,
}: {
  currentQuestion: number;
  totalQuestions: number;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <div className="px-4 sm:px-6 pt-1 pb-2 sm:pb-4 shrink-0">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
          {currentQuestion > 0 ? (
            <button
              onClick={onPrev}
              className="flex-1 py-3 sm:py-4 md:py-5 bg-white/10 text-white rounded-2xl font-bold text-sm sm:text-base md:text-lg hover:bg-white/20 transition-all flex items-center justify-center space-x-1 sm:space-x-2 border border-white/20 hover:border-white/30 shadow-lg group"
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
            className="flex-1 py-3 sm:py-4 md:py-5 bg-white text-black rounded-2xl font-bold text-sm sm:text-base md:text-lg hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 shadow-lg group"
          >
            <span>{isLastQuestion ? '결과 보기' : '다음'}</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="text-center text-xs sm:text-sm md:text-base text-gray-500">
          <p>키보드 1-7 입력 답안 선택 · ←, → 다음 질문 이전 질문 이동</p>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ question, answer, onAnswer, isActive }: QuestionCardProps) {
  return (
    <div className="w-full h-full flex items-center justify-center px-2 sm:px-4">
      <div className={`question-card ${isActive ? 'question-card-active' : ''}`}>
        <h2 className="question-text">{question.question}</h2>

        <div className="answer-buttons-container">
          {SCALE_LABELS.map((label, labelIndex) => {
            const value = labelIndex - 3;
            const isSelected = answer === value;

            return (
              <button
                key={labelIndex}
                onClick={() => isActive && onAnswer(question.id, value)}
                disabled={!isActive}
                className={`answer-button ${isSelected ? 'answer-button-selected' : 'answer-button-default'} ${!isActive ? 'cursor-default' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="answer-label">{label}</span>
                  <div className={`answer-radio ${isSelected ? 'answer-radio-selected' : 'answer-radio-default'}`}>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-full h-full rounded-full bg-black flex items-center justify-center"
                      >
                        <div className="answer-radio-dot" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function DosTest() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const swiperRef = useRef<SwiperType | null>(null);

  const { questions, isLoading, showErrorToast } = useDosQuestions(navigate, setToast);

  useScrollLock();
  useAutoFocus(isLoading, questions.length > 0);

  const progress = useMemo(
    () => questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0,
    [currentQuestion, questions.length]
  );

  const canGoNext = useMemo(
    () => questions.length > 0 && answers[questions[currentQuestion]?.id] !== undefined,
    [questions, currentQuestion, answers]
  );

  const handleAnswer = useCallback((questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handlePrev = useCallback(() => {
    if (currentQuestion > 0) {
      swiperRef.current?.slidePrev();
    }
  }, [currentQuestion]);

  const handleNext = useCallback(async () => {
    if (currentQuestion < questions.length - 1) {
      swiperRef.current?.slideNext();
    } else {
      setIsSubmitting(true);
      try {
        const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
          questionId: parseInt(questionId),
          score: convertAnswerToBackendFormat(value),
        }));

        const result = await dosApi.calculateResult({ answers: formattedAnswers });
        navigate(`/dos/result/${result.resultType}`, { state: { result } });
      } catch (error) {
        console.error('Failed to calculate result:', error);
        showErrorToast('결과 계산에 실패했습니다');
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [currentQuestion, questions.length, answers, navigate, showErrorToast]);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setCurrentQuestion(swiper.activeIndex);
  }, []);

  const handleBack = useCallback(() => navigate('/dos'), [navigate]);
  const handleCloseToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

  useKeyboardShortcuts(questions, currentQuestion, canGoNext, handlePrev, handleNext, handleAnswer);

  if (isLoading) return <LoadingState />;

  return (
    <div
      id="dos-test-container"
      tabIndex={0}
      className="h-screen bg-black text-white flex flex-col overflow-hidden outline-none"
    >
      <ProgressBar progress={progress} />
      <Header
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        progress={progress}
        onBack={handleBack}
      />

      <div className="flex-1 px-4 pt-4 sm:pt-6 md:pt-8 relative flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-6xl relative h-full">
          <CarouselArrows
            currentQuestion={currentQuestion}
            totalQuestions={questions.length}
            canGoNext={canGoNext}
            onPrev={handlePrev}
            onNext={handleNext}
          />

          <div className="w-full h-full">
            <Swiper
              modules={[EffectCoverflow]}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              onSlideChange={handleSlideChange}
              effect="coverflow"
              grabCursor={false}
              centeredSlides={true}
              slidesPerView={1.4}
              coverflowEffect={{
                rotate: 0,
                stretch: -60,
                depth: 200,
                modifier: 1,
                slideShadows: false,
              }}
              speed={600}
              allowTouchMove={false}
              className="dos-swiper"
              breakpoints={SWIPER_BREAKPOINTS}
            >
              {questions.map((q) => (
                <SwiperSlide key={q.id} className="dos-slide">
                  {({ isActive }) => (
                    <QuestionCard
                      question={q}
                      answer={answers[q.id]}
                      onAnswer={handleAnswer}
                      isActive={isActive}
                    />
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      <NavigationButtons
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        canGoNext={canGoNext}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={handleCloseToast}
      />
    </div>
  );
}
