import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/templates";
import { ErrorBoundary } from "@/components/templates/errorBoundary/ErrorBoundary";
import { LoadingSpinner } from "@/components/atoms/loadingSpinner/LoadingSpinner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import { VotingProvider } from "@/contexts/VotingContext";

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
const Profile = lazy(() =>
  import("@/pages/profile").then((m) => ({ default: m.Profile })),
);

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/register" element={<SignupPage />} /> {/* Redirect for backward compatibility */}
                <Route path="/dos/test" element={<DosTest />} />
                <Route path="/dos/result/:type" element={<DosResult />} />
                {/* Public routes with MainLayout */}
                <Route
                  path="/"
                  element={
                    <VotingProvider>
                      <MainLayout />
                    </VotingProvider>
                  }
                >
                  {/* All pages are now public */}
                  <Route index element={<Home />} />
                  <Route path="/dos" element={<DosIntro />} />
                  <Route path="/news" element={<NewsList />} />
                  <Route path="/news/:id" element={<NewsDetail />} />
                  <Route path="/balance" element={<BalanceList />} />
                  <Route path="/balance/:id" element={<BalanceDetail />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </UserProvider>
  );
}
