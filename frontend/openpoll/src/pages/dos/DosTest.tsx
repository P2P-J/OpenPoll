import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { dosApi } from '@/api';
import type { DosQuestion } from '@/types/api.types';
import { Toast } from '@/components/molecules/toast/Toast';

// Swiper CSS
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import './DosTest.css';



const scaleLabels = [
  '전혀 그렇지 않다',
  '그렇지 않다',
  '약간 그렇지 않다',
  '보통이다',
  '약간 그렇다',
  '그렇다',
  '매우 그렇다',
];

export function DosTest() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<DosQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');
  const swiperRef = useRef<SwiperType | null>(null);

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await dosApi.getQuestions();
        // Fisher-Yates shuffle algorithm to randomize question order
        const shuffled = [...data];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setQuestions(shuffled);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        setToastMessage('질문을 불러오는데 실패했습니다');
        setToastType('error');
        setShowToast(true);
        setTimeout(() => navigate('/dos'), 2000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [navigate]);

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const canGoNext = questions.length > 0 && answers[questions[currentQuestion]?.id] !== undefined;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      swiperRef.current?.slideNext();
    } else {
      // Submit answers and calculate result
      setIsSubmitting(true);
      try {
        // Convert answers from frontend format (-3 to 3) to backend format (1 to 7)
        const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
          questionId: parseInt(questionId),
          score: value + 4, // -3 -> 1, -2 -> 2, ..., 0 -> 4, ..., 3 -> 7
        }));

        const result = await dosApi.calculateResult({ answers: formattedAnswers });

        // Navigate to result page with calculated type
        navigate(`/dos/result/${result.resultType}`, {
          state: { result }, // Pass result data to result page
        });
      } catch (error) {
        console.error('Failed to calculate result:', error);
        setToastMessage('결과 계산에 실패했습니다');
        setToastType('error');
        setShowToast(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      swiperRef.current?.slidePrev();
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentQuestion(swiper.activeIndex);
  };

  // 키보드 단축키 이벤트 리스너
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 질문이 로드되지 않았으면 무시
      if (!questions.length || currentQuestion >= questions.length) return;

      // 방향키로 질문 이동
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (canGoNext) {
          handleNext();
        }
      }
      // 숫자 1-7로 답변 선택
      else if (event.key >= '1' && event.key <= '7') {
        event.preventDefault();
        const numValue = parseInt(event.key);
        const answerValue = numValue - 4; // 1->-3, 2->-2, 3->-1, 4->0, 5->1, 6->2, 7->3
        handleAnswer(questions[currentQuestion].id, answerValue);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestion, canGoNext, answers, questions]);

  // 스크롤 잠금 (이 페이지에서만)
  useEffect(() => {
    // 페이지 진입 시 스크롤 잠금
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // 페이지 이탈 시 스크롤 복원
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // 페이지 로드 시 자동 포커스 (키보드 입력 활성화)
  useEffect(() => {
    // 로딩이 완료되고 질문이 있을 때만 포커스 설정
    if (!isLoading && questions.length > 0) {
      const focusableDiv = document.getElementById('dos-test-container');
      if (focusableDiv) {
        // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 포커스
        setTimeout(() => {
          focusableDiv.focus();
        }, 100);
      }
    }
  }, [isLoading, questions.length]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-lg text-gray-400">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="dos-test-container"
      tabIndex={0}
      className="h-screen bg-black text-white flex flex-col overflow-hidden outline-none"
    >
      {/* 프로그레스바 */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 헤더 */}
      <div className="pt-3 sm:pt-4 md:pt-6 pb-1 sm:pb-2 md:pb-3 px-4">
        <button
          onClick={() => navigate('/dos')}
          className="fixed top-4 sm:top-6 left-4 z-50 px-3 py-2.5 sm:px-4 sm:py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm border border-white/10 hover:border-white/20 shadow-lg group"
          aria-label="테스트 나가기"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
            <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-400">
              {currentQuestion + 1} / {questions.length}
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

      {/* 스와이퍼 캐러셀 */}
      <div className="flex-1 px-4 pt-4 sm:pt-6 md:pt-8 relative flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-6xl relative h-full">
          {/* Left Arrow - 선택된 카드 왼쪽에 위치 (첫 질문에서는 숨김) */}
          {currentQuestion > 0 && (
            <button
              onClick={handlePrev}
              className="carousel-arrow carousel-arrow-left z-30 px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 bg-white/10 hover:bg-white/20 rounded-2xl transition-all backdrop-blur-sm border border-white/10 hover:border-white/20 shadow-lg group"
              aria-label="이전 질문"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Right Arrow - 선택된 카드 오른쪽에 위치 (마지막 질문에서는 숨김) */}
          {currentQuestion < questions.length - 1 && (
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="carousel-arrow carousel-arrow-right z-30 px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 bg-white/10 hover:bg-white/20 rounded-2xl transition-all disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-sm border border-white/10 hover:border-white/20 shadow-lg group"
              aria-label="다음 질문"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

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
              breakpoints={{
                640: {
                  slidesPerView: 1.5,
                  coverflowEffect: {
                    stretch: -80,
                    depth: 220,
                  },
                },
                768: {
                  slidesPerView: 1.6,
                  coverflowEffect: {
                    stretch: -100,
                    depth: 240,
                  },
                },
                1024: {
                  slidesPerView: 1.7,
                  coverflowEffect: {
                    stretch: -120,
                    depth: 260,
                  },
                },
              }}
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

      {/* Navigation */}
      <div className="px-4 sm:px-6 pt-1 pb-2 sm:pb-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Previous / Counter / Next Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
            {/* Previous Button - 첫 질문에서는 숨김 */}
            {currentQuestion > 0 ? (
              <button
                onClick={handlePrev}
                className="flex-1 py-3 sm:py-4 md:py-5 bg-white/10 text-white rounded-2xl font-bold text-sm sm:text-base md:text-lg hover:bg-white/20 transition-all flex items-center justify-center space-x-1 sm:space-x-2 border border-white/20 hover:border-white/30 shadow-lg group"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
                <span>이전</span>
              </button>
            ) : (
              <div className="flex-1" /> /* 빈 공간 유지 */
            )}

            {/* Question Counter */}
            <div className="px-3 sm:px-4 md:px-6">
              <span className="text-sm sm:text-base md:text-lg font-bold whitespace-nowrap">
                {currentQuestion + 1}/{questions.length}
              </span>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="flex-1 py-3 sm:py-4 md:py-5 bg-white text-black rounded-2xl font-bold text-sm sm:text-base md:text-lg hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 shadow-lg group"
            >
              <span>{currentQuestion === questions.length - 1 ? '결과 보기' : '다음'}</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Keyboard Shortcuts Guide */}
          <div className="text-center text-xs sm:text-sm md:text-base text-gray-500">
            <p>키보드 1-7 입력 답안 선택 · ←, → 다음 질문 이전 질문 이동</p>
          </div>
        </div>
      </div>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

// 질문 카드 컴포넌트
function QuestionCard({
  question,
  answer,
  onAnswer,
  isActive,
}: {
  question: DosQuestion;
  answer: number | undefined;
  onAnswer: (questionId: number, value: number) => void;
  isActive: boolean;
}) {
  return (
    <div className="w-full h-full flex items-center justify-center px-2 sm:px-4">
      <div
        className={`question-card ${isActive ? 'question-card-active' : ''}`}
      >
        <h2 className="question-text">
          {question.question}
        </h2>

        {/* Scale */}
        <div className="answer-buttons-container">
          {scaleLabels.map((label, labelIndex) => {
            const value = labelIndex - 3; // -3 to 3
            const isSelected = answer === value;

            return (
              <button
                key={labelIndex}
                onClick={() => {
                  if (isActive) {
                    onAnswer(question.id, value);
                  }
                }}
                disabled={!isActive}
                className={`answer-button ${isSelected
                  ? 'answer-button-selected'
                  : 'answer-button-default'
                  } ${!isActive ? 'cursor-default' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="answer-label">
                    {label}
                  </span>
                  <div
                    className={`answer-radio ${isSelected
                      ? 'answer-radio-selected'
                      : 'answer-radio-default'
                      }`}
                  >
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
