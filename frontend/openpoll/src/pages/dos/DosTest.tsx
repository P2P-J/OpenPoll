import { useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { dosApi } from "@/api";
import { Toast } from "@/components/molecules/toast/Toast";
import {
  useDosQuestions,
  useScrollLock,
  useAutoFocus,
  useKeyboardShortcuts,
  convertAnswerToBackendFormat,
} from "./hooks";
import type { ToastState } from "./hooks";
import {
  DosQuestionCard,
  DosTestLoadingState,
  ProgressBar,
  Header,
  CarouselArrows,
  NavigationButtons,
} from "./components";

import "swiper/swiper-bundle.css";
import "./DosTest.css";

const SWIPER_BREAKPOINTS = {
  640: { slidesPerView: 1.5, coverflowEffect: { stretch: -80, depth: 220 } },
  768: { slidesPerView: 1.6, coverflowEffect: { stretch: -100, depth: 240 } },
  1024: { slidesPerView: 1.7, coverflowEffect: { stretch: -120, depth: 260 } },
} as const;

export function DosTest() {
  usePageMeta("DOS 테스트 진행 중");
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "info",
  });
  const swiperRef = useRef<SwiperType | null>(null);

  const { questions, isLoading, showErrorToast } = useDosQuestions(
    navigate,
    setToast
  );

  useScrollLock();
  useAutoFocus(isLoading, questions.length > 0);

  const progress = useMemo(
    () =>
      questions.length > 0
        ? ((currentQuestion + 1) / questions.length) * 100
        : 0,
    [currentQuestion, questions.length]
  );

  const canGoNext = useMemo(
    () =>
      questions.length > 0 &&
      answers[questions[currentQuestion]?.id] !== undefined,
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
        const formattedAnswers = Object.entries(answers).map(
          ([questionId, value]) => ({
            questionId: parseInt(questionId),
            score: convertAnswerToBackendFormat(value),
          })
        );

        const result = await dosApi.calculateResult({
          answers: formattedAnswers,
        });
        navigate(`/dos/result/${result.resultType}`, { state: { result } });
      } catch {
        showErrorToast("결과 계산에 실패했습니다");
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [currentQuestion, questions.length, answers, navigate, showErrorToast]);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setCurrentQuestion(swiper.activeIndex);
  }, []);

  const handleBack = useCallback(() => navigate("/dos"), [navigate]);
  const handleCloseToast = useCallback(
    () => setToast((prev) => ({ ...prev, show: false })),
    []
  );

  useKeyboardShortcuts(
    questions,
    currentQuestion,
    canGoNext,
    handlePrev,
    handleNext,
    handleAnswer
  );

  if (isLoading) return <DosTestLoadingState />;

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
                    <DosQuestionCard
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
