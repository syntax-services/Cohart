'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';

export type WorkspaceMode = 'hub' | 'reader' | 'arena' | 'ai';

interface WorkspaceModeDropdownProps {
  currentMode: string;
  onSelectMode: (mode: WorkspaceMode) => void;
  className?: string;
}

interface ModeOption {
  id: WorkspaceMode;
  title: string;
  subtitle: string;
  icon: 'home' | 'reader' | 'zap' | 'chat';
  badge?: string;
  badgeColor?: string;
}

const MODES: ModeOption[] = [
  {
    id: 'hub',
    title: 'Academic Workspace',
    subtitle: 'Lectures, timetable & study hub',
    icon: 'home',
    badge: 'Study',
    badgeColor: 'bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#1A73E8] border-[#0B57D0]/20',
  },
  {
    id: 'reader',
    title: 'Course Reader & Notes',
    subtitle: 'Compact textbook & syllabus reading',
    icon: 'reader',
    badge: 'Reading',
    badgeColor: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
  },
  {
    id: 'arena',
    title: 'Campus Arena & Fun',
    subtitle: 'Live tournament battles, cheers & cash pool',
    icon: 'zap',
    badge: 'LIVE ⚡',
    badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse',
  },
  {
    id: 'ai',
    title: 'Messages & Scholars',
    subtitle: 'Direct peer chats & course outlines',
    icon: 'chat',
    badge: 'Peers',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
];

export const WorkspaceModeDropdown: React.FC<WorkspaceModeDropdownProps> = ({
  currentMode,
  onSelectMode,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine active mode info
  const activeOption = MODES.find((m) => m.id === currentMode) || (
    currentMode === 'schedule' || currentMode === 'map' ? MODES[0] : MODES[0]
  );

  // Close on outside click
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] transition-all active:scale-95 cursor-pointer select-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Switch Workspace Mode"
      >
        {/* Mode Icon */}
        <div className="flex items-center justify-center text-[#0B57D0] dark:text-[#1A73E8]">
          <GeminiIcon name={activeOption.icon} size={15} />
        </div>

        {/* Title */}
        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 font-sans tracking-tight">
          {activeOption.title}
        </span>

        {/* Status Indicator or Badge */}
        {activeOption.id === 'arena' ? (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
        ) : null}

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-neutral-400 dark:text-neutral-500 ml-0.5"
        >
          <GeminiIcon name="chevron-down" size={13} />
        </motion.div>
      </button>

      {/* Dropdown Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-[1.5rem] bg-white/95 dark:bg-[#181B22]/95 border border-black/[0.08] dark:border-white/[0.1] shadow-2xl backdrop-blur-2xl p-2 z-50 overflow-hidden"
          >
            {/* Header / Section label */}
            <div className="px-3 pt-2 pb-1.5 flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06] mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold">
                Switch Interface
              </span>
              <span className="text-[10px] font-mono text-neutral-400">Cohart Ecosystem</span>
            </div>

            {/* Menu options */}
            <div className="space-y-1">
              {MODES.map((option) => {
                const isSelected = activeOption.id === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onSelectMode(option.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer group ${
                      isSelected
                        ? 'bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 border border-[#0B57D0]/20 dark:border-[#1A73E8]/30 shadow-xs'
                        : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    {/* Icon container */}
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        option.id === 'arena'
                          ? 'bg-rose-500/10 text-rose-500'
                          : isSelected
                          ? 'bg-[#0B57D0] dark:bg-[#1A73E8] text-white shadow-xs'
                          : 'bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <GeminiIcon name={option.icon} size={16} />
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isSelected
                              ? 'text-[#0B57D0] dark:text-[#1A73E8]'
                              : 'text-neutral-900 dark:text-neutral-100'
                          }`}
                        >
                          {option.title}
                        </span>
                        {option.badge && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border font-semibold ${option.badgeColor}`}
                          >
                            {option.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5 font-normal">
                        {option.subtitle}
                      </p>
                    </div>

                    {/* Active Checkmark */}
                    {isSelected && (
                      <div className="text-[#0B57D0] dark:text-[#1A73E8] shrink-0">
                        <GeminiIcon name="check" size={14} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
