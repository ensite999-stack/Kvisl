'use client';

import { useEffect } from 'react';

export type ThemeName = 'light' | 'dark' | 'comfort';

export function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('kvisl-theme', theme);
}

export function ThemeProvider() {
  useEffect(() => {
    const saved = localStorage.getItem('kvisl-theme') as ThemeName | null;
    const theme = saved || 'light';
    document.documentElement.dataset.theme = theme;
  }, []);
  return null;
}
