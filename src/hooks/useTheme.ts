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
    let initialTheme: Theme = 'light';
    try {
      const saved = Taro.getStorageSync<Theme>('theme');
      if (saved === 'dark' || saved === 'light') {
        initialTheme = saved;
      } else {
        const systemInfo = Taro.getSystemInfoSync();
        if (systemInfo.theme === 'dark') {
          initialTheme = 'dark';
        }
      }
    } catch {
      // ignore
    }
    setTheme(initialTheme);
    applyThemeClass(initialTheme);
  }, []);

  useEffect(() => {
    try {
      Taro.setStorageSync('theme', theme);
    } catch {
      // ignore
    }
    applyThemeClass(theme);
  }, [theme]);

  useEffect(() => {
    const listener = Taro.onThemeChange((res) => {
      setTheme(res.theme === 'dark' ? 'dark' : 'light');
    });
    return () => {
      if (typeof listener === 'function') {
        listener();
      }
    };
  }, []);

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
