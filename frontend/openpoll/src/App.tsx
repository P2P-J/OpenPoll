import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/atoms/themeToggle/ThemeToggle';
import { ROUTES } from '@/shared/constants';
import { getSession, logout } from '@/shared/utils/localAuth';

type SessionUser = {
  nickname: string;
  email: string;
  points: number;
};

export function Header() {
  const [session, setSession] = useState<SessionUser | null>(() => getSession() as SessionUser | null);

  useEffect(() => {
    const sync = () => setSession(getSession() as SessionUser | null);
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={ROUTES.HOME} className="flex items-center space-x-2 group">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-smooth">
              <span className="text-white font-bold text-base sm:text-lg">O</span>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">OpenPoll</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {!session ? (
              <div className="flex items-center space-x-3">
                <Link to={ROUTES.LOGIN} className="text-sm font-semibold hover:opacity-80">
                  로그인
                </Link>
                <Link to={ROUTES.REGISTER} className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-900">
                  회원가입
                </Link>
              </div>
            ) : (
              <>
                <Link to={ROUTES.PROFILE} className="text-sm font-semibold hover:opacity-80">
                  내 정보
                </Link>
                <button onClick={handleLogout} className="text-sm font-semibold hover:opacity-80">
                  로그아웃
                </button>
                <motion.div className="flex items-center space-x-2 px-4 py-2 rounded-full" whileHover={{ scale: 1.05 }}>
                  <Coins className="w-4 h-4" />
                  <span className="text-sm font-semibold">{session.points}P</span>
                </motion.div>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}