import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, X, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { userApi } from "@/api";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordChangeModal({
  isOpen,
  onClose,
}: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 비밀번호 표시/숨김 상태
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    // 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("새 비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      setPasswordError("새 비밀번호는 영문과 숫자를 포함해야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }

    try {
      setIsChangingPassword(true);
      await userApi.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);

      // 2초 후 모달 닫기
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setPasswordError(
        error?.response?.data?.message || "비밀번호 변경에 실패했습니다."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-red-600 to-red-700 px-6 py-6 text-white">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                disabled={isChangingPassword}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">비밀번호 변경</h3>
                  <p className="text-red-100 text-sm mt-0.5">
                    새로운 비밀번호를 설정해주세요
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  현재 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white transition-all outline-none"
                    placeholder="현재 비밀번호를 입력하세요"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    disabled={isChangingPassword}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  새 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white transition-all outline-none"
                    placeholder="영문+숫자 포함, 8자 이상"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    disabled={isChangingPassword}
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  영문자와 숫자를 포함하여 8자 이상 입력해주세요
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  새 비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white transition-all outline-none"
                    placeholder="새 비밀번호를 다시 입력하세요"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    disabled={isChangingPassword}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                      {passwordError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <AnimatePresence>
                {passwordSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                      비밀번호가 성공적으로 변경되었습니다!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-base"
                  disabled={isChangingPassword}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 active:bg-red-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base shadow-md"
                  disabled={isChangingPassword || passwordSuccess}
                >
                  {isChangingPassword ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>변경 중...</span>
                    </span>
                  ) : (
                    "변경하기"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
