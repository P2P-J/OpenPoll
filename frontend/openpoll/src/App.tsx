import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { MotionConfig } from "motion/react";
import { MainLayout } from "@/components/templates";
import { ErrorBoundary } from "@/components/templates/errorBoundary/ErrorBoundary";
import { LoadingSpinner } from "@/components/atoms/loadingSpinner/LoadingSpinner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import { VotingProvider } from "@/contexts/VotingContext";
import { NewsProvider } from "@/contexts/NewsContext";
import { ROUTES } from "@/shared/constants";

// Lazy load all page components
const Home = lazy(() =>
  import("@/pages/home").then((m) => ({ default: m.Home })),
);
const DosIntro = lazy(() =>
  import("@/pages/dos").then((m) => ({ default: m.DosIntro })),
);
const DosTest = lazy(() =>
  import("@/pages/dos").then((m) => ({ default: m.DosTest })),
);
const DosResult = lazy(() =>
  import("@/pages/dos").then((m) => ({ default: m.DosResult })),
);
const DosShare = lazy(() =>
  import("@/pages/dos").then((m) => ({ default: m.DosShare })),
);
const NewsList = lazy(() =>
  import("@/pages/news").then((m) => ({ default: m.NewsList })),
);
const NewsDetail = lazy(() =>
  import("@/pages/news").then((m) => ({ default: m.NewsDetail })),
);
const BalanceList = lazy(() =>
  import("@/pages/balance").then((m) => ({ default: m.BalanceList })),
);
const BalanceDetail = lazy(() =>
  import("@/pages/balance").then((m) => ({ default: m.BalanceDetail })),
);
const LoginPage = lazy(() =>
  import("@/pages/auth").then((m) => ({ default: m.LoginPage })),
);
const SignupPage = lazy(() =>
  import("@/pages/auth").then((m) => ({ default: m.SignupPage })),
);
const SocialSignupPage = lazy(() =>
  import("@/pages/auth").then((m) => ({ default: m.SocialSignup })),
);
const OAuthCallbackPage = lazy(() =>
  import("@/pages/auth").then((m) => ({ default: m.OAuthCallbackPage })),
);
const Profile = lazy(() =>
  import("@/pages/profile").then((m) => ({ default: m.Profile })),
);
const PrivacyPolicy = lazy(() =>
  import("@/pages/legal").then((m) => ({ default: m.PrivacyPolicy })),
);
const TermsOfService = lazy(() =>
  import("@/pages/legal").then((m) => ({ default: m.TermsOfService })),
);
const Components = lazy(() =>
  import("@/pages/components").then((m) => ({ default: m.Components })),
);
const SOCIAL_PROFILE_PENDING_KEY = "social_profile_pending";

function clearSocialPendingSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("openpoll_session_v1");
  localStorage.removeItem(SOCIAL_PROFILE_PENDING_KEY);
  localStorage.removeItem("oauthProvider");
  window.dispatchEvent(new Event("storage"));
}

function SocialProfilePendingGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isPending = localStorage.getItem(SOCIAL_PROFILE_PENDING_KEY) === "1";

  if (!isPending) return <>{children}</>;

  const allowPaths = [ROUTES.SOCIAL_SIGNUP] as const;
  if (allowPaths.includes(location.pathname as (typeof allowPaths)[number])) {
    return <>{children}</>;
  }

  // 뒤로가기(POP)로 이탈하면 가입 플로우를 취소하고 홈으로 보냄
  if (navigationType === "POP") {
    clearSocialPendingSession();
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Navigate to={ROUTES.SOCIAL_SIGNUP} replace />;
}

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
        <ErrorBoundary>
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <SocialProfilePendingGuard>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/register" element={<SignupPage />} /> {/* Redirect for backward compatibility */}
                  <Route path="/auth/social-signup" element={<SocialSignupPage />} />
                  <Route path="/auth/oauth/callback" element={<OAuthCallbackPage />} />
                  <Route path="/dos/test" element={<DosTest />} />
                  <Route path="/dos/result/:type" element={<DosResult />} />
                  <Route path="/dos/share/:type" element={<DosShare />} />
                  {/* Public routes with MainLayout */}
                  <Route path="/" element={<MainLayout />}>
                    {/* Home — only route that needs VotingProvider (SSE) */}
                    <Route index element={<VotingProvider><Home /></VotingProvider>} />
                    <Route path="/dos" element={<DosIntro />} />
                    {/* News routes — scoped NewsProvider keeps data across list↔detail */}
                    <Route element={<NewsProvider><Outlet /></NewsProvider>}>
                      <Route path="/news" element={<NewsList />} />
                      <Route path="/news/:id" element={<NewsDetail />} />
                    </Route>
                    <Route path="/balance" element={<BalanceList />} />
                    <Route path="/balance/:id" element={<BalanceDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/components" element={<Components />} />
                  </Route>
                </Routes>
              </SocialProfilePendingGuard>
            </Suspense>
          </Router>
        </ErrorBoundary>
        </MotionConfig>
      </ThemeProvider>
    </UserProvider>
  );
}
