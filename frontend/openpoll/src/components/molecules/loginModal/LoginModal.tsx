import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Mail, Lock, ArrowRight, Gift, Home } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ROUTES } from "@/shared/constants";
import { useUser } from "@/contexts/UserContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await login(trimmedEmail, password);
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "로그인에 실패했습니다.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
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
            className="relative bg-black border border-white/15 rounded-3xl shadow-2xl p-8 text-white"
            style={{ width: "min(350px, calc(100vw - 32px))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute z-10 w-6 h-6 flex items-center justify-center text-white transition-all hover:scale-125 hover:text-white/90"
              style={{ top: 12, right: 12, transform: "scale(1.2)" }}
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative z-10"
            >
              <h1 className="text-4xl font-extrabold text-center mb-2">로그인</h1>
              <p className="text-center text-gray-400 mb-8">해당 기능은 로그인이 필요한 기능입니다.</p>

              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    이메일
                  </label>
                  <div className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border border-white/10">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <input
                      className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500"
                      placeholder="your@email.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    비밀번호
                  </label>
                  <div className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border border-white/10">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <input
                      className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-400">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "로그인 중..." : "로그인"}{" "}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="w-full h-14 rounded-2xl border border-green-500/25 bg-green-500/10 shadow-[0_0_40px_rgba(34,197,94,0.15)] flex items-center justify-center gap-2 font-semibold">
                  <Gift className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">로그인 시 500P 지급!</span>
                </div>

                <p className="text-center text-sm text-gray-400">
                  아직 계정이 없으신가요?{" "}
                  <Link
                    to={ROUTES.REGISTER}
                    onClick={onClose}
                    className="text-white font-semibold hover:underline"
                  >
                    회원가입
                  </Link>
                </p>

                <div className="flex items-center gap-4 pt-1">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-gray-500">또는</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="flex justify-center pt-1">
                  <Link
                    to={ROUTES.HOME}
                    onClick={onClose}
                    className="group w-full h-14 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-3 font-bold text-base shadow-lg hover:shadow-xl"
                  >
                    <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>이전 페이지로</span>
                  </Link>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
