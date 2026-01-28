import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import './MbtiTest.css';

// Sample questions - in real app, this would be much longer
// stability 안정 change 변화 merit 경쟁 equality 평등 freedom 자유 order 규율 nature 환경 development 개발
const questions = [
  { id: 1, text: '개인의 노력과 성취에 따른 보상 차이는 사회에서 자연스러운 현상이라고 생각한다.', axis: 'merit' },
  { id: 2, text: '장기적인 자연 보존을 위해 개발 속도를 조절하는 것은 필요하다고 생각한다.', axis: 'nature' },
  { id: 3, text: '오랫동안 유지되어 온 방식에는 그만한 이유가 있다고 생각한다.', axis: 'stability' },
  { id: 4, text: '사회의 질서와 안전을 위해서는 일정 수준의 규율과 규제가 필요하다.', axis: 'order' },
  { id: 5, text: '새로운 시도와 변화는 사회를 더 나은 방향으로 이끈다고 느낀다.', axis: 'change' },
  { id: 6, text: '기술 발전과 경제 성장을 위해 일정 수준의 환경 변화는 감수할 수 있다.', axis: 'development' },
  { id: 7, text: '사회 구성원 간의 격차를 줄이는 것이 사회 안정에 중요하다.', axis: 'equality' },
  { id: 8, text: '개인의 선택과 자유는 사회 규범보다 우선 시 되어야 한다.', axis: 'freedom' },
  { id: 9, text: '급격한 변화보다는 점진적인 개선이 더 바람직하다고 생각한다.', axis: 'stability' },
  { id: 10, text: '환경이 훼손된 이후 복구하는 것보다, 처음부터 보존하는 편이 더 중요하다.', axis: 'nature' },
  { id: 11, text: '경제적 성과는 개인의 선택과 노력에 따라 달라지는 것이 당연하다.', axis: 'merit' },
  { id: 12, text: '공동의 안전을 위해 개인의 선택이 제한될 수 있다고 생각한다.', axis: 'order' },
  { id: 13, text: '기존의 방식을 과감히 바꾸는 것이 필요하다고 느끼는 경우가 많다.', axis: 'change' },
  { id: 14, text: '국가 경쟁력을 높이기 위해서는 기술 개발을 우선 시 해야 한다.', axis: 'development' },
  { id: 15, text: '기회와 자원은 사회 전체가 비교적으로 고르게 누릴 수 있어야 한다고 생각한다.', axis: 'equality' },
  { id: 16, text: '오래된 동네의 불편함이 있더라도, 그 분위기가 유지되는 것은 가치가 있다고 생각한다.', axis: 'stability' },
  { id: 17, text: '사람마다 다르게 행동하는 것보다는 일정한 기준이 있는 편이 사회에 도움이 된다.', axis: 'order' },
  { id: 18, text: '팀 프로젝트에서 결과가 뛰어난 사람이 더 많은 보상을 받는 것이 자연스럽다고 생각한다.', axis: 'merit' },
  { id: 19, text: '산림에 스키장을 조성하는 계획이 있다면, 자연 훼손이 일부 발생하더라도 지역 경제와 관광지 활성화를 위해 추진할 수 있다고 생각한다.', axis: 'development' },
  { id: 20, text: '정해진 규범보다는 개인의 사정이 더 중요하게 고려돼야 한다고 생각한다.', axis: 'freedom' },
  { id: 21, text: '새로운 기술이나 제도가 도입될 때, 완전히 자리 잡기 전까지는 기존 방식과 병행하는 편이 낫다.', axis: 'stability' },
  { id: 22, text: '운이 좋았던 사람과 그렇지 않았던 사람 사이의 결과 차이를 사회가 어느 정도 보완해주어야 한다.', axis: 'equality' },
  { id: 23, text: '익숙한 서비스가 전면 개편되었을 때, 적응하는 과정 자체가 사회 발전의 일부라고 생각한다.', axis: 'change' },
  { id: 24, text: '신기술을 도입해 사회가 발전할 수 있다면, 기존 자연 환경을 일부 바꾸는 것은 고려할 수 있다.', axis: 'development' },
  { id: 25, text: '공공장소에서 개인의 행동이 타인에게 불편함을 준다면 제한하는 것이 필요하다고 생각한다.', axis: 'order' },
  { id: 26, text: '나는 수익이 높은 사람에게 높은 세금을 부과해 소득을 재분배하려는 정책에 대해 긍정적으로 생각한다.', axis: 'equality' },
  { id: 27, text: '당장 혼란이 있더라도 장기적으로 더 나아질 수 있다면 변화를 선택할 가치가 있다고 느낀다.', axis: 'change' },
  { id: 28, text: '훼손된 자연을 복구하는 데 드는 비용을 고려하면, 처음부터 개발을 제한하는 편이 낫다고 생각한다.', axis: 'nature' },
  { id: 29, text: '안전벨트 필수 착용, 헬멧의 의무화 같은 교통 법규는 개인의 자유를 침해한다고 생각한다.', axis: 'freedom' },
  { id: 30, text: '입시 환경에서 지역에 따라 유리해지는 제도는 공정한 경쟁이 아니라고 생각한다.', axis: 'merit' },
  { id: 31, text: '아마존 열대 우림을 개발하는 것은 기술의 발전보다는 악영향이 훨씬 많을 것이라고 예상된다.', axis: 'nature' },
  { id: 32, text: '나는 학생의 두발 및 복장의 자유는 당연한 권리라고 생각한다.', axis: 'freedom' },
];

