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
    id: 'notif_summit',
    title: 'Ogun Innovate Hackathon 2026',
    message: 'Welcome to the Ogun Summit Edition (Vs). All student features, curriculum models, and tools are 100% unlocked with zero fee.',
    category: 'system',
    timestamp: 'Just now',
    read: false,
  },
  {
    id: 'notif_1',
    title: 'Senate Exam Timetable Draft',
    message: 'Tentative first-semester examination dates have been published on the university academic board notice.',
    category: 'exam',
    timestamp: '15m ago',
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
    title: 'Aurora Engine: Ogun State Curricula Live',
    message: '17 Ogun State higher institutions (OOU, FUNAAB, TASUED, MAPOLY, Fed Poly Ilaro, Babcock, etc.) loaded with verified departments.',
    category: 'system',
    timestamp: '2h ago',
    read: false,
  },
  {
    id: 'notif_4',
    title: 'Ago-Iwoye PS Transit Update',
    message: 'Internal Maruwa tricycles running active schedules between School Park, ICT Centre, Science Complex, and LLT halls.',
    category: 'campus',
    timestamp: '4h ago',
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
        const saved = localStorage.getItem('aurora_campus_notifications_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const drawerRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aurora_campus_notifications_v2', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const getCategoryColor = (category: CampusNotification['category']) => {
    switch (category) {
      case 'exam':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'academic':
        return 'text-white bg-white/10 border-white/20';
      case 'system':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'campus':
        return 'text-neutral-300 bg-white/[0.06] border-white/[0.1]';
      default:
        return 'text-neutral-400 bg-white/[0.04] border-white/[0.08]';
    }
  };

  return (
    <>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-neutral-200 transition-all active:scale-95 cursor-pointer shadow-2xs"
        aria-label="Notifications"
        title="Campus Notifications & Alerts"
      >
        <GeminiIcon name="bell" size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-white ring-2 ring-[#0B0D11] animate-pulse" />
        )}
      </button>

      {/* Right-to-Left Slideover Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Slideover Panel (Slides in from right to left smoothly within viewport) */}
            <div className="fixed inset-y-0 right-0 max-w-full flex z-50">
              <motion.div
                ref={drawerRef}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="w-full sm:w-[420px] max-w-full bg-[#0c0d12]/98 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl flex flex-col h-full"
              >
                {/* Header */}
                <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20">
                      <GeminiIcon name="bell" size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-white">
                          Campus Alerts
                        </h2>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white border border-white/20">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] font-mono text-neutral-400">
                        {institution} • Live Broadcast Stream
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-neutral-300 hover:text-white hover:underline cursor-pointer font-medium px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 rounded-xl hover:bg-white/[0.08] text-neutral-400 hover:text-white cursor-pointer transition-colors"
                      title="Close drawer"
                      aria-label="Close"
                    >
                      <GeminiIcon name="close" size={16} />
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="flex-1 overflow-y-auto divide-y divide-white/[0.05] p-2 space-y-1">
                  {notifications.length === 0 ? (
                    <div className="py-20 text-center space-y-2">
                      <div className="h-12 w-12 rounded-2xl bg-white/[0.04] text-neutral-400 flex items-center justify-center mx-auto">
                        <GeminiIcon name="bell" size={20} />
                      </div>
                      <p className="text-xs font-semibold text-white">All caught up!</p>
                      <p className="text-[11px] text-neutral-500">No new notices for your department right now.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <motion.div
                        key={n.id}
                        layout
                        onClick={() => markAsRead(n.id)}
                        className={`p-3.5 rounded-2xl transition-all cursor-pointer text-left relative group ${
                          !n.read
                            ? 'bg-white/[0.06] border border-white/20 hover:bg-white/[0.09]'
                            : 'hover:bg-white/[0.03] border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            {!n.read && (
                              <span className="h-2 w-2 rounded-full bg-white shrink-0 animate-pulse" />
                            )}
                            <span className="text-xs font-bold text-white leading-snug">
                              {n.title}
                            </span>
                          </div>
                          <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold shrink-0 ${getCategoryColor(n.category)}`}>
                            {n.category}
                          </span>
                        </div>
                        <p className="text-[12px] text-neutral-300 leading-relaxed pl-0.5">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-1 text-[10px] font-mono text-neutral-400 pl-0.5">
                          <span>{n.timestamp}</span>
                          {!n.read && (
                            <span className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to mark read
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Footer with Summit Badge & Close */}
                <div className="p-4 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[11px]">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Summit Live Feed</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-neutral-200 font-semibold cursor-pointer transition-colors text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
