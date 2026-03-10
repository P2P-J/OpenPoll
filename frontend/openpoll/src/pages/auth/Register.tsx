import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, Mail, Lock, User, Calendar, Users, MapPin, Home, ShieldCheck, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ROUTES, REGION_OPTIONS, GENDER_OPTIONS } from '@/shared/constants';
import { useUser } from '@/contexts/UserContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { sendVerificationCode, verifyCode, checkNickname } from '@/api/auth.api';
import { getErrorMessage } from '@/api/client';

type RegisterErrors = {
  nickname?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  verificationCode?: string;
  age?: string;
  gender?: string;
  region?: string;
  agree?: string;
};

const CHOSUNG_REGEX = /[ㄱ-ㅎ]/;
const NICKNAME_REGEX = /^[a-zA-Z0-9가-힣]+$/;

function validateNicknameFormat(value: string): string | undefined {
  if (!value) return undefined;
  if (value.length < 2 || value.length > 20) return '닉네임은 2~20자로 입력해 주세요.';
  if (/\s/.test(value)) return '닉네임에 띄어쓰기는 사용할 수 없습니다.';
  if (!NICKNAME_REGEX.test(value)) return '닉네임은 한글, 영문, 숫자만 사용 가능합니다.';
  if (CHOSUNG_REGEX.test(value)) return '초성(ㄱ, ㄴ, ㄷ 등)은 사용할 수 없습니다.';
  return undefined;
}

