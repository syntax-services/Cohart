'use client';

import React, { useState } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';
import { NavTab } from './BottomNav';
import { NotificationsPopover } from '@/components/notifications/NotificationsPopover';

interface TopHeaderProps {
  profile: StudentProfile;
  onOpenProfile: () => void;
  onSearch?: (term: string) => void;
  onSearchSubmit?: (term: string) => void;
  currentTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  profile,
  onOpenProfile,
  onSearch,
  onSearchSubmit,
  currentTab = 'hub',
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearchSubmit) onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0c0d12]/90 backdrop-blur-3xl transition-colors">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
        {/* Left: Brand Logo with Extraterrestrial uncrossed Λ and OS pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <BrandLogo size={24} subtitle="Intelligence" />
        </div>

        {/* Center: Ultra-Compact Omnibox Search (Desktop/Tablet) */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              <GeminiIcon name="search" size={13} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder="Search lectures, halls, courses, past questions..."
              className="w-full rounded-full bg-white/[0.04] border border-white/[0.08] pl-8 pr-8 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition-colors font-sans"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[9.5px] font-mono text-neutral-400 border border-white/[0.08]">
              ↵ Enter
            </div>
          </div>
        </div>

        {/* Right: Action Cluster: Mobile Search Button + Notifications + Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Mobile Search Icon Toggle */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden h-8 w-8 rounded-full border border-white/[0.08] bg-white/[0.03] text-neutral-300 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Search"
          >
            <GeminiIcon name="search" size={14} />
          </button>

          {/* Campus Notifications Popover */}
          <NotificationsPopover
            institution={profile.institution}
            onNavigateToTab={(tab) => onSelectTab?.(tab as NavTab)}
          />

          {/* Quick Scholar Profile Circular Avatar */}
          <button
            onClick={onOpenProfile}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs overflow-hidden relative"
            title="Open Scholar Account"
            aria-label="Profile"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Scholar'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-white/10 text-white flex items-center justify-center font-bold text-[11px] uppercase">
                {profile.full_name?.charAt(0) || 'S'}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-3 pb-2.5 pt-1 border-t border-white/[0.06] bg-[#0c0d12]/95 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <GeminiIcon name="search" size={13} />
            </div>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (onSearchSubmit) onSearchSubmit(searchQuery);
                  setIsMobileSearchOpen(false);
                }
              }}
              placeholder="Search lectures, halls, courses, past questions..."
              className="w-full rounded-full bg-white/[0.05] border border-white/[0.1] pl-8 pr-16 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
            />
            <button
              onClick={() => {
                if (onSearchSubmit) onSearchSubmit(searchQuery);
                setIsMobileSearchOpen(false);
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-bold"
            >
              Go
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
