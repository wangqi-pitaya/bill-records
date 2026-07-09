import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';

export type Theme = 'light' | 'dark';

function applyThemeClass(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;
  if (theme === 'dark') {
    root.classList.add('dark');
    body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    body.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    try {
      const saved = Taro.getStorageSync<Theme>('theme');
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved);
        applyThemeClass(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    Taro.setStorageSync('theme', theme);
    applyThemeClass(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };
}
