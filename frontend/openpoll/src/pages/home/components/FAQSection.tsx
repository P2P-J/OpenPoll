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
      "OpenPoll은 정치 성향 테스트(DOS), AI 중립 뉴스, 밸런스 게임, 정당 지지율 투표를 한곳에서 제공하는 열린 여론조사 플랫폼입니다. 복잡한 정치 이슈를 쉽고 재미있게 접근할 수 있도록 설계되었고, 어떤 정당이나 정치 세력도 지지하지 않는 중립적 관점을 유지합니다. 누구나 부담 없이 참여해 자신의 정치적 생각을 정리하고, 서로 다른 관점을 안전하게 접할 수 있는 공간을 만드는 것이 목표입니다.",
  },
  {
    question: "DOS 테스트는 무엇인가요?",
    answer:
      "DOS(Democracy Orientation Scale) 테스트는 32개의 질문을 통해 자신의 정치적 좌표를 네 가지 축(변화·분배·권리·발전)으로 분석해 16가지 유형 중 하나로 분류해 주는 테스트입니다. 평균 소요 시간은 약 10분이며, 완료 후에는 결과 카드를 PNG 이미지로 저장하거나 전용 URL로 친구와 공유할 수 있습니다. 문항은 특정 정답이 없는 가치관 중심으로 설계되었고, 한쪽으로 치우치지 않도록 양쪽 관점을 모두 반영해 편향을 최소화했습니다.",
  },
  {
    question: "AI 중립 뉴스는 어떻게 만들어지나요?",
    answer:
      "국내 주요 언론사의 정치 기사를 AI가 분석해 자극적인 수식어, 편향된 프레이밍, 추측성 주장을 자동으로 감지하고 제거합니다. 이후 사실 중심의 어조로 기사를 재구성하고, 원본 기사의 출처와 제목을 항상 함께 표기해 독자가 원문도 직접 확인할 수 있게 합니다. 중립화 기준은 모든 기사에 동일하게 적용되며, 어떤 문장이 어떤 원칙으로 순화되었는지 투명하게 공개합니다. AI가 판단을 대신하는 것이 아니라, 편향 없이 사실을 읽을 수 있도록 돕는 것이 목적입니다.",
  },
  {
    question: "OpenPoll은 특정 정당을 지지하나요?",
    answer:
      "아니요. OpenPoll은 어떤 정당이나 정치적 입장도 지지하거나 반대하지 않습니다. DOS 문항, 뉴스 중립화, 블로그 글, 밸런스 게임 주제 등 모든 콘텐츠는 중립성과 객관성을 최우선 원칙으로 제작되며, 편집팀은 공개된 법령·통계·공신력 있는 매체 보도를 근거로 양쪽 관점을 균형 있게 다룹니다. 플랫폼의 역할은 이용자 대신 판단을 내리는 것이 아니라, 스스로 판단할 수 있는 정보 환경을 제공하는 것입니다. 편집 원칙은 About 페이지에서 자세히 확인할 수 있습니다.",
  },
  {
    question: "포인트는 어떻게 사용하나요?",
    answer:
      "포인트는 사용자의 꾸준한 참여를 장려하기 위한 보상 시스템입니다. 회원가입 시 500P 를 기본 지급하고, DOS 테스트 완료(+300P), 밸런스 게임 투표(+50P), 일일 출석(+30P), 연속 출석 보너스(+20P 추가) 등으로 계속 획득할 수 있습니다. 정당 지지율 투표에는 1회당 5P 가 소모되며, 무분별한 연속 투표를 막고 신중한 참여를 유도하기 위한 최소한의 설계입니다. 포인트는 실제 화폐로 환전되거나 외부 서비스에서 사용되지 않고, 서비스 내 참여 지표로만 활용됩니다.",
  },
  {
    question: "밸런스 게임 투표 결과는 공식 여론조사인가요?",
    answer:
      "아니요. OpenPoll 의 투표 결과는 자발적으로 참여한 사용자들의 의견을 실시간으로 집계한 데이터로, 과학적 표본 추출에 기반한 공식 여론조사가 아닙니다. 참여자의 연령·지역·성별 분포가 실제 인구 구성과 다를 수 있어, '전체 국민의 여론'으로 해석하는 것은 피해 주세요. 대신 특정 이슈에 관심을 가진 사용자들의 의견 분포를 파악하거나 서로 다른 관점의 댓글을 읽어보는 참고 자료로 활용하기에 적합하며, 집계 결과는 조작 없이 투명하게 실시간으로 공개됩니다.",
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
            <div className="px-4 sm:px-6 pb-5 sm:pb-6">
              <div
                style={{
                  height: 1,
                  width: "100%",
                  background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
                  marginBottom: 16,
                }}
              />
              <p
                className="text-base sm:text-lg leading-relaxed"
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
      className="pt-28 sm:pt-40 pb-16 sm:pb-20 bg-background"
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
