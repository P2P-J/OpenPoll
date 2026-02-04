import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, X, Eye, EyeOff, AlertCircle, CheckCircle2, Shield } from "lucide-react";
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
      // 실제 API 호출
      await userApi.changePassword(currentPassword, newPassword);

      setPasswordSuccess(true);

      // 2초 후 모달 닫기
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
          {/* Backdrop - Subtle Blur */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Content - Black & White Design */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="relative bg-white border-2 border-black rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-black transition-all duration-200 hover:rotate-90 z-10"
              aria-label="닫기"
              disabled={isChangingPassword}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="relative z-10 flex flex-col items-center pt-12 pb-8 px-8">
              {/* Icon with Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-center mb-2"
              >
                <h3 className="text-3xl font-bold text-black mb-3">
                  비밀번호 변경
                </h3>
                <p className="text-base text-gray-600">
                  안전한 비밀번호로 변경해주세요
                </p>
              </motion.div>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordChange} className="relative z-10 px-8 pb-8 space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2.5">
                  현재 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 bg-white border-2 border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                    placeholder="현재 비밀번호를 입력하세요"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors"
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
                <label className="block text-sm font-bold text-gray-900 mb-2.5">
                  새 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 bg-white border-2 border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                    placeholder="영문+숫자 포함, 8자 이상"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors"
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
                <p className="mt-2 text-xs text-gray-500 font-medium">
                  영문자와 숫자를 포함하여 8자 이상 입력해주세요
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2.5">
                  새 비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 bg-white border-2 border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                    placeholder="새 비밀번호를 다시 입력하세요"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors"
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
                    className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-semibold">
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
                    className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700 font-semibold">
                      비밀번호가 성공적으로 변경되었습니다!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 h-14 bg-white border-2 border-gray-300 hover:border-black text-gray-700 hover:text-black font-bold rounded-xl transition-all duration-200"
                  disabled={isChangingPassword}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 h-14 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={isChangingPassword || passwordSuccess}
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>변경 중...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>변경하기</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
