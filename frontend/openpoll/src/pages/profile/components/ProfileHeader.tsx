import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ProfileHeaderProps {
  onBack: () => void;
}

export function ProfileHeader({ onBack }: ProfileHeaderProps) {
  const { isDark } = useTheme();
  return (
    <>
      <button
        onClick={onBack}
        className={`inline-flex items-center space-x-2 mb-6 transition-colors ${
          isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
        }`}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">홈으로</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
          내 프로필
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          회원 정보 및 활동 내역을 확인하세요
        </p>
      </motion.div>
    </>
  );
}

export function LoadingState() {
  const { isDark } = useTheme();
  return (
    <div className={`min-h-screen flex items-center justify-center bg-background`}>
      <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? 'border-white' : 'border-black'}`} />
    </div>
  );
}
