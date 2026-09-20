'use client';

import React, { useState } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, Location } from '@/lib/types';

interface AcademicHubViewProps {
  profile: StudentProfile;
  locations: Location[];
  onSelectVenue: (code: string) => void;
  onOpenReader: () => void;
  onOpenSchedule: () => void;
}

export const AcademicHubView: React.FC<AcademicHubViewProps> = ({
  profile,
  onSelectVenue,
  onOpenReader,
  onOpenSchedule,
}) => {
  const [checklist, setChecklist] = useState([
    { id: '1', task: 'Portal Course Registration (ECO 201-208)', done: true },
    { id: '2', task: 'SMS Faculty Dues & Departmental Clearance', done: false },
    { id: '3', task: 'SMS Lecture Theatre 1 Seat Allocation', done: true },
    { id: '4', task: 'Ago-Iwoye Main E-Library Access Pass', done: false },
  ]);

  const toggleTask = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Academic Status & Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#101624] via-[#0A0E17] to-[#06080D] border border-blue-500/20 shadow-[0_0_30px_rgba(56,123,255,0.08)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="blue" size="sm">
              <GeminiIcon name="sparkle" size={12} className="text-[#387BFF]" />
              <span>Academic Engine Active</span>
            </Badge>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-400">
              {profile.institution}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white font-sans">
            Good day, {profile.full_name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {profile.department} Department • {profile.level} • Next lecture at SMS LT1
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectVenue('SMS-LT1')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1A73E8] to-[#387BFF] text-white text-xs font-semibold shadow-[0_0_18px_rgba(56,123,255,0.35)] hover:opacity-95 transition-all active:scale-95"
          >
            <GeminiIcon name="compass" size={15} />
            <span>Locate Lecture Hall</span>
          </button>

          <button
            onClick={onOpenReader}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 text-xs font-medium hover:border-blue-500/40 hover:text-white transition-all active:scale-95"
          >
            <GeminiIcon name="reader" size={15} />
            <span>Study Reader</span>
          </button>
        </div>
      </div>

      {/* Primary Highlights Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Today's Schedule Highlight */}
        <div className="md:col-span-7">
          <GeminiCard className="h-full flex flex-col justify-between" glow>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#387BFF]/15 text-[#387BFF]">
                    <GeminiIcon name="calendar" size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Today's Class Schedule</h2>
                    <p className="text-[10px] font-mono text-slate-400">Monday Routine</p>
                  </div>
                </div>
                <Badge variant="blue" size="sm">Live Session</Badge>
              </div>

              {/* Active Lecture Box */}
              <div className="p-3.5 rounded-xl bg-[#080C14] border border-blue-500/30 shadow-[0_0_16px_rgba(56,123,255,0.1)] mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-tight">ECO 201</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-[#60A5FA]">In Progress</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">Principles of Microeconomics II</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">Lecturer: Dr. K. Balogun</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-[#60A5FA]">08:00 - 10:00</span>
                    <p className="text-[11px] text-slate-400 mt-1">SMS LT1</p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Tiered Seating Section B</span>
                  <button
                    onClick={() => onSelectVenue('SMS-LT1')}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#387BFF] hover:underline"
                  >
                    <span>View on Map</span>
                    <GeminiIcon name="arrow-right" size={13} />
                  </button>
                </div>
              </div>

              {/* Next Lecture */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-slate-200">ECO 203: Applied Statistics</span>
                  <p className="text-[11px] text-slate-400">11:00 - 13:00 • ETF Complex Hall A</p>
                </div>
                <button
                  onClick={onOpenSchedule}
                  className="text-xs text-[#387BFF] hover:underline font-mono"
                >
                  Full Timetable &rarr;
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <GeminiIcon name="shield-check" size={14} className="text-[#387BFF]" />
                <span>Verified by Economics Course Reps</span>
              </div>
              <button onClick={onOpenSchedule} className="hover:text-white transition-colors">
                Mark Attendance
              </button>
            </div>
          </GeminiCard>
        </div>

        {/* Clearance & Registration Tracker */}
        <div className="md:col-span-5">
          <GeminiCard className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#387BFF]/15 text-[#387BFF]">
                    <GeminiIcon name="check-circle" size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Semester Clearance</h2>
                    <p className="text-[10px] font-mono text-slate-400">Verification Steps</p>
                  </div>
                </div>
                <Badge variant="blue" size="sm">
                  {checklist.filter((c) => c.done).length} / {checklist.length} Done
                </Badge>
              </div>

              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleTask(item.id)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-colors cursor-pointer select-none"
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        item.done
                          ? 'bg-[#387BFF] border-[#387BFF] text-black'
                          : 'border-white/30 bg-transparent'
                      }`}
                    >
                      {item.done && <GeminiIcon name="check" size={12} strokeWidth={2.5} />}
                    </div>
                    <span
                      className={`text-xs font-sans ${
                        item.done ? 'text-slate-400 line-through' : 'text-slate-200'
                      }`}
                    >
                      {item.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Deadline: October 5th</span>
              <span className="text-[#387BFF] hover:underline cursor-pointer">OOU Portal Link</span>
            </div>
          </GeminiCard>
        </div>
      </div>

      {/* Secondary Row: Campus Transit & Department Secretariat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shuttle & Transit Hub */}
        <GeminiCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#387BFF]/15 text-[#387BFF]">
                <GeminiIcon name="bus" size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Campus Transit Hub</h3>
                <p className="text-[10px] font-mono text-slate-400">Permanent Site Shuttle</p>
              </div>
            </div>
            <Badge variant="emerald" size="sm">Active Shuttles</Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex justify-between items-center font-mono text-[11px] mb-1">
                <span className="text-white font-medium">Main Gate &rarr; SMS Complex</span>
                <span className="text-[#60A5FA]">₦150 • 6 mins</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Departs every 5 minutes from Central Roundabout opposite Senate Building.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex justify-between items-center font-mono text-[11px] mb-1">
                <span className="text-white font-medium">SMS Complex &rarr; Library / ETF</span>
                <span className="text-slate-400">3 mins walk</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Paved corridor connects SMS eastern wing directly to ETF halls.
              </p>
            </div>
          </div>
        </GeminiCard>

        {/* Department Secretariat */}
        <GeminiCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#387BFF]/15 text-[#387BFF]">
                <GeminiIcon name="graduation-cap" size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Department Secretariat</h3>
                <p className="text-[10px] font-mono text-slate-400">Wing B, 1st Floor SMS</p>
              </div>
            </div>
            <Badge variant="blue" size="sm">Desk Open</Badge>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Faculty Officer:</span>
              <span className="text-white font-sans">Mrs. Olutayo</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Staff Advisor (200L):</span>
              <span className="text-white font-sans">Dr. K. Balogun</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Official Mail:</span>
              <span className="text-[#60A5FA]">economics@oouagoiwoye.edu.ng</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Office Hours: 8:00 AM – 4:00 PM</span>
            <button
              onClick={() => onSelectVenue('SMS-SEC')}
              className="text-[#387BFF] hover:underline flex items-center gap-1"
            >
              <GeminiIcon name="pin" size={13} />
              <span>Pin Venue</span>
            </button>
          </div>
        </GeminiCard>
      </div>
    </div>
  );
};
