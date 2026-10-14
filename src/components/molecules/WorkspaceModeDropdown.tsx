'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { setWorkspaceModeCookie, trackAuroraEvent, getWorkspaceModeCookie } from '@/lib/telemetry';

export type AuroraExperienceMode = 'academic' | 'arena';

// ============================================================================
// BESPOKE ULTRA-MINIMALIST MODE SVGS (String-style Pill Geometry)
// Crafted with bold lines for active state & fluid liquid glass contours.
// ============================================================================

export const ScholarModeIcon: React.FC<{ active?: boolean; bold?: boolean; className?: string }> = ({
  active = false,
  bold = false,
  className = '',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={bold ? 2.2 : active ? 1.9 : 1.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-4 h-4 transition-all duration-300 ${className}`}
  >
    {/* Curved mortarboard pill contour */}
    <path d="M2.5 9.5 L12 4.5 L21.5 9.5 L12 14.5 Z" />
    <path d="M6 11.5 V16.5 C6 19 8.7 21 12 21 C15.3 21 18 19 18 16.5 V11.5" />
    <path d="M21.5 9.5 V15" />
    <circle cx="12" cy="14.5" r="1.5" className={active || bold ? 'fill-current' : 'stroke-current'} />
  </svg>
);

export const ArenaModeIcon: React.FC<{ active?: boolean; bold?: boolean; className?: string }> = ({
  active = false,
  bold = false,
  className = '',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={bold ? 2.2 : active ? 1.9 : 1.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-4 h-4 transition-all duration-300 ${className}`}
  >
    {/* Smooth pill goblet & victory handles */}
    <path d="M6 8.5 C6 13 8.8 16 12 16 C15.2 16 18 13 18 8.5 V4.5 H6 Z" />
    <path d="M6 6 H3.5 C2.7 6 2 6.7 2 7.5 C2 10.2 3.8 12 6 12" />
    <path d="M18 6 H20.5 C21.3 6 22 6.7 22 7.5 C22 10.2 20.2 12 18 12" />
    <path d="M12 16 V19" />
    <rect x="8" y="19" width="8" height="2" rx="1" />
  </svg>
);

// Tiny Custom SVG Switch Indicator Icon (Dual Directional Swap Arrows from String)
export const TinySwitchIcon: React.FC<{ isOpen?: boolean; isRotating?: boolean; className?: string }> = ({
  isOpen = false,
  isRotating = false,
  className = '',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-3 h-3 transition-transform duration-300 ${
      isRotating ? 'rotate-180 text-[#0B57D0] dark:text-[#8AB4F8]' : isOpen ? 'rotate-180 text-[#0B57D0] dark:text-[#8AB4F8]' : 'text-neutral-500/80'
    } ${className}`}
  >
    <path d="M2.5 4.5 H10 M7.5 2.5 L10 4.5 L7.5 6.5" />
    <path d="M11.5 9.5 H4 M6.5 7.5 L4 9.5 L6.5 11.5" />
  </svg>
);

interface WorkspaceModeDropdownProps {
  currentMode: string;
  onSelectMode: (targetTab: string) => void;
  className?: string;
}

export const WorkspaceModeDropdown: React.FC<WorkspaceModeDropdownProps> = ({
  currentMode,
  onSelectMode,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isArena = currentMode === 'arena';
  const activeMode: AuroraExperienceMode = isArena ? 'arena' : 'academic';

  // Outside click listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleQuickFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 400);

    const nextMode: AuroraExperienceMode = activeMode === 'academic' ? 'arena' : 'academic';
    const targetTab = nextMode === 'arena' ? 'arena' : 'hub';

    setWorkspaceModeCookie(nextMode);
    trackAuroraEvent('mode_switched_via_quick_flip', 'navigation', { from: activeMode, to: nextMode });
    onSelectMode(targetTab);
  };

  const handleSelectMode = (mode: AuroraExperienceMode) => {
    setIsOpen(false);
    if (mode === activeMode) return;

    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 400);

    const targetTab = mode === 'arena' ? 'arena' : 'hub';
    setWorkspaceModeCookie(mode);
    trackAuroraEvent('mode_selected_via_menu', 'navigation', { mode });
    onSelectMode(targetTab);
  };

  const getActiveIcon = () => {
    if (activeMode === 'arena') {
      return <ArenaModeIcon bold active className="text-rose-500" />;
    }
    return <ScholarModeIcon bold active className="text-[#0B57D0] dark:text-[#8AB4F8]" />;
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* 
        String-style Ultra-Compact Trigger:
        Contains EXACTLY 2 ICONS:
        1. Current Profile Type Icon (Scholar vs Arena)
        2. Animated Switch Swap Icon (Rotates on click/open)
      */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onDoubleClick={handleQuickFlip}
        aria-label="Switch Learning Mode"
        title={`Current: ${activeMode === 'arena' ? 'Campus Arena (Play & Win)' : 'Scholar OS (Serious Study)'} • Click to toggle profile`}
        className={`relative flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-full bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.05] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-xs focus:outline-none cursor-pointer ${
          isOpen ? 'border-[#0B57D0]/50 dark:border-[#8AB4F8]/50 bg-black/[0.05] dark:bg-white/[0.08]' : ''
        }`}
      >
        {/* 1. Main Active Profile SVG */}
        <div className="flex items-center justify-center">
          {getActiveIcon()}
        </div>

        {/* 2. Tiny Custom Switcher SVG */}
        <div className="flex items-center justify-center pl-0.5">
          <TinySwitchIcon isOpen={isOpen} isRotating={isRotating} />
        </div>
      </button>

      {/* String-style Liquid Glass Profile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 mt-2 w-64 z-50 rounded-2xl bg-white/95 dark:bg-[#1C1D1E]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.1] shadow-2xl p-2 overflow-hidden text-left"
          >
            <div className="px-2.5 py-1.5 mb-1 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                Switch Experience
              </span>
              <button
                onClick={handleQuickFlip}
                className="text-[10px] font-mono text-[#0B57D0] dark:text-[#8AB4F8] hover:underline cursor-pointer"
              >
                Quick Flip
              </button>
            </div>

            {/* Mode 1: Scholar OS (Academic Study) */}
            <button
              onClick={() => handleSelectMode('academic')}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                activeMode === 'academic'
                  ? 'bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#8AB4F8] font-bold'
                  : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 flex items-center justify-center shrink-0">
                  <ScholarModeIcon active={activeMode === 'academic'} bold={activeMode === 'academic'} />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-semibold leading-tight truncate">Scholar OS</p>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">Serious study & exams</p>
                </div>
              </div>
              {activeMode === 'academic' && (
                <div className="h-1.5 w-1.5 rounded-full bg-[#0B57D0] dark:bg-[#8AB4F8] shrink-0" />
              )}
            </button>

            {/* Mode 2: Campus Arena (Fun & Play) */}
            <button
              onClick={() => handleSelectMode('arena')}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer mt-1 ${
                activeMode === 'arena'
                  ? 'bg-rose-500/10 text-rose-500 font-bold'
                  : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                  <ArenaModeIcon active={activeMode === 'arena'} bold={activeMode === 'arena'} />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-semibold leading-tight truncate">Campus Arena</p>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">Battles & cash prizes</p>
                </div>
              </div>
              {activeMode === 'arena' && (
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
