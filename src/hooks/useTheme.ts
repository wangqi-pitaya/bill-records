import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    try {
      const saved = Taro.getStorageSync<Theme>('theme');
      if (saved) {
        setTheme(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    Taro.setStorageSync('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  };
}
