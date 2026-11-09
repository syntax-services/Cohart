'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Palette,
  IconPack,
  FontScale,
  FontFamily,
  ThemeConfig,
  getInitialThemeConfig,
  applyPalette,
  applyIconPack,
  applyFontFamily,
  applyGlassSettings,
  applySpaceMode,
  injectCustomStyle,
} from '@/lib/theme';

export type Theme = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export type FontSizeScale = FontScale;

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  fontSize: FontSizeScale;
  palette: Palette;
  customHex: string;
  iconPack: IconPack;
  fontFamily: FontFamily;
  glassTransparency: number;
  glassBlur: number;
  spaceMode: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setFontSize: (size: FontSizeScale) => void;
  setPalette: (palette: Palette, customHex?: string) => void;
  setCustomHex: (hex: string) => void;
  setIconPack: (pack: IconPack) => void;
  setFontFamily: (family: FontFamily) => void;
  setGlassSettings: (transparency: number, blur: number) => void;
  setSpaceMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<Theme>('dark');
  const [resolvedTheme] = useState<ResolvedTheme>('dark');
  const [config, setConfig] = useState<ThemeConfig>(getInitialThemeConfig);

  // Initialize all theme attributes and listeners on mount
  useEffect(() => {
    // Enforce dark mode
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.style.colorScheme = 'dark';
    localStorage.setItem('cohart_theme', 'dark');

    const initial = getInitialThemeConfig();
    setConfig(initial);
    applyPalette(initial.palette, initial.customHex);
    applyIconPack(initial.iconPack);
    applyFontFamily(initial.fontFamily);
    applyGlassSettings(initial.glassTransparency, initial.glassBlur);
    applySpaceMode(initial.spaceMode);
    document.documentElement.setAttribute('data-font-size', initial.fontScale);

    // iOS 27 Liquid Glass Device Tilt & Gyroscope / Cursor Calibration Listener
    const handlePointerMove = (e: MouseEvent) => {
      const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
      const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;
      const tiltX = (-yRatio * 4).toFixed(2) + 'deg';
      const tiltY = (xRatio * 4).toFixed(2) + 'deg';
      const specX = ((e.clientX / window.innerWidth) * 100).toFixed(1) + '%';
      const specY = ((e.clientY / window.innerHeight) * 100).toFixed(1) + '%';

      document.documentElement.style.setProperty('--tilt-x', tiltX);
      document.documentElement.style.setProperty('--tilt-y', tiltY);
      document.documentElement.style.setProperty('--specular-x', specX);
      document.documentElement.style.setProperty('--specular-y', specY);
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      // beta is front-to-back tilt (-180 to 180), gamma is left-to-right (-90 to 90)
      const tiltX = Math.max(-8, Math.min(8, (e.beta - 45) * 0.25)).toFixed(2) + 'deg';
      const tiltY = Math.max(-8, Math.min(8, e.gamma * 0.25)).toFixed(2) + 'deg';
      const specX = (50 + Math.max(-40, Math.min(40, e.gamma))).toFixed(1) + '%';
      const specY = (50 + Math.max(-40, Math.min(40, e.beta - 45))).toFixed(1) + '%';

      document.documentElement.style.setProperty('--tilt-x', tiltX);
      document.documentElement.style.setProperty('--tilt-y', tiltY);
      document.documentElement.style.setProperty('--specular-x', specX);
      document.documentElement.style.setProperty('--specular-y', specY);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, []);

  const setTheme = () => {
    // Strictly Aurora Dark Obsidian
  };

  const toggleTheme = () => {
    // Strictly Aurora Dark Obsidian
  };

  const setFontSize = (newSize: FontSizeScale) => {
    setConfig((prev) => ({ ...prev, fontScale: newSize }));
    localStorage.setItem('cohart_font_size', newSize);
    document.documentElement.setAttribute('data-font-size', newSize);
  };

  const setPalette = (palette: Palette, customHex?: string) => {
    setConfig((prev) => ({
      ...prev,
      palette,
      customHex: customHex || prev.customHex,
    }));
    applyPalette(palette, customHex);
  };

  const setCustomHex = (hex: string) => {
    setConfig((prev) => ({ ...prev, customHex: hex, palette: 'custom' }));
    injectCustomStyle(hex);
    applyPalette('custom', hex);
  };

  const setIconPack = (pack: IconPack) => {
    setConfig((prev) => ({ ...prev, iconPack: pack }));
    applyIconPack(pack);
  };

  const setFontFamily = (family: FontFamily) => {
    setConfig((prev) => ({ ...prev, fontFamily: family }));
    applyFontFamily(family);
  };

  const setGlassSettings = (transparency: number, blur: number) => {
    setConfig((prev) => ({ ...prev, glassTransparency: transparency, glassBlur: blur }));
    applyGlassSettings(transparency, blur);
  };

  const setSpaceMode = (enabled: boolean) => {
    setConfig((prev) => ({ ...prev, spaceMode: enabled }));
    applySpaceMode(enabled);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        fontSize: config.fontScale,
        palette: config.palette,
        customHex: config.customHex,
        iconPack: config.iconPack,
        fontFamily: config.fontFamily,
        glassTransparency: config.glassTransparency,
        glassBlur: config.glassBlur,
        spaceMode: config.spaceMode,
        setTheme,
        toggleTheme,
        setFontSize,
        setPalette,
        setCustomHex,
        setIconPack,
        setFontFamily,
        setGlassSettings,
        setSpaceMode,
      }}
    >
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
