'use client';

import React, { useState, useEffect } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';

interface MorningCampusBriefingProps {
  profile: StudentProfile;
  onOpenSchedule: () => void;
  onSelectVenue?: (venueCode: string) => void;
}

export const MorningCampusBriefing: React.FC<MorningCampusBriefingProps> = ({
  profile,
  onOpenSchedule,
  onSelectVenue,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [briefingDate, setBriefingDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
    setBriefingDate(formatted);

    const dismissedKey = `cohart_briefing_dismissed_${today.toDateString()}`;
    if (localStorage.getItem(dismissedKey) === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    const today = new Date();
    const dismissedKey = `cohart_briefing_dismissed_${today.toDateString()}`;
    localStorage.setItem(dismissedKey, 'true');
  };

  if (isDismissed) return null;

  const department = profile.department || 'Economics';
  const institution = profile.institution || 'Olabisi Onabanjo University';
  const level = profile.level || '200L';

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-500/[0.08] via-indigo-500/[0.04] to-transparent border border-sky-500/20 p-5 shadow-lg backdrop-blur-md animate-in fade-in duration-300">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <GeminiIcon name="sparkle" size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold">
                07:00 AM Campus Briefing
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">• {briefingDate}</span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {department} ({level}) Academic Dispatch
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
          >
            {isExpanded ? 'Collapse' : 'View Schedule'}
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss briefing"
            className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <GeminiIcon name="close" size={14} />
          </button>
        </div>
      </div>

      {/* Expanded Briefing Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-3 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] font-mono text-neutral-400 block mb-1">
                FIRST LECTURE (08:00 AM)
              </span>
              <span className="font-bold text-white block">ECO 201 • Microeconomics</span>
              <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
                Venue: SMS-LT1 (Lecturer Confirmed)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] font-mono text-neutral-400 block mb-1">
                AFTERNOON SESSION (01:00 PM)
              </span>
              <span className="font-bold text-white block">GNS 201 • Nigerian People & Culture</span>
              <span className="text-[11px] text-sky-400 font-semibold block mt-0.5">
                Venue: LLT-1 (Tiered Arts Quad)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] font-mono text-neutral-400 block mb-1">
                CAMPUS ALERT
              </span>
              <span className="font-bold text-white block">Walk Time: ~6 mins</span>
              <span className="text-[11px] text-neutral-300 block mt-0.5">
                Dry campus walkway via Motion Ground.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10.5px] font-mono text-neutral-400">
              Verified by {institution} Campus Bot
            </span>
            <div className="flex gap-2">
              {onSelectVenue && (
                <button
                  onClick={() => onSelectVenue('loc-sms-lt1')}
                  className="text-xs font-mono font-bold text-sky-400 hover:underline cursor-pointer"
                >
                  Locate SMS-LT1 →
                </button>
              )}
              <button
                onClick={onOpenSchedule}
                className="text-xs font-mono font-bold text-white hover:underline cursor-pointer"
              >
                Full Timetable →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
