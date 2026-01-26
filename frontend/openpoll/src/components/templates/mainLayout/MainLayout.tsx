import { Outlet } from 'react-router-dom';
import { Header } from '@/components/organisms/header';
import { Navigation } from '@/components/organisms/navigation';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <main className="pb-20">
        <Outlet />
      </main>
    </div>
  );
}
