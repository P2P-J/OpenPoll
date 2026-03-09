import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Mail, Lock, ArrowRight, Gift } from "lucide-react";
import { motion } from "motion/react";
import { ROUTES } from "@/shared/constants";
import { useUser } from "@/contexts/UserContext";
import { Modal } from "@/components/atoms/modal/Modal";
import naverLogo from "@/img/naver-logo.svg";
import googleLogo from "@/img/google-logo.svg";

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

  const oauthBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

  const startOAuth = (provider: "google" | "naver", mode?: "rejoin") => {
    localStorage.setItem("oauthProvider", provider);
    const modeQuery = mode ? `?mode=${mode}` : "";
    onClose();
    window.location.href = `${oauthBaseUrl}/auth/oauth/${provider}${modeQuery}`;
  };

  const handleNaverLogin = () => {
    startOAuth("naver");
  };

  const handleGoogleLogin = () => {
    startOAuth("google");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="로그인"
      showCloseButton={false}
      className="bg-black border-white/15 text-white"
    >
      <div className="relative p-8">
        <button
          onClick={onClose}
          className="absolute z-10 w-10 h-10 flex items-center justify-center text-white transition-all hover:scale-125 hover:text-white/90"
          style={{ top: -4, right: -4 }}
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
              <label htmlFor="login-email" className="block text-sm font-semibold mb-2">
                이메일
              </label>
              <div className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border border-white/10">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  id="login-email"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold mb-2">
                비밀번호
              </label>
              <div className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border border-white/10">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  id="login-password"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-error" role="alert">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "로그인 중..." : "로그인"}{" "}
              <ArrowRight className="w-5 h-5" />
            </button>

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

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleNaverLogin}
                className="flex-1 h-10 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
                aria-label="네이버 로그인"
              >
                <img src={naverLogo} alt="네이버" className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex-1 h-10 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
                aria-label="구글 로그인"
              >
                <img src={googleLogo} alt="구글" className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full h-14 rounded-2xl border border-green-500/25 bg-green-500/10 shadow-[0_0_40px_rgba(34,197,94,0.15)] flex items-center justify-center gap-2 font-semibold">
              <Gift className="w-5 h-5 text-green-400" />
              <span className="text-green-400">회원가입 시 500P 지급!</span>
            </div>
          </form>
        </motion.div>
      </div>
    </Modal>
  );
}
