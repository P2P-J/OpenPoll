import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/atoms/themeToggle/ThemeToggle';
import { ROUTES } from '@/shared/constants';
import { getSession } from '@/shared/utils/localAuth';
import { useUser } from '@/contexts/UserContext';

type SessionUser = {
  nickname: string;
  email: string;
  points: number;
};

export interface HeaderProps {
  points?: number;
  isLoggedIn?: boolean;
}

export function Header({ points: propPoints = 500, isLoggedIn = false }: HeaderProps) {
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionUser | null>(() => getSession() as SessionUser | null);
  const { user, logout } = useUser();

  useEffect(() => {
    const sync = () => setSession(getSession() as SessionUser | null);
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const computedIsLoggedIn = !!user || !!session || isLoggedIn;
  // Use UserContext points (real-time) if available, otherwise fallback to session or props
  const computedPoints = user?.points ?? session?.points ?? propPoints;
  // Use UserContext nickname if available, otherwise fallback to session
  const userNickname = user?.nickname ?? session?.nickname;

  // Color coding based on points
  const isLowPoints = computedPoints < 25;
  const isCriticalPoints = computedPoints < 5;

  const getPointsColor = () => {
    if (isCriticalPoints) return 'text-red-600 dark:text-red-400';
    if (isLowPoints) return 'text-yellow-600 dark:text-yellow-400';
    return '';
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Clear local session
      setSession(null);
      window.dispatchEvent(new Event('storage'));
      // Redirect to home page
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to={ROUTES.HOME}
            className="flex items-center space-x-2 group"
            aria-label="OpenPoll 홈으로 이동"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-smooth">
              <span className="text-white font-bold text-base sm:text-lg" aria-hidden="true">O</span>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight transition-colors duration-300">
              OpenPoll
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {!computedIsLoggedIn ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm font-semibold hover:opacity-80 transition-opacity"
                >
                  로그인
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-900 transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-100"
                >
                  회원가입
                </Link>
              </div>
            ) : (
              <>
                {userNickname && (
                  <span className="text-sm font-semibold hidden sm:inline">
                    {userNickname}님
                  </span>
                )}

                <motion.div
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 hover-lift ${
                    isCriticalPoints
                      ? 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700'
                      : isLowPoints
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700'
                      : ''
                  }`}
                  style={!isLowPoints && !isCriticalPoints ? {
                    backgroundColor: 'var(--color-secondary)',
                    color: 'var(--color-secondary-foreground)'
                  } : {}}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Coins className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 hover:rotate-12 ${getPointsColor()}`} />
                  <motion.span
                    key={computedPoints}
                    className={`text-xs sm:text-sm font-semibold ${getPointsColor()}`}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {computedPoints.toLocaleString()}P
                  </motion.span>
                </motion.div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-semibold hover:opacity-80 transition-opacity"
                >
                  로그아웃
                </button>
              </>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}