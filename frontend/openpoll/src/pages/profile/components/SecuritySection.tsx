import { motion } from "motion/react";
import { Lock, Shield, Info } from "lucide-react";

interface SecuritySectionProps {
  onOpenPasswordModal: () => void;
}

export function SecuritySection({ onOpenPasswordModal }: SecuritySectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        <h3 className="text-xl font-bold dark:text-white">보안 설정</h3>
      </div>

      <button
        onClick={onOpenPasswordModal}
        className="w-full py-4 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 hover:from-black hover:to-gray-800 dark:hover:from-white dark:hover:to-gray-200 text-white dark:text-black font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
      >
        <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="text-base">비밀번호 변경</span>
      </button>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-500 dark:text-gray-400" />
          <span>정기적인 비밀번호 변경으로 계정을 안전하게 보호하세요</span>
        </p>
      </div>
    </motion.div>
  );
}
