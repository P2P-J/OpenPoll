import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, X, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { changePassword } from "@/api/user.api";
import { Modal } from "@/components/atoms/modal/Modal";

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

  const autoCloseTimer = useRef<number | null>(null);
  useEffect(() => () => { if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current); }, []);

  const handleClose = () => {
    if (autoCloseTimer.current) { clearTimeout(autoCloseTimer.current); autoCloseTimer.current = null; }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess(false);
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

      autoCloseTimer.current = window.setTimeout(() => {
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

  const inputClass = "w-full px-4 sm:px-5 py-3 sm:py-4 border rounded-xl text-base sm:text-lg transition-all outline-none bg-secondary text-foreground border-default placeholder:text-foreground-subtle focus:ring-2 focus:ring-[var(--color-border-focus)] focus:border-transparent";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      title="비밀번호 변경"
      showCloseButton={false}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 sm:p-8 md:p-10 pb-0 sm:pb-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 min-w-12 sm:min-w-14 rounded-2xl flex items-center justify-center bg-primary text-primary-fg">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              비밀번호 변경
            </h3>
            <p className="text-sm text-foreground-muted">
              안전한 비밀번호로 변경해주세요
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="p-2 rounded-xl transition-colors text-foreground-muted hover:text-foreground hover:bg-secondary"
          aria-label="닫기"
          disabled={isChangingPassword}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <hr className="border-t mx-6 sm:mx-8 md:mx-10 mt-5 sm:mt-6 md:mt-7 border-default" />

      {/* Form */}
      <form onSubmit={handlePasswordChange} className="p-6 sm:p-8 md:p-10 pt-5 sm:pt-6 md:pt-7 space-y-4 sm:space-y-5">
        {/* Current Password */}
        <div>
          <label htmlFor="pw-current" className="block text-sm sm:text-base font-bold mb-2 text-foreground">
            현재 비밀번호
          </label>
          <input
            id="pw-current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
            placeholder="현재 비밀번호를 입력하세요"
            disabled={isChangingPassword}
          />
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="pw-new" className="block text-sm sm:text-base font-bold mb-2 text-foreground">
            새 비밀번호
          </label>
          <input
            id="pw-new"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            placeholder="영문 + 숫자 포함, 8자 이상"
            disabled={isChangingPassword}
          />
          <p className="mt-1.5 text-xs text-foreground-subtle">
            영문자와 숫자를 포함하여 8자 이상
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="pw-confirm" className="block text-sm sm:text-base font-bold mb-2 text-foreground">
            새 비밀번호 확인
          </label>
          <input
            id="pw-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="새 비밀번호를 다시 입력하세요"
            disabled={isChangingPassword}
          />
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {passwordError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-2.5 p-3 border rounded-xl bg-error-bg border-error"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-error" />
              <p className="text-sm font-medium text-error">
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
              className="flex items-start gap-2.5 p-3 border rounded-xl bg-success-bg border-success"
              role="alert"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
              <p className="text-sm font-medium text-success">
                비밀번호가 성공적으로 변경되었습니다!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex gap-3 pt-3">
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50 transition-colors bg-primary text-primary-fg hover:bg-primary-hover"
            disabled={isChangingPassword || passwordSuccess}
          >
            {isChangingPassword ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-[var(--color-primary-foreground)]" />
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
            className="flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 bg-secondary text-foreground hover:opacity-80"
            disabled={isChangingPassword}
          >
            취소
          </button>
        </div>
      </form>
    </Modal>
  );
}
