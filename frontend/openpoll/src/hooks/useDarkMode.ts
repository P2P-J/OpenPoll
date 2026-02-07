import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

/**
 * Custom hook for managing dark mode
 * Supports light, dark, and system theme preferences
 * Persists theme choice to localStorage
 */
export function useDarkMode() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';

    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'light';
  });

  // Render-time에서 isDark 계산 (React 권장 패턴)
  const shouldBeDark = theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' &&
     window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [isDark, setIsDark] = useState(shouldBeDark);

  if (shouldBeDark !== isDark) {
    setIsDark(shouldBeDark);
  }

  // Effect는 DOM 조작만 담당
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', theme);
  }, [theme, isDark]);

  // Listen to system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      if (e.matches) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        setIsDark(true);
      } else {
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        setIsDark(false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      // If system, toggle based on current appearance
      return isDark ? 'light' : 'dark';
    });
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
  };
}
