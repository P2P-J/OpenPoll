import { memo, useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "OpenPoll은 어떤 서비스인가요?",
    answer:
      "OpenPoll은 정치 성향 테스트(DOS), AI 중립 뉴스, 밸런스 게임, 정당 지지율 투표를 제공하는 열린 여론조사 플랫폼입니다. 정치에 쉽고 재미있게 참여할 수 있도록 다양한 콘텐츠를 제공합니다.",
  },
  {
    question: "DOS 테스트는 무엇인가요?",
    answer:
      "DOS(Democracy Orientation Scale) 테스트는 32개의 질문을 통해 나의 정치적 좌표를 분석하는 테스트입니다. 변화, 분배, 권리, 발전의 4가지 축을 기반으로 16가지 정치 성향 유형 중 자신에게 맞는 유형을 찾아줍니다. 약 10분 소요되며, 결과를 친구와 공유할 수 있습니다.",
  },
  {
    question: "AI 중립 뉴스는 어떻게 만들어지나요?",
    answer:
      "AI가 국내 언론사의 정치 뉴스에서 자극적·편향적 표현을 자동 감지하여 제거하고, 사실 중심으로 기사를 재구성합니다. 의견, 추측, 감정적 표현은 모두 순화되며, 원본 기사 출처를 항상 명시합니다. 중립화 과정은 투명하게 공개됩니다.",
  },
  {
    question: "OpenPoll은 특정 정당을 지지하나요?",
    answer:
      "아니요. OpenPoll은 어떤 정당이나 정치적 입장도 지지하지 않습니다. 모든 콘텐츠는 중립성과 객관성을 최우선 원칙으로 제작되며, 사용자가 스스로 판단할 수 있는 환경을 제공하는 것이 목표입니다.",
  },
  {
    question: "포인트는 어떻게 사용하나요?",
    answer:
      "회원가입(+500P), DOS 테스트(+300P), 밸런스 게임 투표(+50P), 일일 출석(+30P) 등으로 포인트를 획득할 수 있습니다. 정당 지지율 투표 시 5P가 소모됩니다. 포인트 시스템은 사용자의 적극적인 참여를 장려하기 위해 운영됩니다.",
  },
  {
    question: "밸런스 게임 투표 결과는 공식 여론조사인가요?",
    answer:
      "아니요. OpenPoll의 투표 결과는 사용자 참여 데이터를 집계한 것으로, 과학적 표본 추출에 기반한 공식 여론조사가 아닙니다. 참고 자료로 활용해 주시고, 전체 국민의 여론으로 해석하지 않도록 주의해 주세요.",
  },
];

function FAQItemComponent({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { isDark } = useTheme();

  return (
    <div
      className={`border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between py-5 text-left transition-colors ${
          isDark ? "hover:text-white" : "hover:text-black"
        }`}
      >
        <span
          className={`text-base sm:text-lg font-semibold pr-4 ${
            isDark ? "text-gray-200" : "text-gray-800"
          }`}
        >
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-transform ${
            isDark ? "text-gray-400" : "text-gray-500"
          } ${isOpen ? "rotate-180" : ""}`}
          style={{ transitionDuration: "200ms" }}
        />
      </button>
      {isOpen && (
        <div className="pb-5">
          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export const FAQSection = memo(function FAQSection() {
  const { isDark } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h2
        className={`text-2xl sm:text-3xl font-bold text-center mb-3 ${
          isDark ? "text-white" : "text-black"
        }`}
      >
        자주 묻는 질문
      </h2>
      <p
        className={`text-center mb-8 ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        OpenPoll에 대해 궁금한 것들을 확인해 보세요
      </p>

      <div>
        {FAQ_ITEMS.map((item, index) => (
          <FAQItemComponent
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </section>
  );
});
