import { MoonStars, Sun } from '@phosphor-icons/react';
import { motion, MotionConfig } from 'framer-motion';
import { useEffect, useState } from 'react';
import { THEME_STORAGE_KEY, type ThemeMode } from '../lib/theme';

const applyTheme = (theme: ThemeMode) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.setAttribute('data-theme', theme);
};

/**
 * Light/dark mode toggle. The *initial* theme (stored choice → OS
 * preference → light default) is resolved by a blocking inline script in
 * Layout.astro before this component ever hydrates, so the page itself is
 * already in the right theme from first paint regardless of when this
 * component hydrates. This component just mirrors that into React state on
 * mount, purely to drive its own icon/label — it deliberately does that in
 * a `useEffect` rather than a `useState` initializer, because this
 * component is also rendered server-side (Astro SSR, where `document`
 * doesn't exist) and a client render has to match that server output
 * exactly or React logs a hydration mismatch. The tradeoff is a
 * sub-frame-scale delay before the icon reflects the real theme on
 * mount, which isn't perceptible in practice.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

    // Until the visitor makes an explicit choice (via the toggle below),
    // keep following the OS/browser preference live — e.g. macOS switching
    // to dark mode at sunset should update the site too. Once they've
    // toggled at least once, that explicit choice sticks and this listener
    // is skipped on future mounts.
    let hasExplicitPreference = false;
    try {
      hasExplicitPreference = window.localStorage.getItem(THEME_STORAGE_KEY) !== null;
    } catch {
      // Storage unavailable — treat as "no explicit preference" and keep
      // following the OS setting for this session.
    }
    if (hasExplicitPreference) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      const nextTheme: ThemeMode = event.matches ? 'dark' : 'light';
      setTheme(nextTheme);
      applyTheme(nextTheme);
    };
    media.addEventListener('change', handleSystemThemeChange);
    return () => media.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Storage unavailable — the theme still applies for this page view,
      // it just won't persist (or override OS-live-sync) on the next visit.
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.button
        type="button"
        onClick={toggleTheme}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        aria-pressed={theme === 'dark'}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
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
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <MoonStars size={18} weight="bold" />
          </motion.span>
        </span>
      </motion.button>
    </MotionConfig>
  );
}
