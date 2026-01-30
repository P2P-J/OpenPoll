import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, Mail, Lock, User, Calendar, Users, MapPin, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { ROUTES } from '@/shared/constants';
import { useUser } from '@/contexts/UserContext';

type RegisterErrors = {
  nickname?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  age?: string;
  gender?: string;
  region?: string;
  agree?: string;
};

export function Register() {
  const navigate = useNavigate();
  const { signup, isLoading } = useUser();

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [region, setRegion] = useState('');
  const [agree, setAgree] = useState(false);

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const takenNicknames = useMemo(
    () => new Set(['admin', '관리자', 'test', 'roun', 'openpoll']),
    []
  );

  const validate = () => {
    const next: RegisterErrors = {};
    const trimmedNickname = nickname.trim();
    const trimmedEmail = email.trim();
    const trimmedAge = age.trim();

    if (!trimmedNickname) next.nickname = '닉네임을 입력해 주세요.';
    if (!trimmedEmail) next.email = '이메일을 입력해 주세요.';
    if (!password) next.password = '비밀번호를 입력해 주세요.';
    if (!passwordConfirm) next.passwordConfirm = '비밀번호 확인을 입력해 주세요.';
    if (!trimmedAge) next.age = '나이를 입력해 주세요.';
    if (!gender) next.gender = '성별을 선택해 주세요.';
    if (!region) next.region = '지역을 선택해 주세요.';
    if (!agree) next.agree = '약관에 동의해 주세요.';

    if (trimmedNickname) {
      if (trimmedNickname.length < 2 || trimmedNickname.length > 12) {
        next.nickname = '닉네임은 2~12자로 입력해 주세요.';
      } else {
        const nicknameOk = /^[a-zA-Z0-9가-힣_]+$/.test(trimmedNickname);
        if (!nicknameOk) next.nickname = '닉네임은 한글/영문/숫자/_ 만 사용 가능합니다.';
      }
    }

    if (trimmedNickname && takenNicknames.has(trimmedNickname.toLowerCase())) {
      next.nickname = '이미 사용 중인 닉네임입니다.';
    }

    if (password && password.length < 8) {
      next.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    if (password && passwordConfirm && password !== passwordConfirm) {
      next.password = '비밀번호가 일치하지 않습니다.';
      next.passwordConfirm = undefined;
    }

    if (trimmedAge) {
      const n = Number(trimmedAge);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        next.age = '나이는 숫자로 입력해 주세요.';
      } else if (n < 14 || n > 120) {
        next.age = '나이는 14~120 범위로 입력해 주세요.';
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
      });
      navigate(ROUTES.HOME);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '회원가입에 실패했습니다.';
      setErrors((prev) => ({ ...prev, email: errorMessage }));
    }
  };

  const showError = (key: keyof RegisterErrors) => hasSubmitted && !!errors[key];
  const borderColor = (key: keyof RegisterErrors) =>
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
              <div
                className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border"
                style={{ borderColor: borderColor('nickname') }}
              >
                <User className="w-5 h-5 text-gray-400" />
                <input
                  className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500"
                  placeholder="닉네임을 입력하세요"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setErrors((prev) => ({ ...prev, nickname: undefined }));
                  }}
                />
              </div>
              {showError('nickname') && (
                <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                  {errors.nickname}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">이메일 (아이디) *</label>
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
                    <option value="MALE" className="bg-black">남성</option>
                    <option value="FEMALE" className="bg-black">여성</option>
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
                  <option value="서울" className="bg-black">서울</option>
                  <option value="부산" className="bg-black">부산</option>
                  <option value="대구" className="bg-black">대구</option>
                  <option value="인천" className="bg-black">인천</option>
                  <option value="광주" className="bg-black">광주</option>
                  <option value="대전" className="bg-black">대전</option>
                  <option value="울산" className="bg-black">울산</option>
                  <option value="세종" className="bg-black">세종</option>
                  <option value="경기" className="bg-black">경기</option>
                  <option value="강원" className="bg-black">강원</option>
                  <option value="충북" className="bg-black">충북</option>
                  <option value="충남" className="bg-black">충남</option>
                  <option value="전북" className="bg-black">전북</option>
                  <option value="전남" className="bg-black">전남</option>
                  <option value="경북" className="bg-black">경북</option>
                  <option value="경남" className="bg-black">경남</option>
                  <option value="제주" className="bg-black">제주</option>
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
              className="w-full h-14 rounded-2xl bg-white text-black font-extrabold hover:bg-gray-100 transition-colors"
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