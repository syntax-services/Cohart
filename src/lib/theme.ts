/**
 * Cohart Theme & Dynamic Palette Engine
 * Inspired by String & Big-Tech Design Systems (Apple, Linear, Grok, Gemini)
 * Supports dynamic CSS variable injection, custom hex palettes,
 * liquid glass transparency, icon packs, and the Cosmic Extraterrestrial Space Engine.
 */

export type Palette = 'deepblue' | 'mono' | 'spacegrey' | 'emerald' | 'rose' | 'custom';
export type IconPack = 'minimal' | 'rounded' | 'cosmic';
export type FontScale = 'compact' | 'normal' | 'comfortable';
export type FontFamily = 'jakarta' | 'inter' | 'geist' | 'grotesk';

export interface ThemeConfig {
  palette: Palette;
  customHex: string;
  iconPack: IconPack;
  fontScale: FontScale;
  fontFamily: FontFamily;
  glassTransparency: number; // 50 to 95 (%)
  glassBlur: number; // 12 to 36 (px)
  spaceMode: boolean;
}

export const PRESET_PALETTES: {
  value: Palette;
  label: string;
  swatch: string;
  accent: string;
  desc: string;
}[] = [
  {
    value: 'deepblue',
    label: 'Deep Obsidian',
    swatch: '#3B82F6',
    accent: '#2563EB',
    desc: 'Gemini & ChatGPT-inspired obsidian dark mode with subtle starlight sapphire pops.',
  },
  {
    value: 'mono',
    label: 'Pure Titanium',
    swatch: '#E5E7EB',
    accent: '#FFFFFF',
    desc: 'Industrial monochrome, stark titanium edges, and laser-crisp contrast.',
  },
  {
    value: 'spacegrey',
    label: 'Space Craft',
    swatch: '#94A3B8',
    accent: '#64748B',
    desc: 'Supersonic fuselage grey (#0B0D11 base) with cosmic matte finishes.',
  },
  {
    value: 'emerald',
    label: 'Deep Moss',
    swatch: '#10B981',
    accent: '#059669',
    desc: 'Calm academic concentration, forest-green focus accents.',
  },
  {
    value: 'rose',
    label: 'Velvet Rose',
    swatch: '#F43F5E',
    accent: '#E11D48',
    desc: 'Warm nocturnal velvet tone for late-night reading sessions.',
  },
];

export const ICON_PACKS: { value: IconPack; label: string; desc: string }[] = [
  { value: 'rounded', label: 'Rounded Duo', desc: 'Futuristic stadium pill curves with smooth capsule contours.' },
  { value: 'minimal', label: 'Minimal Line', desc: 'Big-tech ultra-thin vector line work for zero distraction.' },
  { value: 'cosmic', label: 'Cosmic Star', desc: 'Extraterrestrial geometric accents with celestial vertex hints.' },
];

export const FONT_FAMILIES: { value: FontFamily; label: string; stack: string }[] = [
  { value: 'jakarta', label: 'Plus Jakarta Sans', stack: 'var(--font-sans), "Plus Jakarta Sans", sans-serif' },
  { value: 'inter', label: 'Inter Dynamic', stack: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' },
  { value: 'geist', label: 'InterGeist Mono-Sans', stack: '"Geist", "Inter", monospace, sans-serif' },
  { value: 'grotesk', label: 'Space Grotesk', stack: '"Space Grotesk", var(--font-sans), sans-serif' },
];

export function hexToHsl(hex: string): [number, number, number] {
  let cleaned = hex.replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function buildCustomPaletteCSS(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  const fg = l > 60 ? '#0B0D11' : '#FFFFFF';
  const glow = `hsla(${h}, ${Math.min(s, 70)}%, ${Math.min(Math.max(l, 45), 65)}%, 0.25)`;
  const subtle = `hsla(${h}, ${Math.min(s, 65)}%, ${Math.min(Math.max(l, 45), 65)}%, 0.12)`;
  const ring = `hsla(${h}, ${Math.min(s, 65)}%, ${Math.min(Math.max(l, 45), 65)}%, 0.4)`;

  return `
    [data-palette="custom"] {
      --primary-hsl: ${h} ${Math.min(s, 65)}% ${Math.min(Math.max(l, 45), 65)}%;
      --primary: hsla(${h}, ${Math.min(s, 65)}%, ${Math.min(Math.max(l, 45), 65)}%, 1);
      --primary-foreground: ${fg};
      --primary-glow: ${glow};
      --primary-subtle: ${subtle};
      --primary-ring: ${ring};
      --accent-color: ${hex};
    }
  `;
}

export function injectCustomStyle(hex: string) {
  if (typeof document === 'undefined') return;
  let el = document.getElementById('__cohart_custom_palette');
  if (!el) {
    el = document.createElement('style');
    el.id = '__cohart_custom_palette';
    document.head.appendChild(el);
  }
  el.textContent = buildCustomPaletteCSS(hex);
}

export function applyPalette(palette: Palette, customHex?: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-palette', palette);
  localStorage.setItem('cohart_theme_palette', palette);

  if (palette === 'custom') {
    const hex = customHex || localStorage.getItem('cohart_custom_hex') || '#3B82F6';
    injectCustomStyle(hex);
    localStorage.setItem('cohart_custom_hex', hex);
  }
}

export function applyIconPack(pack: IconPack) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-icon-pack', pack);
  localStorage.setItem('cohart_icon_pack', pack);
}

export function applyFontFamily(family: FontFamily) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-font-family', family);
  localStorage.setItem('cohart_font_family', family);
  const found = FONT_FAMILIES.find((f) => f.value === family);
  if (found) {
    document.documentElement.style.setProperty('--font-custom-stack', found.stack);
  }
}

