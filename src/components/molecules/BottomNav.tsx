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
  { id: 'ai', label: 'Cohart AI', icon: 'sparkle' },
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
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-safe px-3 sm:px-6 pb-2 pt-1">
      <div className="max-w-md mx-auto pointer-events-auto">
        <nav
          aria-label="Bottom Navigation"
          className="relative flex items-center justify-around rounded-full bg-white/95 dark:bg-[#1E1F20]/95 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl px-2 py-1 shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-150 active:scale-95 group ${
                  isActive
                    ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {/* Active pill background without neon glow */}
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 rounded-full bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15"
                  />
                )}

                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <GeminiIcon
                    name={item.icon}
                    size={19}
                    strokeWidth={isActive ? 1.8 : 1.4}
                    className={`transition-colors duration-150 ${
                      isActive
                        ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                        : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200'
                    }`}
                  />
                  <span
                    className={`text-[10px] tracking-tight font-sans transition-all duration-150 ${
                      isActive
                        ? 'font-medium text-[#0B57D0] dark:text-[#A8C7FA]'
                        : 'font-normal text-neutral-500 dark:text-neutral-400'
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
