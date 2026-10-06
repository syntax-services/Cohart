'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GeminiIcon, IconName } from '@/components/atoms/GeminiIcon';

export type NavTab = 'hub' | 'reader' | 'schedule' | 'map' | 'ai' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  institution?: string;
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
  { id: 'ai', label: 'Cohart AI', icon: 'chat' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-safe px-4 sm:px-6 pb-6 pt-2">
      <div className="max-w-sm mx-auto pointer-events-auto">
        <nav
          aria-label="Bottom Navigation"
          className="relative flex items-center justify-between rounded-full bg-[#0A0A0A]/90 dark:bg-[#0A0A0A]/95 border border-white/10 backdrop-blur-2xl px-3 py-2 shadow-2xl shadow-black/50"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                aria-label={item.label}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 active:scale-95 group ${
                  isActive
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {/* Active pill background */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-full bg-white/10 border border-white/10"
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <GeminiIcon
                    name={item.icon}
                    size={isActive ? 22 : 20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors duration-200 ${
                      isActive
                        ? 'text-white'
                        : 'text-neutral-400 group-hover:text-white'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
