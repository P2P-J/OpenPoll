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
          {/* Backdrop - 블러 */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal - 4:3 비율 (800x600 기준) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ width: 800, height: 600, maxWidth: "calc(100vw - 32px)", maxHeight: "calc(100vh - 64px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 sm:p-10 pb-0 sm:pb-0">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 min-w-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#ef4444" }}
                >
                  <UserX className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold dark:text-white">회원탈퇴</h3>
                  <p className="text-base text-gray-500 dark:text-gray-400">
                    탈퇴 전 안내사항을 확인해주세요
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                aria-label="닫기"
                disabled={isProcessing}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <hr className="border-t border-gray-100 dark:border-gray-800 mx-8 sm:mx-10 mt-6 sm:mt-7" />

            {/* Body */}
            <div className="flex-1 flex items-center justify-center px-8 sm:px-10">
              {step === 1 ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
                    <AlertCircle className="w-12 h-12" style={{ color: "#ef4444" }} />
                  </div>
                  <h4 className="text-3xl font-bold dark:text-white mb-4">
                    정말 탈퇴하시겠습니까?
                  </h4>
                  <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                    탈퇴를 원하시면 아래 버튼을 눌러주세요.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center w-full max-w-lg">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
                    <AlertCircle className="w-12 h-12" style={{ color: "#ef4444" }} />
                  </div>
                  <h4 className="text-3xl font-bold dark:text-white mb-5">
                    정말로 탈퇴하시겠습니까?
                  </h4>
                  <div className="w-full rounded-xl px-6 py-5" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                    <p className="text-base font-medium leading-relaxed" style={{ color: "#b91c1c" }}>
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
                        className="mt-4 flex items-center gap-2 p-4 rounded-xl"
                        style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#dc2626" }} />
                        <p className="text-base font-medium" style={{ color: "#b91c1c" }}>{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 sm:p-10 pt-0 sm:pt-0">
              <div className="flex gap-3">
                {step === 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={handleFirstConfirm}
                      className="flex-1 py-3 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors"
                      style={{ backgroundColor: "#ef4444" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
                    >
                      <UserX className="w-4 h-4" />
                      탈퇴하기
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl font-semibold text-base hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                      className="flex-1 py-3 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#ef4444" }}
                      onMouseEnter={(e) => { if (!isProcessing) e.currentTarget.style.backgroundColor = "#dc2626"; }}
                      onMouseLeave={(e) => { if (!isProcessing) e.currentTarget.style.backgroundColor = "#ef4444"; }}
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
                      className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl font-semibold text-base hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
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
