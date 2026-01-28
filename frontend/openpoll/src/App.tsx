import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/templates';
import { ErrorBoundary } from '@/components/templates/errorBoundary/ErrorBoundary';
import { LoadingSpinner } from '@/components/atoms/loadingSpinner/LoadingSpinner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import { VotingProvider } from '@/contexts/VotingContext';

// Lazy load all page components
const Home = lazy(() => import('@/pages/home').then(m => ({ default: m.Home })));
const MbtiIntro = lazy(() => import('@/pages/mbti').then(m => ({ default: m.MbtiIntro })));
const MbtiTest = lazy(() => import('@/pages/mbti').then(m => ({ default: m.MbtiTest })));
const MbtiResult = lazy(() => import('@/pages/mbti').then(m => ({ default: m.MbtiResult })));
const NewsList = lazy(() => import('@/pages/news').then(m => ({ default: m.NewsList })));
const NewsDetail = lazy(() => import('@/pages/news').then(m => ({ default: m.NewsDetail })));
const IssueList = lazy(() => import('@/pages/balance').then(m => ({ default: m.IssueList })));
const IssueDetail = lazy(() => import('@/pages/balance').then(m => ({ default: m.IssueDetail })));

export default function App() {
  return (
    <UserProvider>
      <VotingProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <Router>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="/mbti" element={<MbtiIntro />} />
                    <Route path="/mbti/test" element={<MbtiTest />} />
                    <Route path="/mbti/result/:type" element={<MbtiResult />} />
                    <Route path="/news" element={<NewsList />} />
                    <Route path="/news/:id" element={<NewsDetail />} />
                    <Route path="/balance" element={<IssueList />} />
                    <Route path="/balance/:id" element={<IssueDetail />} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </ErrorBoundary>
        </ThemeProvider>
      </VotingProvider>
    </UserProvider>
  );
}
