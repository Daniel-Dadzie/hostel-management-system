import { useEffect, useMemo, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

const STORAGE_KEY = 'hms.theme';

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const next = useMemo(() => (theme === 'dark' ? 'light' : 'dark'), [theme]);
  const isDark = theme === 'dark';

  function handleToggleTheme() {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    globalThis.setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 350);
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      onClick={handleToggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <FaSun aria-hidden="true" className="text-lg text-accent-500" />
      ) : (
        <FaMoon aria-hidden="true" className="text-xl text-neutral-950" />
      )}
    </button>
  );
}
