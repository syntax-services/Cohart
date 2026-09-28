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

const OOU_NAV_ITEMS: NavItem[] = [
  { id: 'hub', label: 'Hub', icon: 'home' },
  { id: 'reader', label: 'Reader', icon: 'reader' },
  { id: 'schedule', label: 'Schedule', icon: 'calendar' },
  { id: 'map', label: 'Map', icon: 'compass' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

const NON_OOU_NAV_ITEMS: NavItem[] = [
  { id: 'hub', label: 'Hub', icon: 'home' },
  { id: 'reader', label: 'Reader', icon: 'reader' },
  { id: 'schedule', label: 'Schedule', icon: 'calendar' },
  { id: 'ai', label: 'Cohart AI', icon: 'chat' }, // Removed sparkle, using chat for AI
  { id: 'profile', label: 'Profile', icon: 'user' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, institution = 'OOU' }) => {
  // For OOU students: Map tab. For non-OOU students: AI tab replaces the Map tab!
  const navItems = React.useMemo(() => {
    if (institution && institution !== 'OOU') {
      return NON_OOU_NAV_ITEMS;
    }
    return OOU_NAV_ITEMS;
  }, [institution]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-safe px-4 sm:px-6 pb-6 pt-2">
      <div className="max-w-md mx-auto pointer-events-auto">
        <nav
          aria-label="Bottom Navigation"
          className="relative flex items-center justify-around rounded-3xl bg-white/90 dark:bg-[#1E1F20]/90 border border-black/[0.05] dark:border-white/[0.05] backdrop-blur-2xl px-2 py-3 shadow-2xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                aria-label={item.label}
                className={`relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 active:scale-90 group ${
                  isActive
                    ? 'text-black dark:text-white'
                    : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {/* Active pill background */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-2xl bg-neutral-100 dark:bg-white/[0.08]"
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <GeminiIcon
                    name={item.icon}
                    size={isActive ? 28 : 26}
                    strokeWidth={isActive ? 3 : 2.5}
                    className={`transition-colors duration-200 ${
                      isActive
                        ? 'text-black dark:text-white'
                        : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-200'
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
