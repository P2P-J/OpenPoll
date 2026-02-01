import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/organisms/header';
import { Navigation } from '@/components/organisms/navigation';

export function MainLayout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={`min-h-screen ${isAuthPage ? 'bg-black' : 'bg-white'}`}>
      {!isAuthPage && (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-3 focus:bg-black focus:text-white focus:rounded-br-lg"
        >
          본문으로 건너뛰기
        </a>
      )}

      {!isAuthPage && <Header />}
      {!isAuthPage && location.pathname !== '/mbti' && <Navigation />}

      <main
        id="main-content"
        className={isAuthPage || location.pathname === '/mbti' ? '' : 'pb-20 sm:pb-0'}
      >
        <Outlet />
      </main>
    </div>
  );
}