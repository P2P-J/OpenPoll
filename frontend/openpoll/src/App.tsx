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
import { ROUTES, STORAGE_KEYS } from "@/shared/constants";
import { useGTMPageView } from "@/hooks";

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
const About = lazy(() =>
  import("@/pages/legal").then((m) => ({ default: m.About })),
);
const Disclaimer = lazy(() =>
  import("@/pages/legal").then((m) => ({ default: m.Disclaimer })),
);
const BlogList = lazy(() =>
  import("@/pages/blog").then((m) => ({ default: m.BlogList })),
);
const BlogDetail = lazy(() =>
  import("@/pages/blog").then((m) => ({ default: m.BlogDetail })),
);
const NotFound = lazy(() =>
  import("@/pages/notFound").then((m) => ({ default: m.NotFound })),
);

function clearSocialPendingSession() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.removeItem(STORAGE_KEYS.SOCIAL_PROFILE_PENDING);
  localStorage.removeItem(STORAGE_KEYS.OAUTH_PROVIDER);
  window.dispatchEvent(new Event("storage"));
}

function GTMPageTracker() {
  useGTMPageView();
  return null;
}

function SocialProfilePendingGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isPending = localStorage.getItem(STORAGE_KEYS.SOCIAL_PROFILE_PENDING) === "1";

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
            <GTMPageTracker />
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
                    <Route path="/about" element={<About />} />
                    <Route path="/disclaimer" element={<Disclaimer />} />
                    <Route path="/blog" element={<BlogList />} />
                    <Route path="/blog/:slug" element={<BlogDetail />} />
                  </Route>
                  {/* 404 catch-all */}
                  <Route path="*" element={<NotFound />} />
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
