import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { authApi } from "@/api";
import { ROUTES } from "@/shared/constants";
import { useUser } from "@/contexts/UserContext";

type OAuthProvider = "google" | "naver";

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

  const oauthBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const code = query.get("code");
  const oauthState = query.get("state");
  const queryProvider = query.get("provider");
  const localProvider = localStorage.getItem("oauthProvider");
  const provider = (isProvider(queryProvider) ? queryProvider : localProvider) as
    | OAuthProvider
    | null;

  const startOAuth = (targetProvider: OAuthProvider, mode?: "rejoin") => {
    localStorage.setItem("oauthProvider", targetProvider);
    const modeQuery = mode ? `?mode=${mode}` : "";
    window.location.href = `${oauthBaseUrl}/auth/oauth/${targetProvider}${modeQuery}`;
  };

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
          navigate(ROUTES.SOCIAL_SIGNUP, { replace: true });
          return;
        }
        navigate(ROUTES.HOME, { replace: true });
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        const status = axiosErr?.response?.status;
        const message =
          axiosErr?.response?.data?.message ||
          (err instanceof Error ? err.message : "로그인 처리 중 오류가 발생했습니다.");

        if (status === 401) {
          setState({
            phase: "error",
            code: 401,
            provider,
            message: "OAuth state가 유효하지 않습니다. 다시 로그인 해주세요.",
          });
          return;
        }

        if (status === 409 && message === "REJOIN_REQUIRED") {
          setState({
            phase: "error",
            code: 409,
            provider,
            message: "탈퇴 이력 계정입니다. 재가입 모드로 진행해 주세요.",
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
  }, [code, oauthState, provider, navigate, refreshUser]);

  if (state.phase === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <p className="text-gray-300 text-sm">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h1 className="text-xl font-bold">소셜 로그인 오류</h1>
        <p className="text-sm text-gray-300">{state.message}</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => startOAuth("google")}
            className="flex-1 h-10 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
          >
            구글 다시 시도
          </button>
          <button
            type="button"
            onClick={() => startOAuth("naver")}
            className="flex-1 h-10 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
          >
            네이버 다시 시도
          </button>
        </div>

        {state.code === 409 && state.provider && (
          <button
            type="button"
            onClick={() => startOAuth(state.provider!, "rejoin")}
            className="w-full h-10 rounded-lg border border-yellow-400/40 bg-yellow-500/10 hover:bg-yellow-500/15 text-sm"
          >
            재가입 모드로 진행
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate(ROUTES.LOGIN)}
          className="w-full h-10 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
        >
          로그인 화면으로 이동
        </button>
      </div>
    </div>
  );
}

