import { Outlet } from 'react-router-dom';
import { Header } from '@/components/organisms/header';
import { Navigation } from '@/components/organisms/navigation';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-3 focus:bg-black focus:text-white focus:rounded-br-lg"
      >
        본문으로 건너뛰기
      </a>
      <Header />
      <Navigation />
      <main id="main-content" className="pb-20 sm:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
