'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';

export interface CampusNotification {
  id: string;
  title: string;
  message: string;
  category: 'academic' | 'exam' | 'system' | 'campus';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const DEFAULT_NOTIFICATIONS: CampusNotification[] = [
  {
    id: 'notif_1',
    title: 'Senate Exam Timetable Draft',
    message: 'Tentative first-semester examination dates have been published on the university academic board notice.',
    category: 'exam',
    timestamp: '10m ago',
    read: false,
  },
  {
    id: 'notif_2',
    title: 'Statutory 75% Attendance Check',
    message: 'Your lecture attendance rate is synced with NUC continuous assessment standards. 2 check-ins needed to secure clearance.',
    category: 'academic',
    timestamp: '1h ago',
    read: false,
  },
  {
    id: 'notif_3',
    title: 'Aurora OS Engine Upgraded',
    message: 'Lyric, Prism, Lumen, Astral, and Zenith models are live with in-chat interactive quiz practice and memory synthesis.',
    category: 'system',
    timestamp: '2h ago',
    read: false,
  },
  {
    id: 'notif_4',
    title: 'Campus Transit Notice',
    message: 'Ago-Iwoye PS internal Maruwa tricycles are running regular schedules between School Park and Motion Ground / LLT3.',
    category: 'campus',
    timestamp: '5h ago',
    read: true,
  },
];

interface NotificationsPopoverProps {
  institution?: string;
  onNavigateToTab?: (tab: string) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  institution = 'Campus',
  onNavigateToTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CampusNotification[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('aurora_campus_notifications');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aurora_campus_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button - matching String design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 transition-all active:scale-95 cursor-pointer shadow-2xs"
        aria-label="Notifications"
        title="Campus Notifications & Alerts"
      >
        <GeminiIcon name="bell" size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] ring-2 ring-white dark:ring-[#131314] animate-pulse" />
        )}
      </button>

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white/95 dark:bg-[#1E1F20]/95 border border-black/[0.08] dark:border-white/[0.08] shadow-2xl backdrop-blur-2xl z-50 overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0B57D0]/10 text-[#0B57D0] dark:text-[#8AB4F8]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-[#0B57D0] dark:text-[#8AB4F8] hover:underline cursor-pointer font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-black/[0.04] dark:divide-white/[0.04] overscroll-contain">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No notifications right now.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors cursor-pointer text-left ${
                      !n.read ? 'bg-[#0B57D0]/[0.03] dark:bg-[#1A73E8]/[0.05]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] shrink-0" />
                        )}
                        {n.title}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[10.5px] text-neutral-500">
              <span className="font-mono">{institution} Campus Broadcast</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
