'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GeminiIcon, IconName } from '@/components/atoms/GeminiIcon';

export type NavTab = 'hub' | 'reader' | 'schedule' | 'map' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'hub', label: 'Hub', icon: 'home' },
  { id: 'reader', label: 'Reader', icon: 'reader' },
  { id: 'schedule', label: 'Schedule', icon: 'calendar' },
  { id: 'map', label: 'Map', icon: 'compass' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-safe px-3 sm:px-6 pb-3 pt-1">
      <div className="max-w-md mx-auto pointer-events-auto">
        <nav
          aria-label="Bottom Navigation"
          className="relative flex items-center justify-around rounded-2xl bg-[#080C14]/90 border border-white/[0.08] backdrop-blur-2xl px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-95 group ${
                  isActive ? 'text-[#387BFF]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active pill background with subtle glow */}
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-blue-500/[0.12] border border-blue-500/30 shadow-[0_0_16px_rgba(56,123,255,0.2)]"
                  />
                )}

                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <GeminiIcon
                    name={item.icon}
                    size={20}
                    strokeWidth={isActive ? 1.8 : 1.4}
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-[#387BFF]' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span
                    className={`text-[10px] tracking-tight font-sans transition-all duration-200 ${
                      isActive ? 'font-semibold text-white' : 'font-normal text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
