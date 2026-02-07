import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Clock, Award, Share2, Brain } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Toast } from "@/components/molecules/toast/Toast";
import { usePageMeta } from "@/hooks/usePageMeta";

const AXES_DATA = [
  {
    name: "변화 인식 축",
    left: "안정 Stability",
    right: "변화 Change",
    description: "안정된 문화와 변화하는 미래",
  },
  {
    name: "분배 인식 축",
    left: "경쟁 Merit",
    right: "평등 Equality",
    description: "노력에 따른 성취 보상과 평등한 분배",
  },
  {
    name: "권리 인식 축",
    left: "자유 Freedom",
    right: "규율 Order",
    description: "개인의 자유와 사회 질서",
  },
  {
    name: "발전 인식 축",
    left: "환경 Nature",
    right: "개발 Development",
    description: "환경 보존과 사회 발전",
  },
] as const;

const INFO_CARDS_DATA = [
  {
    icon: Clock,
    title: "소요 시간",
    value: "약 10분",
    description: "32개 질문",
  },
  {
    icon: Award,
    title: "획득 포인트",
    value: "+300P",
    description: "완료 시 지급",
  },
  {
    icon: Share2,
    title: "결과 공유",
    value: "가능",
    description: "SNS 공유",
  },
] as const;

const NOTICE_ITEMS = [
  "이 테스트는 참고용이며, 특정 정당 지지를 의미하지 않습니다",
  "정치 성향은 다양한 요소로 구성되며, 시간에 따라 변할 수 있습니다",
  "중립적이고 편향되지 않은 질문으로 구성되었습니다",
  "솔직하게 답변할수록 정확한 결과를 얻을 수 있습니다",
] as const;

const LOGIN_REDIRECT_DELAY_MS = 1500;

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
  index: number;
}

interface AxisItemProps {
  name: string;
  left: string;
  right: string;
  description: string;
}

function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12 sm:mb-16"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6">
        <Brain className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
        나의 정치 성향은?
      </h1>
      <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
        8values 기반의 정치 DOS 테스트로
        <br />
        당신의 정치적 좌표를 찾아보세요
      </p>
    </motion.div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  value,
  description,
  index,
}: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-white/10"
    >
      <Icon className="w-7 h-7 sm:w-8 sm:h-8 mb-3 sm:mb-4 text-gray-400" />
      <h3 className="text-base sm:text-lg font-semibold mb-1">{title}</h3>
      <div className="text-xl sm:text-2xl font-bold mb-1">{value}</div>
      <p className="text-xs sm:text-sm text-gray-400">{description}</p>
    </motion.div>
  );
}

function InfoCardsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
      {INFO_CARDS_DATA.map((item, index) => (
        <InfoCard key={item.title} {...item} index={index} />
      ))}
    </div>
  );
}

function AxisItem({ name, left, right, description }: AxisItemProps) {
  return (
    <div className="bg-white/5 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
        <span className="text-base sm:text-lg font-bold">{name}</span>
        <span className="text-xs sm:text-sm text-gray-400">{description}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 text-center py-2 sm:py-2.5 bg-white/10 rounded-l-lg font-semibold text-sm sm:text-base">
          {left}
        </div>
        <div className="px-2 sm:px-4 text-sm sm:text-base">↔</div>
        <div className="flex-1 text-center py-2 sm:py-2.5 bg-white/10 rounded-r-lg font-semibold text-sm sm:text-base">
          {right}
        </div>
      </div>
    </div>
  );
}

function AxesSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 sm:mb-12"
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        4가지 측정 축
      </h2>
      <div className="space-y-4 sm:space-y-6">
        {AXES_DATA.map((axis) => (
          <AxisItem key={axis.name} {...axis} />
        ))}
      </div>
    </motion.div>
  );
}

function NoticeSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl sm:rounded-2xl p-5 sm:p-6 mb-8 sm:mb-12"
    >
      <h3 className="font-bold text-yellow-500 mb-2 sm:mb-3 text-base sm:text-lg">
        ⚠️ 중요 안내
      </h3>
      <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-300">
        {NOTICE_ITEMS.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </motion.div>
  );
}

function CTASection({ onStartTest }: { onStartTest: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="text-center"
    >
      <button
        onClick={onStartTest}
        className="inline-flex items-center space-x-2 sm:space-x-3 px-10 sm:px-12 py-4 sm:py-5 bg-white text-black rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors group"
      >
        <span>테스트 시작하기</span>
        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
      </button>
      <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-400">
        약 10분이면 나의 정치 성향을 알 수 있어요
      </p>
    </motion.div>
  );
}

const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};

export function DosIntro() {
  usePageMeta("정치 DOS 테스트", "8values 기반 정치 성향 테스트로 나의 정치적 좌표를 찾아보세요. 4가지 축으로 분석합니다.");
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const [showToast, setShowToast] = useState(false);

  useScrollToTop();

  const handleStartTest = useCallback(() => {
    if (!isAuthenticated) {
      setShowToast(true);
      setTimeout(() => {
        navigate("/login", { state: { from: "/dos" } });
      }, LOGIN_REDIRECT_DELAY_MS);
      return;
    }
    navigate("/dos/test");
  }, [isAuthenticated, navigate]);

  const handleCloseToast = useCallback(() => setShowToast(false), []);

  return (
    <div className="pt-16 min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <HeroSection />
        <InfoCardsGrid />
        <AxesSection />
        <NoticeSection />
        <CTASection onStartTest={handleStartTest} />
      </div>

      <Toast
        message="로그인이 필요한 서비스입니다"
        type="info"
        isVisible={showToast}
        onClose={handleCloseToast}
      />
    </div>
  );
}
