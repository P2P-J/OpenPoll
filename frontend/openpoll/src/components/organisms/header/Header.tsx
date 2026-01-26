import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';

export interface HeaderProps {
  points?: number;
}

export function Header({ points = 500 }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base sm:text-lg">P</span>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">Politicus</span>
          </Link>

          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-full">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
              <span className="text-xs sm:text-sm font-semibold">{points}P</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
