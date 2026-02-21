import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { authApi } from "@/api";
import { ROUTES } from "@/shared/constants";
import { useUser } from "@/contexts/UserContext";
import googleLogo from "@/img/google-logo.svg";
import naverLogo from "@/img/naver-logo.svg";

type OAuthProvider = "google" | "naver";
const SOCIAL_PROFILE_PENDING_KEY = "social_profile_pending";

type CallbackState =
  | { phase: "loading"; message: string }
  | { phase: "error"; message: string; code?: number; provider?: OAuthProvider };

function isProvider(v: string | null): v is OAuthProvider {
  return v === "google" || v === "naver";
}

export function OAuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [state, setState] = useState<CallbackState>({
    phase: "loading",
    message: "소셜 로그인 처리 중입니다...",
  });
  const [showLoadingUi, setShowLoadingUi] = useState(false);

  const oauthBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const code = query.get("code");
  const oauthState = query.get("state");
  const queryProvider = query.get("provider");
  const localProvider = localStorage.getItem("oauthProvider");
  const provider = (isProvider(queryProvider) ? queryProvider : localProvider) as
    | OAuthProvider
    | null;

  const startOAuth = useCallback((targetProvider: OAuthProvider, mode?: "rejoin") => {
    localStorage.setItem("oauthProvider", targetProvider);
    const modeQuery = mode ? `?mode=${mode}` : "";
    window.location.href = `${oauthBaseUrl}/auth/oauth/${targetProvider}${modeQuery}`;
  }, [oauthBaseUrl]);

  useEffect(() => {
    const run = async () => {
      if (!code || !oauthState || !provider) {
        setState({
          phase: "error",
          code: 400,
          provider: provider ?? undefined,
          message: "필수 인증 정보가 없습니다. 다시 소셜 로그인 해주세요.",
        });
        return;
      }

      const callbackOnceKey = `oauth_callback_once:${provider}:${code}:${oauthState}`;
      if (sessionStorage.getItem(callbackOnceKey) === "1") {
        return;
      }
      sessionStorage.setItem(callbackOnceKey, "1");

      try {
        const data = await authApi.oauthCallback(provider, code, oauthState);

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.removeItem("oauthProvider");

        const session = {
          nickname: data.user.nickname,
          email: data.user.email,
          points: data.user.points,
        };
        localStorage.setItem("openpoll_session_v1", JSON.stringify(session));
        window.dispatchEvent(new Event("storage"));

        await refreshUser();

        if (!data.profileComplete) {
          localStorage.setItem(SOCIAL_PROFILE_PENDING_KEY, "1");
          navigate(ROUTES.SOCIAL_SIGNUP, { replace: true });
          return;
        }
        localStorage.removeItem(SOCIAL_PROFILE_PENDING_KEY);
        navigate(ROUTES.HOME, { replace: true });
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        const status = axiosErr?.response?.status;
        const message =
          axiosErr?.response?.data?.message ||
          (err instanceof Error ? err.message : "로그인 처리 중 오류가 발생했습니다.");
        const rejoinOnceKey = `oauth_rejoin_once:${provider}:${code}:${oauthState}`;

        if (
          provider &&
          (
            (status === 409 && message === "REJOIN_REQUIRED") ||
            (!status && axiosErr.message === "Network Error")
          )
        ) {
          if (sessionStorage.getItem(rejoinOnceKey) !== "1") {
            sessionStorage.setItem(rejoinOnceKey, "1");
            startOAuth(provider, "rejoin");
            return;
          }
        }

        if (status === 401) {
          setState({
            phase: "error",
            code: 401,
            provider,
            message: "OAuth state가 유효하지 않습니다. 다시 로그인 해주세요.",
          });
          return;
        }

        if (status === 400) {
          setState({
            phase: "error",
            code: 400,
            provider,
            message,
          });
          return;
        }

        setState({
          phase: "error",
          code: status,
          provider,
          message: message || "로그인 실패. 다시 시도해 주세요.",
        });
      }
    };

    run();
  }, [code, oauthState, provider, navigate, refreshUser, startOAuth]);

  const showLoadingUiDerived = useMemo(() => {
    return state.phase === "loading" && showLoadingUi;
  }, [state.phase, showLoadingUi]);

  useEffect(() => {
    if (state.phase !== "loading") return;

    const timer = window.setTimeout(() => {
      setShowLoadingUi(true);
    }, 450);

    return () => {
      setShowLoadingUi(false);
      window.clearTimeout(timer);
    };
  }, [state.phase]);

  if (state.phase === "loading") {
    if (!showLoadingUiDerived) return null;

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <p className="text-gray-400 text-xs">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div
        className="w-[min(520px,calc(100vw-32px))] origin-center rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
        style={{ transform: "scale(1.45)" }}
      >
        <h1 className="text-xl font-bold">소셜 로그인 오류</h1>
        <p className="text-sm text-gray-300">{state.message}</p>

        <div className="w-1/3 min-w-[170px] max-w-[220px] mx-auto space-y-2">
          <button
            type="button"
            onClick={() => startOAuth("google")}
            className="w-full h-10 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-sm flex items-center justify-center gap-2"
          >
            <img src={googleLogo} alt="구글" className="w-4 h-4" />
            구글 다시 시도
          </button>
          <button
            type="button"
            onClick={() => startOAuth("naver")}
            className="w-full h-10 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-sm flex items-center justify-center gap-2"
          >
            <img src={naverLogo} alt="네이버" className="w-4 h-4" />
            네이버 다시 시도
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.LOGIN)}
            className="w-full h-10 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
          >
            로그인 화면으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
