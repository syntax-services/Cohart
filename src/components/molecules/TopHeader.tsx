'use client';

import React, { useState, useEffect } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';
import { useTheme } from '@/components/ThemeProvider';

interface TopHeaderProps {
  profile: StudentProfile;
  onOpenProfile: () => void;
  onSearch?: (term: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  profile,
  onOpenProfile,
  onSearch,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const initials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AJ';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/[0.06] dark:border-white/[0.07] bg-white/90 dark:bg-[#131314]/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 py-2">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <BrandLogo size={28} />
        </div>

        {/* Minimalist Search Bar */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
              <GeminiIcon name="search" size={14} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search lectures, halls, courses..."
              className="w-full rounded-full bg-neutral-100/90 dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] pl-9 pr-3.5 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] transition-colors font-sans"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center justify-center h-8 w-8 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors active:scale-95"
          >
            <GeminiIcon
              name={resolvedTheme === 'dark' ? 'sun' : 'moon'}
              size={15}
            />
          </button>

          {/* Notifications Button */}
          <button
            className="relative flex items-center justify-center h-8 w-8 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:border-black/[0.15] dark:hover:border-white/[0.18] transition-colors active:scale-95"
            aria-label="Alerts"
          >
            <GeminiIcon name="bell" size={15} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA]" />
          </button>

          {/* Student Profile Quick Tab Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 border-l border-black/[0.08] dark:border-white/[0.08] group text-left cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 border border-[#0B57D0]/20 dark:border-[#A8C7FA]/30 font-mono text-[11px] font-semibold text-[#0B57D0] dark:text-[#A8C7FA] group-hover:border-[#0B57D0] dark:group-hover:border-[#A8C7FA] transition-all">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-medium text-neutral-900 dark:text-white group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors leading-tight">
                {profile.full_name || 'Student'}
              </span>
              <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                {profile.department} • {profile.level}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
