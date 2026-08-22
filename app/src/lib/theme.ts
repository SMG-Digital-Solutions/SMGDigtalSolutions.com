/**
 * Single source of truth for the theme localStorage key, shared between the
 * blocking inline script in Layout.astro (which applies the theme before
 * first paint, to avoid a flash of the wrong theme) and ThemeToggle.tsx
 * (which reads/writes it after hydration). Keeping this in one place means
 * the two can never drift out of sync with each other.
 */
export const THEME_STORAGE_KEY = 'smg-theme-preference';

export type ThemeMode = 'dark' | 'light';
