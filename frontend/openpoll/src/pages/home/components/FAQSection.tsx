import { memo, useState, useCallback } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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

interface FAQCardProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function FAQCard({ item, isOpen, onToggle, index }: FAQCardProps) {
  const { isDark } = useTheme();

  const borderColor = isDark
    ? isOpen
      ? "rgba(255, 255, 255, 0.85)"
      : "rgba(255, 255, 255, 0.18)"
    : isOpen
      ? "#1a1a1a"
      : "rgba(0, 0, 0, 0.14)";
  const bgColor = isOpen
    ? isDark
      ? "rgba(255, 249, 230, 0.05)"
      : "#FFF9E6"
    : isDark
      ? "rgba(255, 255, 255, 0.02)"
      : "#ffffff";
  const questionColor = isDark ? "#fafafa" : "#1a1a1a";
  const answerColor = isDark ? "#cbd5e1" : "#475569";
  const iconBg = isOpen
    ? isDark
      ? "#ffffff"
      : "#1a1a1a"
    : isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.06)";
  const iconColor = isOpen
    ? isDark
      ? "#1a1a1a"
      : "#ffffff"
    : isDark
      ? "#fafafa"
      : "#1a1a1a";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
      style={{
        border: `2px solid ${borderColor}`,
        borderRadius: 14,
        background: bgColor,
        overflow: "hidden",
        transition: "border-color 0.18s ease, background-color 0.18s ease",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left"
      >
        <span
          className="text-sm sm:text-base font-bold leading-snug"
          style={{ color: questionColor }}
        >
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 9999,
            background: iconBg,
            color: iconColor,
            flexShrink: 0,
            transition: "background-color 0.18s ease, color 0.18s ease",
          }}
        >
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
              <div
                style={{
                  height: 1,
                  width: "100%",
                  background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
                  marginBottom: 12,
                }}
              />
              <p
                className="text-sm leading-relaxed"
                style={{ color: answerColor }}
              >
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export const FAQSection = memo(function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section
      className="pt-20 sm:pt-28 pb-16 sm:pb-20 bg-background"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2 text-foreground-muted">
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase">
              FAQ
            </span>
          </div>
          <h2
            id="faq-heading"
            className="text-2xl sm:text-3xl font-bold text-foreground"
          >
            자주 묻는 질문
          </h2>
          <p className="mt-2 text-sm sm:text-base text-foreground-muted">
            OpenPoll에 대해 자주 궁금해하시는 내용을 정리했어요.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
          {FAQ_ITEMS.map((item, index) => (
            <FAQCard
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
