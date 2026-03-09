import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertCircle, UserX } from "lucide-react";
import { deleteAccount } from "@/api/user.api";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function WithdrawModal({ isOpen, onClose, onComplete }: WithdrawModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (isProcessing) return;
    setStep(1);
    setError("");
    onClose();
  };

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleWithdraw = async () => {
    try {
      setIsProcessing(true);
      setError("");
      await deleteAccount();
      onComplete();
    } catch {
      setError("회원탈퇴에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsProcessing(false);
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
            className="relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-default bg-surface"
            style={{ maxHeight: "calc(100vh - 64px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 sm:p-8 md:p-10 pb-0 sm:pb-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 min-w-12 sm:min-w-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-error)" }}
                >
                  <UserX className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">회원탈퇴</h3>
                  <p className="text-sm sm:text-base text-foreground-muted">
                    탈퇴 전 안내사항을 확인해주세요
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-xl transition-colors text-foreground-muted hover:text-foreground hover:bg-surface"
                aria-label="닫기"
                disabled={isProcessing}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <hr className="border-t mx-6 sm:mx-8 md:mx-10 mt-5 sm:mt-6 md:mt-7 border-default" />

            {/* Body */}
            <div className="flex-1 flex items-center justify-center px-6 sm:px-8 md:px-10 py-8 sm:py-12">
              {step === 1 ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-5 sm:mb-8 bg-error-bg">
                    <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-error" />
                  </div>
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-foreground">
                    정말 탈퇴하시겠습니까?
                  </h4>
                  <p className="text-base sm:text-lg leading-relaxed text-foreground-muted">
                    탈퇴를 원하시면 아래 버튼을 눌러주세요.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center w-full max-w-lg">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-5 sm:mb-8 bg-error-bg">
                    <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-error" />
                  </div>
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 text-foreground">
                    정말로 탈퇴하시겠습니까?
                  </h4>
                  <div className="w-full rounded-xl px-4 sm:px-6 py-4 sm:py-5 bg-error-bg" style={{ border: "1px solid var(--color-error-border, rgba(239,68,68,0.25))" }}>
                    <p className="text-sm sm:text-base font-medium leading-relaxed text-error">
                      탈퇴하면 포인트, 투표 기록, DOS 결과 등
                      <br />
                      모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                    </p>
                  </div>
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-4 flex items-center gap-2 p-3 sm:p-4 rounded-xl bg-error-bg"
                        style={{ border: "1px solid var(--color-error-border, rgba(239,68,68,0.25))" }}
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-error" />
                        <p className="text-sm sm:text-base font-medium text-error">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 sm:p-8 md:p-10 pt-0 sm:pt-0">
              <div className="flex gap-3">
                {step === 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={handleFirstConfirm}
                      className="flex-1 py-3 text-white rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors"
                      style={{ backgroundColor: "var(--color-error)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-error-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-error)")}
                    >
                      <UserX className="w-4 h-4" />
                      탈퇴하기
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors bg-surface text-foreground hover:opacity-80"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleWithdraw}
                      disabled={isProcessing}
                      className="flex-1 py-3 text-white rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "var(--color-error)" }}
                      onMouseEnter={(e) => { if (!isProcessing) e.currentTarget.style.backgroundColor = "var(--color-error-hover)"; }}
                      onMouseLeave={(e) => { if (!isProcessing) e.currentTarget.style.backgroundColor = "var(--color-error)"; }}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          처리 중...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          탈퇴 확인
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isProcessing}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 bg-surface text-foreground hover:opacity-80"
                    >
                      취소
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
