'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export type FontSizeScale = 'compact' | 'normal' | 'comfortable';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  fontSize: FontSizeScale;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setFontSize: (size: FontSizeScale) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme] = useState<ResolvedTheme>('dark');
  const [fontSize, setFontSizeState] = useState<FontSizeScale>('normal');
  const [, setMounted] = useState(false);

  // Initialize theme and font scale from localStorage
  useEffect(() => {
    localStorage.setItem('cohart_theme', 'dark');
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.style.colorScheme = 'dark';

    const savedFont = localStorage.getItem('cohart_font_size') as FontSizeScale | null;
    if (savedFont && (savedFont === 'compact' || savedFont === 'normal' || savedFont === 'comfortable')) {
      setFontSizeState(savedFont);
      document.documentElement.setAttribute('data-font-size', savedFont);
    } else {
      setFontSizeState('normal');
      document.documentElement.setAttribute('data-font-size', 'normal');
    }

    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState('dark');
    localStorage.setItem('cohart_theme', 'dark');
  };

  const setFontSize = (newSize: FontSizeScale) => {
    setFontSizeState(newSize);
    localStorage.setItem('cohart_font_size', newSize);
    document.documentElement.setAttribute('data-font-size', newSize);
  };

  const toggleTheme = () => {
    // Pure Aurora design is strictly dark mode only
    setThemeState('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, fontSize, setTheme, toggleTheme, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
