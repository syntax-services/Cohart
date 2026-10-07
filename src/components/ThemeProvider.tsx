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
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [fontSize, setFontSizeState] = useState<FontSizeScale>('normal');
  const [mounted, setMounted] = useState(false);

  // Initialize theme and font scale from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cohart_theme') as Theme | null;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      setThemeState(saved);
    } else {
      setThemeState('system');
    }

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

  // Compute and apply resolved theme
  useEffect(() => {
    if (!mounted) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      let resolved: ResolvedTheme = 'dark';
      if (theme === 'system') {
        resolved = media.matches ? 'dark' : 'light';
      } else {
        resolved = theme;
      }

      setResolvedTheme(resolved);

      const root = document.documentElement;
      if (resolved === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme();

    // Listen for OS theme changes when in 'system' mode
    const listener = () => {
      if (theme === 'system') applyTheme();
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('cohart_theme', newTheme);
  };

  const setFontSize = (newSize: FontSizeScale) => {
    setFontSizeState(newSize);
    localStorage.setItem('cohart_font_size', newSize);
    document.documentElement.setAttribute('data-font-size', newSize);
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
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
