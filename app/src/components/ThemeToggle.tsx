import { MoonStars, Sun } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

const THEME_KEY = 'smg-theme-preference';

type ThemeMode = 'dark' | 'light';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme ?? (prefersDark ? 'dark' : 'light');

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.documentElement.setAttribute('data-theme', nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/10 text-white text-sm transition hover:bg-white/20"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={theme === 'dark'}
    >
      {theme === 'dark' ? (
        <Sun size={16} weight="bold" />
      ) : (
        <MoonStars size={16} weight="bold" />
      )}
    </button>
  );
}
