import { MoonStars, Sun } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

const THEME_KEY = 'smg-theme-preference';

type ThemeMode = 'dark' | 'light';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const prefersReducedMotion = useReducedMotion();

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
    <motion.button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={theme === 'dark'}
      animate={{ rotate: theme === 'dark' ? 180 : 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <span className="relative h-5 w-5">
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
          animate={
            theme === 'dark'
              ? { opacity: 1, scale: 1, rotate: 0 }
              : { opacity: 0, scale: 0.65, rotate: -60 }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <Sun size={18} weight="bold" />
        </motion.span>

        <motion.span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
          animate={
            theme === 'dark'
              ? { opacity: 0, scale: 0.65, rotate: 60 }
              : { opacity: 1, scale: 1, rotate: 0 }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <MoonStars size={18} weight="bold" />
        </motion.span>
      </span>
    </motion.button>
  );
}
