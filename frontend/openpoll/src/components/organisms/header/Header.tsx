import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { ROUTES } from '@/shared/constants';
import { getSession, logout } from '@/shared/utils/localAuth';

type SessionUser = {
  nickname: string;
  email: string;
  points: number;
};

export interface HeaderProps {
  points?: number;
  isLoggedIn?: boolean;
}

export function Header({ points = 500, isLoggedIn = false }: HeaderProps) {
  const [session, setSession] = useState<SessionUser | null>(() => getSession() as SessionUser | null);

  useEffect(() => {
    const sync = () => setSession(getSession() as SessionUser | null);
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const computedIsLoggedIn = !!session || isLoggedIn;
  const computedPoints = session?.points ?? points;

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base sm:text-lg">P</span>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">Politicus</span>
          </Link>

          <div className="flex items-center space-x-4 sm:space-x-6">
            {!computedIsLoggedIn ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm font-semibold text-gray-800 hover:opacity-80"
                >
                  로그인
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-900"
                >
                  회원가입
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to={ROUTES.PROFILE}
                  className="text-sm font-semibold text-gray-800 hover:opacity-80"
                >
                  내 정보
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-semibold text-gray-800 hover:opacity-80"
                >
                  로그아웃
                </button>

                <div className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-full">
                  <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                  <span className="text-xs sm:text-sm font-semibold">{computedPoints}P</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}