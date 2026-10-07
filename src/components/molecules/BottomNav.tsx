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

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, institution = '' }) => {
  // Check if student's school has an interactive campus map (e.g. OOU or configured hasMap schools)
  const isSchoolWithMap = React.useMemo(() => {
    if (!institution) return false;
    const lower = institution.toLowerCase();
    return (
      lower === 'oou' ||
      lower.includes('oou') ||
      lower.includes('onabanjo') ||
      lower.includes('ago-iwoye')
    );
  }, [institution]);

  const navItems = React.useMemo(() => {
    if (isSchoolWithMap) {
      // 5-item bar with Map at the exact center (index 2)
      return [
        { id: 'hub' as NavTab, label: 'Hub', icon: 'home' as IconName },
        { id: 'reader' as NavTab, label: 'Reader', icon: 'reader' as IconName },
        { id: 'map' as NavTab, label: 'Campus Map', icon: 'map' as IconName },
        { id: 'ai' as NavTab, label: 'Messages', icon: 'chat' as IconName },
        { id: 'profile' as NavTab, label: 'Profile', icon: 'user' as IconName },
      ];
    }

    // Default nationwide 5-item dock
    return [
      { id: 'hub' as NavTab, label: 'Hub', icon: 'home' as IconName },
      { id: 'reader' as NavTab, label: 'Reader', icon: 'reader' as IconName },
      { id: 'schedule' as NavTab, label: 'Schedule', icon: 'calendar' as IconName },
      { id: 'ai' as NavTab, label: 'Messages', icon: 'chat' as IconName },
      { id: 'profile' as NavTab, label: 'Profile', icon: 'user' as IconName },
    ];
  }, [isSchoolWithMap]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-safe px-4 sm:px-6 pb-6 pt-2">
      <div className="max-w-sm mx-auto pointer-events-auto">
        <nav
          aria-label="Bottom Navigation"
          className="relative flex items-center justify-between rounded-full bg-[#0A0A0A]/90 dark:bg-[#0A0A0A]/95 border border-white/10 backdrop-blur-2xl px-3 py-2 shadow-2xl shadow-black/50"
        >
          {navItems.map((item, idx) => {
            const isActive = activeTab === item.id;
            const isCenterMap = isSchoolWithMap && idx === 2;

            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                aria-label={item.label}
                className={`relative flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 group ${
                  isCenterMap
                    ? 'w-12 h-12 bg-white/10 border border-white/15 shadow-md shadow-white/5'
                    : 'w-11 h-11'
                } ${
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
                    className="absolute inset-0 rounded-full bg-white/15 border border-white/20"
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
                        : isCenterMap
                          ? 'text-neutral-200 group-hover:text-white'
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
