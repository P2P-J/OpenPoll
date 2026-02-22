import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, Users, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { ROUTES } from "@/shared/constants";
import { authApi } from "@/api";
import { useUser } from "@/contexts/UserContext";

type SocialSignupErrors = {
  nickname?: string;
  age?: string;
  gender?: string;
  region?: string;
};
const SOCIAL_PROFILE_PENDING_KEY = "social_profile_pending";

export function SocialSignup() {
  const navigate = useNavigate();
  const { refreshUser } = useUser();

  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [region, setRegion] = useState("");

  const [errors, setErrors] = useState<SocialSignupErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancelPendingSignup = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("openpoll_session_v1");
    localStorage.removeItem(SOCIAL_PROFILE_PENDING_KEY);
    localStorage.removeItem("oauthProvider");
    localStorage.removeItem("isOAuthUser");
    window.dispatchEvent(new Event("storage"));
    window.location.replace(ROUTES.HOME);
  };

  useEffect(() => {
    const isPending = localStorage.getItem(SOCIAL_PROFILE_PENDING_KEY) === "1";
    if (!isPending) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    window.history.pushState({ socialSignupTrap: true }, "", window.location.href);
    const onPopState = () => {
      cancelPendingSignup();
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const validate = () => {
    const next: SocialSignupErrors = {};
    const trimmedNickname = nickname.trim();
    const trimmedAge = age.trim();

    if (!trimmedNickname) next.nickname = "닉네임을 입력해 주세요.";
    if (!trimmedAge) next.age = "나이를 입력해 주세요.";
    if (!gender) next.gender = "성별을 선택해 주세요.";
    if (!region) next.region = "지역을 선택해 주세요.";

    if (trimmedNickname) {
      if (trimmedNickname.length < 2 || trimmedNickname.length > 12) {
        next.nickname = "닉네임은 2~12자로 입력해 주세요.";
      }
    }

    if (trimmedAge) {
      const n = Number(trimmedAge);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        next.age = "나이는 숫자로 입력해 주세요.";
      } else if (n < 14 || n > 120) {
        next.age = "나이는 14~120 범위로 입력해 주세요.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setSubmitError(null);
    if (!validate()) return;

    const payload = {
      nickname: nickname.trim(),
      age: Number(age),
      gender: gender as "MALE" | "FEMALE",
      region,
    };

    try {
      setIsSubmitting(true);
      const data = await authApi.completeSocialProfile(payload);

      if (data) {
        if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

        const session = {
          nickname: data.user.nickname,
          email: data.user.email,
          points: data.user.points,
        };
        localStorage.setItem("openpoll_session_v1", JSON.stringify(session));
        window.dispatchEvent(new Event("storage"));
      }

      localStorage.removeItem(SOCIAL_PROFILE_PENDING_KEY);
      await refreshUser();
      navigate(ROUTES.HOME);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "가입 완료 처리에 실패했습니다.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showError = (key: keyof SocialSignupErrors) => hasSubmitted && !!errors[key];
  const borderColor = (key: keyof SocialSignupErrors) =>
    showError(key) ? "#ef4444" : "rgba(255,255,255,0.10)";

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#000",
        color: "#fff",
        overflowY: "scroll",
        overscrollBehaviorY: "contain",
      }}
    >
      <div style={{ paddingTop: 120, paddingBottom: 120, paddingLeft: 16, paddingRight: 16 }}>
        <motion.div
          style={{ width: 450, maxWidth: "100%", margin: "0 auto" }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h1 className="text-4xl font-extrabold text-center mb-2">추가정보 입력</h1>
          <p className="text-center text-gray-400 mb-10">
            소셜 로그인 완료! 가입을 마무리해 주세요
          </p>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">닉네임 *</label>
              <div
                className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border"
                style={{ borderColor: borderColor("nickname") }}
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
              {showError("nickname") && (
                <p className="mt-2 text-xs" style={{ color: "#ef4444" }}>
                  {errors.nickname}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">나이 *</label>
                <div
                  className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border"
                  style={{ borderColor: borderColor("age") }}
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
                {showError("age") && (
                  <p className="mt-2 text-xs" style={{ color: "#ef4444" }}>
                    {errors.age}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">성별 *</label>
                <div
                  className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border"
                  style={{ borderColor: borderColor("gender") }}
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
                    <option value="" className="bg-black">
                      선택하세요
                    </option>
                    <option value="MALE" className="bg-black">
                      남성
                    </option>
                    <option value="FEMALE" className="bg-black">
                      여성
                    </option>
                  </select>
                </div>
                {showError("gender") && (
                  <p className="mt-2 text-xs" style={{ color: "#ef4444" }}>
                    {errors.gender}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">지역 *</label>
              <div
                className="flex items-center gap-3 h-14 rounded-2xl bg-white/5 px-4 border"
                style={{ borderColor: borderColor("region") }}
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
                  <option value="" className="bg-black">
                    거주 지역을 선택하세요
                  </option>
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
              {showError("region") && (
                <p className="mt-2 text-xs" style={{ color: "#ef4444" }}>
                  {errors.region}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-white text-black font-extrabold transition-all duration-200 hover:bg-gray-100 hover:brightness-95 hover:shadow-[0_10px_30px_rgba(255,255,255,0.12)] hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {isSubmitting ? "처리 중..." : "가입 완료"}
            </button>

            {submitError && (
              <p className="text-xs" style={{ color: "#ef4444" }}>
                {submitError}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