export function Register() {
  usePageMeta("회원가입", "OpenPoll 회원가입으로 정치 성향 테스트, 밸런스 게임 투표에 참여하세요.");
  const navigate = useNavigate();
  const { signup } = useUser();

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [region, setRegion] = useState('');
  const [agree, setAgree] = useState(false);

  // 닉네임 중복확인 관련 state
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);

  // 닉네임 중복확인 핸들러
  const handleCheckNickname = useCallback(async () => {
    const trimmed = nickname.trim();
    const formatError = validateNicknameFormat(trimmed);
    if (formatError) {
      setErrors((prev) => ({ ...prev, nickname: formatError }));
      return;
    }

    try {
      setIsCheckingNickname(true);
      setErrors((prev) => ({ ...prev, nickname: undefined }));
      const result = await checkNickname(trimmed);
      if (result.available) {
        setIsNicknameChecked(true);
      } else {
        setErrors((prev) => ({ ...prev, nickname: '이미 사용 중인 닉네임입니다.' }));
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setErrors((prev) => ({ ...prev, nickname: message }));
    } finally {
      setIsCheckingNickname(false);
    }
  }, [nickname]);

  // 이메일 인증 관련 state
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 타이머 카운트다운
  const isTimerActive = timer > 0;
  useEffect(() => {
    if (!isTimerActive) return;
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 인증코드 발송
  const handleSendCode = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrors((prev) => ({ ...prev, email: '이메일을 입력해 주세요.' }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrors((prev) => ({ ...prev, email: '유효한 이메일 주소를 입력해 주세요.' }));
      return;
    }

    try {
      setIsSendingCode(true);
      setErrors((prev) => ({ ...prev, email: undefined, verificationCode: undefined }));
      await sendVerificationCode(trimmedEmail);
      setIsCodeSent(true);
      setIsEmailVerified(false);
      setVerificationCode('');
      setTimer(300); // 5분
    } catch (err) {
      const message = getErrorMessage(err);
      setErrors((prev) => ({ ...prev, email: message }));
    } finally {
      setIsSendingCode(false);
    }
  }, [email]);

  // 인증코드 백엔드 검증
  const handleVerifyCode = useCallback(async () => {
    const code = verificationCode.trim();
    if (!code) {
      setErrors((prev) => ({ ...prev, verificationCode: '인증코드를 입력해 주세요.' }));
      return;
    }
    if (code.length !== 6) {
      setErrors((prev) => ({ ...prev, verificationCode: '인증코드는 6자리 숫자입니다.' }));
      return;
    }

    try {
      setIsVerifyingCode(true);
      setErrors((prev) => ({ ...prev, verificationCode: undefined }));
      await verifyCode(email.trim(), code);
      setIsEmailVerified(true);
      setTimer(0);
    } catch (err) {
      const message = getErrorMessage(err);
      setErrors((prev) => ({ ...prev, verificationCode: message }));
    } finally {
      setIsVerifyingCode(false);
    }
  }, [verificationCode, email]);

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const validate = () => {
    const next: RegisterErrors = {};
    const trimmedNickname = nickname.trim();
    const trimmedEmail = email.trim();
    const trimmedAge = age.trim();

    if (!trimmedNickname) {
      next.nickname = '닉네임을 입력해 주세요.';
    } else {
      const formatError = validateNicknameFormat(trimmedNickname);
      if (formatError) {
        next.nickname = formatError;
      } else if (!isNicknameChecked) {
        next.nickname = '닉네임 중복확인을 해주세요.';
      }
    }
    if (!trimmedEmail) next.email = '이메일을 입력해 주세요.';
    if (trimmedEmail && !isEmailVerified) next.email = '이메일 인증을 완료해 주세요.';
    if (!password) next.password = '비밀번호를 입력해 주세요.';
    if (!passwordConfirm) next.passwordConfirm = '비밀번호 확인을 입력해 주세요.';
    if (!trimmedAge) next.age = '나이를 입력해 주세요.';
    if (!gender) next.gender = '성별을 선택해 주세요.';
    if (!region) next.region = '지역을 선택해 주세요.';
    if (!agree) next.agree = '약관에 동의해 주세요.';

    if (password && password.length < 8) {
      next.password = '비밀번호는 8자 이상이어야 합니다.';
    } else if (password && !/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      next.password = '비밀번호는 영문과 숫자를 포함해야 합니다.';
    }

    if (password && passwordConfirm && password !== passwordConfirm) {
      next.password = '비밀번호가 일치하지 않습니다.';
      next.passwordConfirm = undefined;
    }

    if (trimmedAge) {
      const n = Number(trimmedAge);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        next.age = '나이는 숫자로 입력해 주세요.';
      } else if (n < 18 || n > 150) {
        next.age = '나이는 18세 이상이어야 합니다.';
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    const ok = validate();
    if (!ok) return;

    try {
      await signup({
        nickname: nickname.trim(),
        email: email.trim(),
        password,
        age: Number(age),
        gender: gender as 'MALE' | 'FEMALE',
        region,
        verificationCode: verificationCode.trim(),
      });
      navigate(ROUTES.HOME);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '회원가입에 실패했습니다.';
      if (errorMessage.includes('nickname') || errorMessage.includes('닉네임')) {
        setErrors((prev) => ({ ...prev, nickname: '이미 사용 중인 닉네임입니다.' }));
      } else if (errorMessage.includes('email') || errorMessage.includes('이메일')) {
        setErrors((prev) => ({ ...prev, email: '이미 사용 중인 이메일입니다.' }));
      } else {
        setErrors((prev) => ({ ...prev, email: errorMessage }));
      }
    }
  };

  const showError = (key: keyof RegisterErrors) => hasSubmitted && !!errors[key];
  const borderColor = (key: keyof RegisterErrors) =>
    showError(key) ? '#ef4444' : 'rgba(255,255,255,0.10)';

  return (
    <div
      style={{
        height: '100dvh',
        background: '#000',
        color: '#fff',
        overflowY: 'auto',
        overscrollBehaviorY: 'contain',
      }}
    >
      <div style={{ paddingTop: 120, paddingBottom: 120, paddingLeft: 16, paddingRight: 16 }}>
        <motion.div
          style={{ width: 450, maxWidth: '100%', margin: '0 auto' }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h1 className="text-4xl font-extrabold text-center mb-2">회원가입</h1>
          <p className="text-center text-gray-400 mb-10">정치 참여의 첫 걸음을 시작하세요</p>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">닉네임 *</label>
              <div className="flex gap-2">
                <div
                  className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border flex-1"
                  style={{ borderColor: isNicknameChecked ? '#22c55e' : errors.nickname ? '#ef4444' : 'rgba(255,255,255,0.10)' }}
                >
                  <User className="w-5 h-5 text-gray-400" />
                  <input
                    className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500"
                    placeholder="한글, 영문, 숫자 (2~20자)"
                    value={nickname}
                    maxLength={20}
                    disabled={isNicknameChecked}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '');
                      setNickname(value);
                      setIsNicknameChecked(false);
                      const formatError = validateNicknameFormat(value);
                      setErrors((prev) => ({ ...prev, nickname: formatError }));
                    }}
                  />
                  {isNicknameChecked && <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />}
                </div>
                {!isNicknameChecked ? (
                  <button
                    type="button"
                    onClick={handleCheckNickname}
                    disabled={isCheckingNickname || !nickname.trim() || !!validateNicknameFormat(nickname.trim())}
                    className="h-14 px-4 rounded-2xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
                  >
                    {isCheckingNickname ? '확인 중...' : '중복확인'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNicknameChecked(false);
                      setErrors((prev) => ({ ...prev, nickname: undefined }));
                    }}
                    className="h-14 px-4 rounded-2xl bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    변경
                  </button>
                )}
              </div>
              {errors.nickname && (
                <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                  {errors.nickname}
                </p>
              )}
              {isNicknameChecked && (
                <p className="mt-2 text-xs" style={{ color: '#22c55e' }}>
                  사용 가능한 닉네임입니다.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">이메일 (아이디) *</label>
              <div className="flex gap-2">
                <div
                  className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border flex-1"
                  style={{ borderColor: isEmailVerified ? '#22c55e' : errors.email ? '#ef4444' : 'rgba(255,255,255,0.10)' }}
                >
                  <Mail className="w-5 h-5 text-gray-400" />
                  <input
                    className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500"
                    placeholder="your@email.com"
                    type="email"
                    value={email}
                    disabled={isEmailVerified}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsCodeSent(false);
                      setIsEmailVerified(false);
                      setVerificationCode('');
                      setTimer(0);
                      setErrors((prev) => ({ ...prev, email: undefined, verificationCode: undefined }));
                    }}
                  />
                  {isEmailVerified && <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />}
                </div>
                {!isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isSendingCode || !email.trim()}
                    className="h-14 px-4 rounded-2xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
                  >
                    {isSendingCode ? '발송 중...' : isCodeSent ? '재발송' : '인증코드 발송'}
                  </button>
                )}
              </div>
              {errors.email && (
                <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                  {errors.email}
                </p>
              )}
              {isEmailVerified && (
                <p className="mt-2 text-xs" style={{ color: '#22c55e' }}>
                  이메일 인증이 완료되었습니다.
                </p>
              )}

              {/* 인증코드 입력 필드 */}
              <AnimatePresence>
                {isCodeSent && !isEmailVerified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3"
                  >
                    <div className="flex gap-2">
                      <div
                        className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border flex-1"
                        style={{ borderColor: errors.verificationCode ? '#ef4444' : 'rgba(255,255,255,0.10)' }}
                      >
                        <ShieldCheck className="w-5 h-5 text-gray-400" />
                        <input
                          className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500"
                          placeholder="인증코드 6자리 숫자"
                          value={verificationCode}
                          maxLength={6}
                          inputMode="numeric"
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setVerificationCode(value);
                            setErrors((prev) => ({ ...prev, verificationCode: undefined }));
                          }}
                        />
                        {timer > 0 && (
                          <div className="flex items-center gap-1 text-sm flex-shrink-0">
                            <Timer className="w-4 h-4 text-gray-400" />
                            <span style={{ color: timer <= 60 ? '#ef4444' : '#9ca3af' }}>
                              {formatTimer(timer)}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={!verificationCode.trim() || timer <= 0 || isVerifyingCode}
                        className="h-14 px-5 rounded-2xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
                      >
                        {isVerifyingCode ? '확인 중...' : '확인'}
                      </button>
                    </div>
                    {errors.verificationCode && (
                      <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                        {errors.verificationCode}
                      </p>
                    )}
                    {timer <= 0 && isCodeSent && (
                      <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                        인증 시간이 만료되었습니다. 다시 발송해 주세요.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">비밀번호 *</label>
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
                      setErrors((prev) => ({
                        ...prev,
                        password: undefined,
                        passwordConfirm: undefined,
                      }));
                    }}
                  />
                </div>
                {showError('password') && (
                  <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">비밀번호 확인 *</label>
                <div
                  className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border"
                  style={{ borderColor: borderColor('password') }}
                >
                  <Lock className="w-5 h-5 text-gray-400" />
                  <input
                    className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500"
                    placeholder="••••••••"
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        password: undefined,
                        passwordConfirm: undefined,
                      }));
                    }}
                  />
                </div>
                {showError('passwordConfirm') && (
                  <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                    {errors.passwordConfirm}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">나이 *</label>
                <div
                  className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border"
                  style={{ borderColor: borderColor('age') }}
                >
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <input
                    className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500"
                    placeholder="나이를 입력하세요"
                    value={age}
                    onChange={(e) => {
                      setAge(e.target.value);
                      setErrors((prev) => ({ ...prev, age: undefined }));
                    }}
                  />
                </div>
                {showError('age') && (
                  <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                    {errors.age}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">성별 *</label>
                <div
                  className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border"
                  style={{ borderColor: borderColor('gender') }}
                >
                  <Users className="w-5 h-5 text-gray-400" />
                  <select
                    className="w-full bg-transparent outline-none text-sm text-gray-200"
                    value={gender}
                    onChange={(e) => {
                      setGender(e.target.value);
                      setErrors((prev) => ({ ...prev, gender: undefined }));
                    }}
                  >
                    <option value="" className="bg-black">선택하세요</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value} className="bg-black">{g.label}</option>
                    ))}
                  </select>
                </div>
                {showError('gender') && (
                  <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                    {errors.gender}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">지역 *</label>
              <div
                className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border"
                style={{ borderColor: borderColor('region') }}
              >
                <MapPin className="w-5 h-5 text-gray-400" />
                <select
                  className="w-full bg-transparent outline-none text-sm text-gray-200"
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    setErrors((prev) => ({ ...prev, region: undefined }));
                  }}
                >
                  <option value="" className="bg-black">거주 지역을 선택하세요</option>
                  {REGION_OPTIONS.map((r) => (
                    <option key={r} value={r} className="bg-black">{r}</option>
                  ))}
                </select>
              </div>
              {showError('region') && (
                <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                  {errors.region}
                </p>
              )}
            </div>

            <div>
              <label
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border cursor-pointer"
                style={{ borderColor: borderColor('agree') }}
              >
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked);
                    setErrors((prev) => ({ ...prev, agree: undefined }));
                  }}
                />
                <span className="text-sm text-gray-200">
                  이용약관 및 개인정보 처리방침에 동의합니다
                </span>
              </label>
              {showError('agree') && (
                <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                  {errors.agree}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-14 rounded-2xl bg-white text-black font-extrabold transition-all duration-200 hover:bg-gray-100 hover:brightness-95 hover:shadow-[0_10px_30px_rgba(255,255,255,0.12)] hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              회원가입 완료
            </button>

            <div className="w-full h-14 rounded-2xl border border-green-500/25 bg-green-500/10 shadow-[0_0_40px_rgba(34,197,94,0.15)] flex items-center justify-center gap-2 font-semibold">
              <Gift className="w-5 h-5 text-green-400" />
              <span className="text-green-400">회원가입 완료 시 500P 지급!</span>
            </div>

            <p className="text-center text-sm text-gray-400">
              이미 계정이 있으신가요?{' '}
              <Link to={ROUTES.LOGIN} className="text-white font-semibold hover:underline">
                로그인
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