const scaleLabels = [
  '전혀 그렇지 않다',
  '그렇지 않다',
  '약간 그렇지 않다',
  '보통이다',
  '약간 그렇다',
  '그렇다',
  '매우 그렇다',
];

export function MbtiTest() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const swiperRef = useRef<SwiperType | null>(null);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const canGoNext = answers[questions[currentQuestion].id] !== undefined;

  const handleAnswer = (questionId: number, value: number) => {
    //setAnswers({ ...answers, [questionId]: value });
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // 입력 값 (특히 연속된 입력 값)이 많으면 이전 상태 기반 업데이트 방식이 더 안정적이라 해서 수정
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      swiperRef.current?.slideNext();
    } else {
      // Calculate result and navigate
      // 현재는 고정 이동 (추후 점수 계산 후 맞는 결과창으로 이동)
      navigate('/mbti/result/ENLA');
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
  }, [currentQuestion, canGoNext, answers]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div className="pt-16 sm:pt-20 pb-6 sm:pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-semibold text-gray-400">
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

      {/* Swiper Carousel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-visible">
        {/* Left Arrow - 선택된 카드 왼쪽에 위치 */}
        <button
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          className="carousel-arrow carousel-arrow-left z-20 p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-sm"
          aria-label="이전 질문"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Right Arrow - 선택된 카드 오른쪽에 위치 */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className="carousel-arrow carousel-arrow-right z-20 p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-sm"
          aria-label="다음 질문"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        <div className="w-full max-w-6xl">
          <Swiper
            modules={[EffectCoverflow]}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={handleSlideChange}
            effect="coverflow"
            grabCursor={false}
            centeredSlides={true}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 30,
              stretch: 0,
              depth: 200,
              modifier: 1,
              slideShadows: false,
            }}
            speed={600}
            allowTouchMove={false}
            className="mbti-swiper"
          >
            {questions.map((q) => (
              <SwiperSlide key={q.id} className="mbti-slide">
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

      {/* Navigation */}
      <div className="p-4 sm:p-6 pb-safe">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="w-full py-3 sm:py-4 bg-white text-black rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>{currentQuestion === questions.length - 1 ? '결과 보기' : '다음'}</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
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
  question: { id: number; text: string; axis: string };
  answer: number | undefined;
  onAnswer: (questionId: number, value: number) => void;
  isActive: boolean;
}) {
  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div
        className={`question-card ${isActive ? 'question-card-active' : ''}`}
      >
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 lg:mb-10 leading-relaxed text-center min-h-[4rem] sm:min-h-[5rem] flex items-center justify-center">
          {question.text}
        </h2>

        {/* Scale */}
        <div className="space-y-2 sm:space-y-3">
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
                className={`w-full p-3 sm:p-4 rounded-xl transition-all ${isSelected
                  ? 'bg-white text-black scale-105'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  } ${!isActive ? 'cursor-default' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm sm:text-base">
                    {label}
                  </span>
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all ${isSelected
                      ? 'bg-black border-black'
                      : 'border-white/30'
                      }`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-full h-full rounded-full bg-black flex items-center justify-center"
                      >
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
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