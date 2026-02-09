import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, X, Eye, EyeOff, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { changePassword } from "@/api/user.api";

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
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setPasswordError(
        err?.response?.data?.message || "비밀번호 변경에 실패했습니다."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 sm:p-10 pb-0 sm:pb-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 min-w-14 bg-black dark:bg-white rounded-2xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white dark:text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white">
                    비밀번호 변경
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    안전한 비밀번호로 변경해주세요
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                aria-label="닫기"
                disabled={isChangingPassword}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <hr className="border-t border-gray-100 dark:border-gray-800 mx-8 sm:mx-10 mt-6 sm:mt-7" />

            {/* Form */}
            <form onSubmit={handlePasswordChange} className="p-8 sm:p-10 pt-6 sm:pt-7 space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                  현재 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-5 py-4 pr-14 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-lg dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none"
                    placeholder="현재 비밀번호를 입력하세요"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 w-14 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                <label className="block text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                  새 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-5 py-4 pr-14 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-lg dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none"
                    placeholder="영문 + 숫자 포함, 8자 이상"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 w-14 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                  영문자와 숫자를 포함하여 8자 이상
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                  새 비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-5 py-4 pr-14 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-lg dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none"
                    placeholder="새 비밀번호를 다시 입력하세요"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 w-14 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                      {passwordError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <AnimatePresence>
                {passwordSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-2.5 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      비밀번호가 성공적으로 변경되었습니다!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-base hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={isChangingPassword || passwordSuccess}
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
                      변경 중...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      변경하기
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl font-semibold text-base hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  disabled={isChangingPassword}
                >
                  취소
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
