'use client';

import React, { useState, useEffect } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';

interface HeaderProps {
  onSearch?: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#06080D]/90 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <div className="flex items-center gap-6">
          <BrandLogo size={34} />

          {/* Academic Countdown Tag */}
          <div className="hidden md:flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 border border-white/[0.07]">
            <GeminiIcon name="calendar" size={14} className="text-[#387BFF]" />
            <span className="text-xs font-mono text-slate-300">
              Resumption: <span className="text-white font-semibold">Oct 5</span>
            </span>
          </div>
        </div>

        {/* Minimalist Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <GeminiIcon name="search" size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search OOU lecture halls, courses (ECO 201), faculties..."
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#387BFF]/50 focus:ring-1 focus:ring-[#387BFF]/30 transition-all font-sans"
            />
          </div>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-3">
          {/* Network Health Indicator */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <Badge variant="blue" className="text-[11px] py-0.5 px-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#387BFF]" />
                <span className="hidden sm:inline">PWA Active</span>
              </Badge>
            ) : (
              <Badge variant="amber" className="text-[11px] py-0.5 px-2">
                <span>Offline Cached</span>
              </Badge>
            )}
          </div>

          {/* Notifications / Alerts */}
          <button 
            className="relative rounded-xl border border-white/[0.08] bg-white/[0.04] p-2 text-slate-400 hover:text-white hover:border-white/[0.15] transition-colors"
            aria-label="Alerts"
          >
            <GeminiIcon name="bell" size={16} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#387BFF] shadow-[0_0_8px_#387BFF]" />
          </button>

          {/* Student Avatar Tag */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1A73E8] to-[#387BFF] font-mono text-xs font-bold text-white shadow-[0_0_12px_rgba(56,123,255,0.3)]">
              EC
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-medium text-white leading-tight">OOU Economics</span>
              <span className="text-[10px] font-mono text-slate-500">200 Level</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
