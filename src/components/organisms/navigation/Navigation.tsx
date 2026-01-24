import { NavLink } from 'react-router-dom';
import { Brain, Newspaper, Scale, Home } from 'lucide-react';

const navItems = [
  { icon: Home, label: '홈', path: '/' },
  { icon: Brain, label: '정치 MBTI', path: '/mbti' },
  { icon: Scale, label: '밸런스 게임', path: '/balance' },
  { icon: Newspaper, label: '뉴스', path: '/news' },
];

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 sm:hidden">
      <div className="grid grid-cols-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-3 space-y-1 transition-colors ${
                isActive ? 'text-black' : 'text-gray-400'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
