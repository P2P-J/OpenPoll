import { motion } from "motion/react";
import { Lock, Shield, Info, UserX } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface SecuritySectionProps {
  onOpenPasswordModal: () => void;
  onOpenWithdrawModal: () => void;
}

export function SecuritySection({ onOpenPasswordModal, onOpenWithdrawModal }: SecuritySectionProps) {
  const { isDark } = useTheme();
  const isOAuthUser = localStorage.getItem("isOAuthUser") === "true";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`rounded-3xl border shadow-sm p-6 sm:p-8 ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Shield className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
        <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>보안 설정</h3>
      </div>

      {!isOAuthUser && (
        <>
          <div className={`flex items-center justify-between p-3 sm:p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <Lock className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>비밀번호</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  정기적인 변경을 권장합니다
                </p>
              </div>
            </div>
            <button
              onClick={onOpenPasswordModal}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${
                isDark
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              변경
            </button>
          </div>

          <div className="mt-4 flex items-start gap-2 px-1">
            <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              안전한 계정 보호를 위해 주기적으로 비밀번호를 변경해주세요
            </p>
          </div>
        </>
      )}

      <div className={`${isOAuthUser ? "" : "mt-4 "}flex items-center justify-between p-3 sm:p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center ${isDark ? 'bg-red-900/40' : 'bg-red-100'}`}>
            <UserX className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>회원탈퇴</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              탈퇴 시 모든 데이터가 삭제됩니다
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenWithdrawModal}
          className="px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-colors"
          style={{ backgroundColor: "#ef4444" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
        >
          탈퇴
        </button>
      </div>
    </motion.div>
  );
}
