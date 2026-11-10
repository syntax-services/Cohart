'use client';

import React, { useState } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import {
  useTheme,
  FontSizeScale,
} from '@/components/ThemeProvider';
import {
  Palette,
  IconPack,
  FontFamily,
  PRESET_PALETTES,
  ICON_PACKS,
  FONT_FAMILIES,
} from '@/lib/theme';
import { COHART_VOICES, DEFAULT_COHART_VOICE } from '@/lib/types';

interface AppearanceCustomizerProps {
  onBack: () => void;
  onSaveToProfile?: (settings: { theme_palette?: string; custom_theme_hex?: string }) => Promise<void>;
}

export const AppearanceCustomizer: React.FC<AppearanceCustomizerProps> = ({
  onBack,
  onSaveToProfile,
}) => {
  const {
    palette,
    customHex,
    iconPack,
    fontSize,
    fontFamily,
    glassTransparency,
    glassBlur,
    spaceMode,
    setFontSize,
    setPalette,
    setCustomHex,
    setIconPack,
    setFontFamily,
    setGlassSettings,
    setSpaceMode,
  } = useTheme();

  const [hexInput, setHexInput] = useState(customHex);
  const [showColorPicker, setShowColorPicker] = useState(palette === 'custom');
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aurora_selected_voice') || DEFAULT_COHART_VOICE;
    }
    return DEFAULT_COHART_VOICE;
  });

  const handlePaletteSelect = async (p: Palette) => {
    setPalette(p);
    setShowColorPicker(p === 'custom');
    if (onSaveToProfile) {
      await onSaveToProfile({ theme_palette: p });
    }
  };

  const handleHexChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    setCustomHex(val);
    if (onSaveToProfile) {
      await onSaveToProfile({ theme_palette: 'custom', custom_theme_hex: val });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Sleek Sub-Page Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer group"
        >
          <GeminiIcon
            name="arrow-left"
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Profile</span>
        </button>
        <h2 className="text-sm font-bold text-white tracking-tight">Appearance & Space Lab</h2>
        <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
          Realtime
        </span>
      </div>

      {/* 
        ========================================================================
        1. COLOR PALETTE SWATCHES & CUSTOM PICKER (From String + Cohart Deep Blue)
        ========================================================================
      */}
      <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Theme Palette
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Default is mature obsidian & deep starlight sapphire.
            </p>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 capitalize">
            {palette}
          </span>
        </div>

        {/* Preset Swatches */}
        <div className="grid grid-cols-3 gap-2.5">
          {PRESET_PALETTES.map((p) => {
            const isActive = palette === p.value;
            return (
              <button
                key={p.value}
                onClick={() => handlePaletteSelect(p.value)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer relative group ${
                  isActive
                    ? 'border-white/40 bg-white/[0.08] shadow-lg ring-1 ring-white/30'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className="h-5 w-5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: p.swatch }}
                  />
                  {isActive && (
                    <div className="h-4 w-4 rounded-full bg-white flex items-center justify-center">
                      <GeminiIcon name="check" size={10} className="text-black" />
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-white block leading-tight">
                    {p.label}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Custom Hex Swatch */}
          <button
            onClick={() => handlePaletteSelect('custom')}
            className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer relative group ${
              palette === 'custom'
                ? 'border-white/40 bg-white/[0.08] shadow-lg ring-1 ring-white/30'
                : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className="h-5 w-5 rounded-full border border-white/20 shadow-xs"
                style={{
                  background:
                    palette === 'custom'
                      ? hexInput
                      : 'conic-gradient(from 0deg, #3B82F6, #10B981, #F43F5E, #94A3B8, #3B82F6)',
                }}
              />
              {palette === 'custom' && (
                <div className="h-4 w-4 rounded-full bg-white flex items-center justify-center">
                  <GeminiIcon name="check" size={10} className="text-black" />
                </div>
              )}
            </div>
            <span className="text-[11px] font-bold text-white block leading-tight">
              Custom Hex
            </span>
          </button>
        </div>

        {/* Custom Hex Color Picker Bar */}
        {showColorPicker && (
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3 animate-in fade-in">
            <input
              type="color"
              value={hexInput}
              onChange={handleHexChange}
              className="h-9 w-9 rounded-xl border border-white/20 cursor-pointer bg-transparent"
            />
            <div className="flex-1">
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                Hex Code
              </label>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                placeholder="#3B82F6"
                className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none uppercase"
              />
            </div>
            <span
              className="h-4 w-4 rounded-full border border-white/30"
              style={{ backgroundColor: hexInput }}
            />
          </div>
        )}
      </div>

      {/* 
        ========================================================================
        2. SPECIAL SPACE FEATURE ("COSMIC EXTRATERRESTRIAL LAB")
        Grok / xAI-inspired supersonic spacecraft, star grains, and warp HUD
        ========================================================================
      */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0F141D] to-[#0A0C10] border border-sky-500/20 p-5 space-y-4 shadow-xl relative overflow-hidden">
        {/* Subtle supersonic warp trail background accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Cosmic Extraterrestrial Lab
              </h3>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed max-w-[260px]">
              Activates microscopic star grains, supersonic craft warp physics, and iOS 27 liquid glass tilt calibration.
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => setSpaceMode(!spaceMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border ${
              spaceMode
                ? 'bg-sky-500 border-sky-400'
                : 'bg-white/10 border-white/20'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                spaceMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Space Flight HUD Telemetry Box */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2 relative">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-neutral-400">PROPULSION STATUS:</span>
            <span className={spaceMode ? 'text-sky-400 font-bold' : 'text-neutral-500'}>
              {spaceMode ? 'WARP ENGAGED // MACH 4.8' : 'STANDBY'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-neutral-400">3D LIQUID CALIBRATION:</span>
            <span className="text-emerald-400 font-bold">GYRO & POINTER ACTIVE</span>
          </div>
          <div className="text-[9.5px] text-neutral-500 font-mono pt-1 border-t border-white/[0.06]">
            Craft design inspired by Grok xAI supersonic delta-wing aerodynamics with starlight blue plasma plume.
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        3. LIQUID GLASS TRANSPARENCY & BLUR CALIBRATION
        ========================================================================
      */}
      <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 space-y-4 shadow-xl">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Liquid Glass Dynamics
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Adjust optical translucency and frosted backdrop blur.
          </p>
        </div>

        {/* Transparency Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-400">Glass Translucency</span>
            <span className="text-white font-bold">{glassTransparency}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            value={glassTransparency}
            onChange={(e) => setGlassSettings(Number(e.target.value), glassBlur)}
            className="w-full accent-white h-1.5 bg-white/10 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-neutral-500">
            <span>Frosted Solid (50%)</span>
            <span>Ultra Liquid Glass (95%)</span>
          </div>
        </div>

        {/* Blur Slider */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-400">Backdrop Blur Radius</span>
            <span className="text-white font-bold">{glassBlur}px</span>
          </div>
          <input
            type="range"
            min={12}
            max={36}
            value={glassBlur}
            onChange={(e) => setGlassSettings(glassTransparency, Number(e.target.value))}
            className="w-full accent-white h-1.5 bg-white/10 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* 
        ========================================================================
        4. BESPOKE ICON PACKS SELECTOR
        ========================================================================
      */}
      <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 space-y-3 shadow-xl">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Icon Pack Style
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Select icon geometry across study modules and navigation.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {ICON_PACKS.map((pack) => {
            const isSelected = iconPack === pack.value;
            return (
              <button
                key={pack.value}
                onClick={() => setIconPack(pack.value)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-white/40 bg-white/10 text-white font-bold'
                    : 'border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'
                }`}
              >
                <span className="text-xs block font-bold">{pack.label}</span>
                <span className="text-[9px] text-neutral-500 block mt-1 line-clamp-1">
                  {pack.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 
        ========================================================================
        5. TYPOGRAPHY & FONT SCALE
        ========================================================================
      */}
      <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 space-y-4 shadow-xl">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Typography & Scale
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Optimized for textbook legibility and exam revision.
          </p>
        </div>

        {/* Font Family */}
        <div className="grid grid-cols-2 gap-2">
          {FONT_FAMILIES.map((f) => {
            const isSelected = fontFamily === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFontFamily(f.value)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-white/40 bg-white/10 text-white font-bold'
                    : 'border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'
                }`}
              >
                <span className="text-xs block font-semibold">{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Font Size Scale */}
        <div className="pt-2">
          <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-2">
            Scale Sizing
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['compact', 'normal', 'comfortable'] as FontSizeScale[]).map((scale) => {
              const isSelected = fontSize === scale;
              const labels = { compact: 'Compact', normal: 'Standard', comfortable: 'Large' };
              const pts = { compact: '13.5px', normal: '15.5px', comfortable: '17.5px' };
              return (
                <button
                  key={scale}
                  onClick={() => setFontSize(scale)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-white bg-white/10 text-white font-bold'
                      : 'border-white/[0.06] text-neutral-400 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-xs block font-semibold">{labels[scale]}</span>
                  <span className="text-[9px] font-mono text-neutral-500 block mt-0.5">
                    {pts[scale]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        6. AI READER VOICE COMPANION
        ========================================================================
      */}
      <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 space-y-3 shadow-xl">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            AI Reader Voice Companion
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Voice narration model for textbooks and checkpoint explanations.
          </p>
        </div>

        <div className="space-y-1.5">
          {COHART_VOICES.map((v) => {
            const isSelected = selectedVoice === v.id;
            return (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedVoice(v.id);
                  localStorage.setItem('aurora_selected_voice', v.id);
                }}
                className={`w-full text-left p-3 rounded-2xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white/10 border border-white/20 text-white font-bold'
                    : 'bg-white/[0.02] border border-white/[0.05] text-neutral-300 hover:bg-white/[0.05]'
                }`}
              >
                <span>{v.label}</span>
                {isSelected && <GeminiIcon name="check" size={13} className="text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save / Apply Button */}
      <button
        onClick={onBack}
        className="w-full py-3 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold shadow-lg active:scale-98 transition-all cursor-pointer"
      >
        ✓ Done & Return to Profile
      </button>
    </div>
  );
};
