'use client';

import React, { useState, useEffect } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Badge } from '@/components/ui/Badge';
import { Bell, Wifi, WifiOff, Calendar, Search } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#07090E]/90 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <div className="flex items-center gap-6">
          <BrandLogo size={34} />

          {/* Academic Countdown Tag */}
          <div className="hidden md:flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 border border-white/[0.07]">
            <Calendar className="h-3.5 w-3.5 text-[#00F0FF]" />
            <span className="text-xs font-mono text-slate-300">
              Resumption: <span className="text-white font-semibold">Oct 5</span>
            </span>
          </div>
        </div>

        {/* Minimalist Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search OOU lecture halls, courses (ECO 201), faculties..."
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/30 transition-all font-sans"
            />
          </div>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-3">
          {/* Network Health Indicator (Resilience First) */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <Badge variant="cyan" className="text-[11px] py-0.5 px-2">
                <Wifi className="h-3 w-3" />
                <span className="hidden sm:inline">PWA Active</span>
              </Badge>
            ) : (
              <Badge variant="slate" className="text-[11px] py-0.5 px-2 text-amber-400 border-amber-400/30">
                <WifiOff className="h-3 w-3" />
                <span>Offline Cached</span>
              </Badge>
            )}
          </div>

          {/* Notifications / Alerts */}
          <button 
            className="relative rounded-xl border border-white/[0.08] bg-white/[0.04] p-2 text-slate-400 hover:text-white hover:border-white/[0.15] transition-colors"
            aria-label="Alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
          </button>

          {/* Student Avatar Tag */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00F0FF] to-[#0066FF] font-mono text-xs font-bold text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]">
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
