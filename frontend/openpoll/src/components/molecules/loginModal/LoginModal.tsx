import { LogIn, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* Backdrop - Blur Effect */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* Modal Content - Enhanced Design */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1], // Custom easing
            }}
            className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-3xl shadow-2xl w-[360px] aspect-square flex flex-col items-center justify-center p-8 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient Orbs Background */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-gray-500 hover:text-white transition-all duration-200 hover:rotate-90 z-10"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon with Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mb-6 relative z-10"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                <LogIn className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-center mb-8 relative z-10"
            >
              <h3 className="text-2xl font-bold text-white mb-3 bg-clip-text text-transparent">
                로그인이 필요합니다
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                투표에 참여하려면
                <br />
                <span className="text-gray-300">로그인</span>해주세요
              </p>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full space-y-3 relative z-10"
            >
              <button
                onClick={onLogin}
                className="w-full h-12 bg-gradient-to-r from-black to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                로그인하기
              </button>
              <button
                onClick={onClose}
                className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200 hover:border-white/20"
              >
                취소
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
