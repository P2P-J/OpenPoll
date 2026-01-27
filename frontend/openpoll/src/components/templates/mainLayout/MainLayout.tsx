import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/organisms/header';
import { Navigation } from '@/components/organisms/navigation';

export function MainLayout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={`min-h-screen ${isAuthPage ? 'bg-black' : 'bg-white'}`}>
      {!isAuthPage && <Header />}
      {!isAuthPage && <Navigation />}

      <main className={isAuthPage ? '' : 'pb-20'}>
        <Outlet />
      </main>
    </div>
  );
}