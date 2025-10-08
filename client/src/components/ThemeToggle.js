import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialDark = stored ? stored === 'dark' : prefersDark;
      setIsDark(initialDark);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    }
  }, [isDark]);

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setIsDark((v) => !v)}
      className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-secondary-300 text-secondary-700 hover:border-primary-400 hover:text-primary-600 transition-colors dark:border-secondary-700 dark:text-secondary-300 dark:hover:border-primary-500"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* simple sun/moon without extra deps */}
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.48 0l1.79-1.8-1.41-1.41-1.8 1.79 1.42 1.42zM12 4V1h-2v3h2zm0 19v-3h-2v3h2zm7-9h3v-2h-3v2zM4 12H1v-2h3v2zm12.24 7.16l1.8 1.79 1.41-1.41-1.79-1.8-1.42 1.42zM6.76 19.16l-1.79 1.8 1.41 1.41 1.8-1.79-1.42-1.42zM12 6a6 6 0 100 12 6 6 0 000-12z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M21.64 13a9 9 0 11-10.63-10.6 1 1 0 01.91 1.7A7 7 0 1019.9 12.7a1 1 0 011.74.9z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;


