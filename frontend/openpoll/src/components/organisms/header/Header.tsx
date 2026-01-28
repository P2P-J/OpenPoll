import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/atoms/themeToggle/ThemeToggle';
import { useUser } from '@/contexts/UserContext';

export interface HeaderProps {
  points?: number;
}

export function Header() {
  const { points } = useUser();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
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
            <motion.div
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 hover-lift"
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-secondary-foreground)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 hover:rotate-12" />
              <motion.span
                key={points}
                className="text-xs sm:text-sm font-semibold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                {points}p
              </motion.span>
            </motion.div>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
