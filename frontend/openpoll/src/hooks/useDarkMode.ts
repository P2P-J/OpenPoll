import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

/**
 * Custom hook for managing dark mode
 * Supports light, dark, and system theme preferences
 * Persists theme choice to localStorage
 */
export function useDarkMode() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';

    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'system';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Determine if dark mode should be enabled
    let shouldBeDark = false;

    if (theme === 'dark') {
      shouldBeDark = true;
    } else if (theme === 'system') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Apply theme
    if (shouldBeDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    }

    setIsDark(shouldBeDark);

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

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
