'use client';

import React, { useState } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';
import { WorkspaceModeDropdown } from './WorkspaceModeDropdown';
import { NavTab } from './BottomNav';

interface TopHeaderProps {
  profile: StudentProfile;
  onOpenProfile: () => void;
  onSearch?: (term: string) => void;
  currentTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  profile,
  onOpenProfile,
  onSearch,
  currentTab = 'hub',
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/[0.05] dark:border-white/[0.06] bg-white/85 dark:bg-[#131314]/85 backdrop-blur-2xl transition-colors">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Left: Monolithic Brand Logo + 2-Icon String-style Experience Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <BrandLogo size={23} subtitle="Intelligence" />

          {/* 2-Icon Switcher Trigger */}
          {onSelectTab && (
            <WorkspaceModeDropdown
              currentMode={currentTab}
              onSelectMode={(target) => onSelectTab(target as NavTab)}
            />
          )}
        </div>

        {/* Center: Ultra-Compact Omnibox Search */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
              <GeminiIcon name="search" size={13} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search lectures, Senate past questions, halls..."
              className="w-full rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] pl-8 pr-8 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500/70 focus:outline-none focus:border-[#0B57D0]/60 dark:focus:border-[#8AB4F8]/60 transition-colors font-sans"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[9.5px] font-mono text-neutral-400 dark:text-neutral-500 border border-black/[0.06] dark:border-white/[0.06]">
              ⌘K
            </div>
          </div>
        </div>

        {/* Right: Quick Scholar Profile Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 transition-all active:scale-95 text-xs font-medium cursor-pointer shadow-2xs"
            title="Open Scholar Account"
          >
            <div className="h-5 w-5 rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#8AB4F8] flex items-center justify-center font-bold text-[10px] uppercase">
              {profile.full_name?.charAt(0) || 'S'}
            </div>
            <span className="hidden sm:inline font-sans text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
              {profile.full_name?.split(' ')[0] || 'Scholar'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
