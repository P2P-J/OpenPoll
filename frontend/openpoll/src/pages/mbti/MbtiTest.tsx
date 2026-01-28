import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Sample questions - in real app, this would be much longer
const questions = [
  { id: 1, text: '경제 성장을 위해서는 기업에 대한 규제를 줄여야 한다', axis: 'economic' },
  { id: 2, text: '모든 국민에게 기본소득을 지급해야 한다', axis: 'economic' },
  { id: 3, text: '국가 안보는 국제 협력보다 우선되어야 한다', axis: 'diplomatic' },
  { id: 4, text: '이민자 수용을 확대해야 한다', axis: 'diplomatic' },
  { id: 5, text: '정부는 시민의 표현의 자유를 최대한 보장해야 한다', axis: 'civil' },
  { id: 6, text: '공공 안전을 위해서는 일부 자유를 제한할 수 있다', axis: 'civil' },
  { id: 7, text: '전통적인 가족 가치를 보존하는 것이 중요하다', axis: 'social' },
  { id: 8, text: '사회는 지속적으로 변화하고 진보해야 한다', axis: 'social' },
  // ... 28 more questions would go here
];

const scaleLabels = [
  '매우 반대',
  '반대',
  '약간 반대',
  '중립',
  '약간 찬성',
  '찬성',
  '매우 찬성',
];

export function MbtiTest() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [direction, setDirection] = useState(0);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const canGoNext = answers[questions[currentQuestion].id] !== undefined;

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setDirection(1);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result and navigate
      navigate('/mbti/result/ENLA');
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const question = questions[currentQuestion];
  const currentAnswer = answers[question.id];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && currentQuestion > 0) {
        handlePrev();
      }
      if (e.key === 'ArrowRight' && canGoNext) {
        handleNext();
      }
      // Number keys 1-7 for quick selection
      if (e.key >= '1' && e.key <= '7') {
        const index = parseInt(e.key) - 1;
        handleAnswer(index - 3); // Convert to -3 to 3 scale
      }
      // Enter key to proceed
      if (e.key === 'Enter' && canGoNext) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, canGoNext, handleNext, handlePrev, handleAnswer]);

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
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <span className="text-xs sm:text-sm font-semibold text-gray-400">
              {currentQuestion + 1} / {questions.length}
            </span>
            <div className="w-9 sm:w-10" /> {/* Spacer */}
          </div>
          <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-3xl w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h1 id="question-text" className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 lg:mb-16 leading-relaxed px-2">
                {question.text}
              </h1>

              {/* Scale */}
              <div className="space-y-2 sm:space-y-3 max-w-2xl mx-auto">
                {scaleLabels.map((label, index) => {
                  const value = index - 3; // -3 to 3
                  const isSelected = currentAnswer === value;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(value)}
                      className={`w-full p-3 sm:p-4 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-white text-black scale-105'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm sm:text-base">{label}</span>
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all ${
                          isSelected
                            ? 'bg-black border-black'
                            : 'border-white/30'
                        }`}>
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 sm:p-6 pb-safe">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative group">
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="w-full py-3 sm:py-4 bg-white text-black rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              aria-label={!canGoNext ? '답변을 선택해주세요' : undefined}
            >
              <span>{currentQuestion === questions.length - 1 ? '결과 보기' : '다음'}</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </button>
            {/* Tooltip for disabled button */}
            {!canGoNext && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                답변을 선택해주세요
              </div>
            )}
          </div>
          {/* Keyboard shortcuts hint */}
          <p className="text-center text-xs text-white/50 mt-3">
            키보드: 1-7 (선택), ← → (이동), Enter (다음)
          </p>
        </div>
      </div>
    </div>
  );
}