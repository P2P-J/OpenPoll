import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, Gift, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { ROUTES } from '@/shared/constants';
import { loginUser } from '@/shared/utils/localAuth';

type LoginErrors = {
  email?: string;
  password?: string;
};

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<LoginErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const validate = () => {
    const next: LoginErrors = {};
    if (!email.trim()) next.email = '이메일을 입력해 주세요.';
    if (!password) next.password = '비밀번호를 입력해 주세요.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!validate()) return;

    const result = loginUser(email.trim(), password);

    if (!result.ok) {
      setErrors((prev) => ({ ...prev, password: result.message }));
      return;
    }

    alert(`로그인 성공!\n포인트가 지급되었습니다. (+${result.awardedPoints}P)`);
    window.dispatchEvent(new Event('storage'));
    navigate(ROUTES.HOME);
  };

  const showError = (key: keyof LoginErrors) => hasSubmitted && !!errors[key];
  const borderColor = (key: keyof LoginErrors) =>
    showError(key) ? '#ef4444' : 'rgba(255,255,255,0.10)';

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#000',
        color: '#fff',
        overflowY: 'scroll',
        overscrollBehaviorY: 'contain',
      }}
    >
      <div style={{ paddingTop: 220, paddingBottom: 120, paddingLeft: 16, paddingRight: 16 }}>
        <motion.div
          style={{ width: 450, maxWidth: '100%', margin: '0 auto' }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h1 className="text-4xl font-extrabold text-center mb-2">로그인</h1>
          <p className="text-center text-gray-400 mb-10">오픈폴에 오신 것을 환영합니다</p>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">이메일</label>
              <div
                className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border"
                style={{ borderColor: borderColor('email') }}
              >
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                />
              </div>
              {showError('email') && (
                <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">비밀번호</label>
              <div
                className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border"
                style={{ borderColor: borderColor('password') }}
              >
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                />
              </div>
              {showError('password') && (
                <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-14 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              로그인 <ArrowRight className="w-5 h-5" />
            </button>

            <div className="w-full h-14 rounded-2xl border border-green-500/25 bg-green-500/10 shadow-[0_0_40px_rgba(34,197,94,0.15)] flex items-center justify-center gap-2 font-semibold">
              <Gift className="w-5 h-5 text-green-400" />
              <span className="text-green-400">로그인 시 500P 지급!</span>
            </div>

            <p className="text-center text-sm text-gray-400">
              아직 계정이 없으신가요?{' '}
              <Link to={ROUTES.REGISTER} className="text-white font-semibold hover:underline">
                회원가입
              </Link>
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-gray-500">또는</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="flex justify-center pt-2">
              <Link
                to={ROUTES.HOME}
                className="group w-full h-16 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-3 font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>홈으로 돌아가기</span>
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}