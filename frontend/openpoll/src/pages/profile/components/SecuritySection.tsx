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
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        <h3 className="text-xl font-bold dark:text-white">보안 설정</h3>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="font-semibold dark:text-white">비밀번호</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              정기적인 변경을 권장합니다
            </p>
          </div>
        </div>
        <button
          onClick={onOpenPasswordModal}
          className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          변경
        </button>
      </div>

      <div className="mt-4 flex items-start gap-2 px-1">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400 dark:text-gray-500" />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          안전한 계정 보호를 위해 주기적으로 비밀번호를 변경해주세요
        </p>
      </div>
    </motion.div>
  );
}
