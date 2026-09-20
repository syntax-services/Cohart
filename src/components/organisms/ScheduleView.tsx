'use client';

import React, { useState } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';

interface ScheduleViewProps {
  profile: StudentProfile;
  onLocateVenue: (code: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ profile, onLocateVenue }) => {
  const [notifySubscribed, setNotifySubscribed] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Schedule Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] transition-colors">
        <div>
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            {profile.department} • {profile.level}
          </span>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900 dark:text-white font-sans mt-0.5">
            Academic Schedule
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            First Semester 2024/2025 Session
          </p>
        </div>

        <Badge variant="blue" size="sm" className="self-start sm:self-auto">
          Resumption Preparation
        </Badge>
      </div>

      {/* Realistic Timetable Pending Status Hero Card */}
      <GeminiCard className="p-6 sm:p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA] mb-4">
          <GeminiIcon name="calendar" size={24} />
        </div>

        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white font-sans mb-1.5">
          Timetable is not out yet
        </h2>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed font-sans mb-5">
          The Central Academic Planning Committee and {profile.department} Department are currently scheduling lecture hall allocations and course cross-matches. Official lecture timetables will be published once departmental registration concludes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setNotifySubscribed(!notifySubscribed)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95 ${
              notifySubscribed
                ? 'bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 hover:opacity-90'
            }`}
          >
            <GeminiIcon name={notifySubscribed ? 'check' : 'bell'} size={14} />
            <span>{notifySubscribed ? 'Alert Set: Notifying when released' : 'Notify me when timetable drops'}</span>
          </button>

          <button
            onClick={() => onLocateVenue('LLT-1')}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-neutral-800 dark:text-neutral-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-xs font-medium transition-all active:scale-95"
          >
            <GeminiIcon name="pin" size={14} />
            <span>Explore Common Lecture Halls</span>
          </button>
        </div>
      </GeminiCard>

      {/* Realistic Resumption Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Academic Calendar Milestones */}
        <GeminiCard>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
              <GeminiIcon name="clock" size={15} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Academic Calendar Guide</h3>
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Senate Approved Schedule</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
              <div className="flex justify-between font-mono text-[11px] mb-1">
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">Portal Re-opening & Fee Clearance</span>
                <span className="text-emerald-600 dark:text-emerald-400">Ongoing</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                School fees payment receipt generation and course registration on portal.oouagoiwoye.edu.ng
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
              <div className="flex justify-between font-mono text-[11px] mb-1">
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">Departmental Verification & Signing</span>
                <span className="text-[#0B57D0] dark:text-[#A8C7FA]">Starts Resumption Week</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Sign course forms at Departmental Office with Course Advisor and HOD.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
              <div className="flex justify-between font-mono text-[11px] mb-1">
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">Lectures Commence Officially</span>
                <span className="text-neutral-500">Upcoming</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Full lecture timetable to be enforced across LLT1, LLT2, SMS LT, and ECO Hall.
              </p>
            </div>
          </div>
        </GeminiCard>

        {/* Expected Lecture Venues for Your Faculty */}
        <GeminiCard>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
              <GeminiIcon name="compass" size={15} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Frequent Lecture Venues</h3>
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Main Campus (PS)</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div
              onClick={() => onLocateVenue('LLT-1')}
              className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between hover:border-[#0B57D0]/30 transition-all cursor-pointer group"
            >
              <div>
                <p className="font-medium text-neutral-900 dark:text-white group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors">
                  Law Lecture Theatre 1 (LLT 1)
                </p>
                <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  Capacity: ~800 seats • Near Sam Ewang / Footbridge
                </p>
              </div>
              <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div
              onClick={() => onLocateVenue('LLT-2')}
              className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between hover:border-[#0B57D0]/30 transition-all cursor-pointer group"
            >
              <div>
                <p className="font-medium text-neutral-900 dark:text-white group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors">
                  Law Lecture Theatre 2 (LLT 2)
                </p>
                <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  Capacity: ~750 seats • Beside LLT 1
                </p>
              </div>
              <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div
              onClick={() => onLocateVenue('LLT-3')}
              className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between hover:border-[#0B57D0]/30 transition-all cursor-pointer group"
            >
              <div>
                <p className="font-medium text-neutral-900 dark:text-white group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors">
                  Law Lecture Theatre 3 (LLT 3)
                </p>
                <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  Motion Ground • Opposite Saburi Modern Market
                </p>
              </div>
              <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div
              onClick={() => onLocateVenue('SMS-LT1')}
              className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between hover:border-[#0B57D0]/30 transition-all cursor-pointer group"
            >
              <div>
                <p className="font-medium text-neutral-900 dark:text-white group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors">
                  SMS Lecture Theatre 1 (SMS LT)
                </p>
                <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  Faculty of Administration & Management Sciences
                </p>
              </div>
              <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </GeminiCard>
      </div>
    </div>
  );
};
