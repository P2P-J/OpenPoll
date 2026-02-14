import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

interface ProfileHeaderProps {
  onBack: () => void;
}

export function ProfileHeader({ onBack }: ProfileHeaderProps) {
  return (
    <>
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">홈으로</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 dark:text-white">
          내 프로필
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          회원 정보 및 활동 내역을 확인하세요
        </p>
      </motion.div>
    </>
  );
}

export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white" />
    </div>
  );
}
