'use client';

import React, { useState, useEffect } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';

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
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#06080D]/90 backdrop-blur-2xl">
      <div className="mx-auto flex h-15 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 py-2.5">
        {/* Brand Identity */}
        <div className="flex items-center gap-4">
          <BrandLogo size={32} />
          
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.07] text-[11px] font-mono text-slate-400">
            <GeminiIcon name="sparkle" size={13} className="text-[#387BFF]" />
            <span>AI Core Active</span>
          </div>
        </div>

        {/* Minimalist Search Bar */}
        <div className="flex-1 max-w-sm mx-3 hidden md:block">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <GeminiIcon name="search" size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search lectures, ECO courses, halls..."
              className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#387BFF]/60 focus:ring-1 focus:ring-[#387BFF]/30 transition-all font-sans"
            />
          </div>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2.5">
          {/* Network Health Indicator */}
          <div className="hidden xs:flex items-center">
            {isOnline ? (
              <Badge variant="blue" size="sm" className="hidden sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[#387BFF] shadow-[0_0_6px_#387BFF]" />
                <span>PWA Synced</span>
              </Badge>
            ) : (
              <Badge variant="amber" size="sm">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>Offline Cache</span>
              </Badge>
            )}
          </div>

          {/* Notifications / Alerts Button */}
          <button
            className="relative rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-slate-400 hover:text-white hover:border-white/[0.16] transition-colors active:scale-95"
            aria-label="Alerts"
          >
            <GeminiIcon name="bell" size={17} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#387BFF] shadow-[0_0_8px_#387BFF]" />
          </button>

          {/* Student Profile Quick Tab Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 border-l border-white/[0.08] group text-left cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#387BFF]/15 border border-[#387BFF]/30 font-mono text-xs font-semibold text-[#60A5FA] group-hover:border-[#387BFF] transition-all group-hover:shadow-[0_0_12px_rgba(56,123,255,0.3)]">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-medium text-white group-hover:text-[#60A5FA] transition-colors leading-tight">
                {profile.full_name || 'Student'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {profile.department} • {profile.level}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