export function applyGlassSettings(transparency: number, blur: number) {
  if (typeof document === 'undefined') return;
  const opacityRatio = (100 - transparency) / 100;
  // Alpha values for backgrounds
  const cardAlpha = Math.max(0.02, Math.min(0.20, opacityRatio * 0.12));
  const borderAlpha = Math.max(0.04, Math.min(0.25, opacityRatio * 0.18));
  
  document.documentElement.style.setProperty('--glass-card-bg', `rgba(255, 255, 255, ${cardAlpha.toFixed(3)})`);
  document.documentElement.style.setProperty('--glass-border', `rgba(255, 255, 255, ${borderAlpha.toFixed(3)})`);
  document.documentElement.style.setProperty('--glass-blur', `${blur}px`);
  
  localStorage.setItem('cohart_glass_transparency', String(transparency));
  localStorage.setItem('cohart_glass_blur', String(blur));
}

export function applySpaceMode(enabled: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-space-theme', enabled ? 'active' : 'inactive');
  localStorage.setItem('cohart_space_mode', enabled ? 'true' : 'false');
  if (enabled) {
    // When space mode is enabled, broadcast event so Space Canvas mounts immediately
    window.dispatchEvent(new CustomEvent('cohart_space_mode_toggle', { detail: { enabled: true } }));
  } else {
    window.dispatchEvent(new CustomEvent('cohart_space_mode_toggle', { detail: { enabled: false } }));
  }
}

export function getInitialThemeConfig(): ThemeConfig {
  if (typeof window === 'undefined') {
    return {
      palette: 'deepblue',
      customHex: '#3B82F6',
      iconPack: 'rounded',
      fontScale: 'normal',
      fontFamily: 'jakarta',
      glassTransparency: 85,
      glassBlur: 24,
      spaceMode: false,
    };
  }

  const palette = (localStorage.getItem('cohart_theme_palette') as Palette) || 'deepblue';
  const customHex = localStorage.getItem('cohart_custom_hex') || '#3B82F6';
  const iconPack = (localStorage.getItem('cohart_icon_pack') as IconPack) || 'rounded';
  const fontScale = (localStorage.getItem('cohart_font_size') as FontScale) || 'normal';
  const fontFamily = (localStorage.getItem('cohart_font_family') as FontFamily) || 'jakarta';
  const glassTransparency = Number(localStorage.getItem('cohart_glass_transparency')) || 85;
  const glassBlur = Number(localStorage.getItem('cohart_glass_blur')) || 24;
  const spaceMode = localStorage.getItem('cohart_space_mode') === 'true';

  return {
    palette,
    customHex,
    iconPack,
    fontScale,
    fontFamily,
    glassTransparency,
    glassBlur,
    spaceMode,
  };
}

export function initThemeEngine() {
  if (typeof window === 'undefined') return;
  const config = getInitialThemeConfig();
  applyPalette(config.palette, config.customHex);
  applyIconPack(config.iconPack);
  applyFontFamily(config.fontFamily);
  applyGlassSettings(config.glassTransparency, config.glassBlur);
  applySpaceMode(config.spaceMode);
}
