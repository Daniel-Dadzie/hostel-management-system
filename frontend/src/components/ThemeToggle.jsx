import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'hms.theme';

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const next = useMemo(() => (theme === 'dark' ? 'light' : 'dark'), [theme]);

  return (
    <button type="button" className="btn-ghost" onClick={() => setTheme(next)}>
      Theme: {theme} (switch to {next})
    </button>
  );
}
