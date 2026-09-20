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
    <div className="space-y-4 sm:space-y-5">
      {/* Top Academic Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] transition-colors">
        <div>
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            {profile.institution} • {profile.department}
          </span>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white font-sans mt-0.5">
            Good day, {profile.full_name.split(' ')[0]}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {profile.level} • Next lecture at SMS LT1
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onSelectVenue('SMS-LT1')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-medium hover:opacity-90 transition-all active:scale-95"
          >
            <GeminiIcon name="compass" size={14} />
            <span>Locate Hall</span>
          </button>

          <button
            onClick={onOpenReader}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200 text-xs font-medium hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-all active:scale-95"
          >
            <GeminiIcon name="reader" size={14} />
            <span>Open Reader</span>
          </button>
        </div>
      </div>

      {/* Primary Highlights Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Today's Schedule Highlight */}
        <div className="md:col-span-7">
          <GeminiCard className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                    <GeminiIcon name="calendar" size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Today's Lectures</h2>
                    <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Monday Schedule</p>
                  </div>
                </div>
                <Badge variant="blue" size="sm">Active</Badge>
              </div>

              {/* Active Lecture Box */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">ECO 201</span>
                      <span className="text-[10px] font-mono text-[#0B57D0] dark:text-[#A8C7FA]">08:00 - 10:00</span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-200 mt-0.5">Principles of Microeconomics II</p>
                    <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">Dr. K. Balogun</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">SMS LT1</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Ground floor, East wing</span>
                  <button
                    onClick={() => onSelectVenue('SMS-LT1')}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:underline"
                  >
                    <span>View Map</span>
                    <GeminiIcon name="arrow-right" size={13} />
                  </button>
                </div>
              </div>

              {/* Next Lecture */}
              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">ECO 203: Applied Statistics</span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">11:00 - 13:00 • ETF Complex Hall A</p>
                </div>
                <button
                  onClick={onOpenSchedule}
                  className="text-xs text-[#0B57D0] dark:text-[#A8C7FA] hover:underline font-mono"
                >
                  Timetable &rarr;
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              <span>Departmental Timetable</span>
              <button onClick={onOpenSchedule} className="text-[#0B57D0] dark:text-[#A8C7FA] hover:underline">
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
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                    <GeminiIcon name="check-circle" size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Semester Clearance</h2>
                    <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Verification Steps</p>
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
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] hover:border-black/[0.15] dark:hover:border-white/[0.15] transition-colors cursor-pointer select-none"
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        item.done
                          ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] border-[#0B57D0] dark:border-[#A8C7FA] text-white dark:text-neutral-950'
                          : 'border-neutral-300 dark:border-neutral-600 bg-transparent'
                      }`}
                    >
                      {item.done && <GeminiIcon name="check" size={11} strokeWidth={2.5} />}
                    </div>
                    <span
                      className={`text-xs font-sans ${
                        item.done ? 'text-neutral-400 dark:text-neutral-500 line-through' : 'text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      {item.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              <span>Deadline: October 5th</span>
              <span className="text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer">OOU Portal Link</span>
            </div>
          </GeminiCard>
        </div>
      </div>

      {/* Secondary Row: Campus Transit & Department Secretariat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Campus Shuttle Hub */}
        <GeminiCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                <GeminiIcon name="bus" size={15} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Campus Transit</h3>
                <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Main Gate & Shuttle Quad</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
              <div className="flex justify-between items-center font-mono text-[11px] mb-1">
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">Main Gate &rarr; SMS Complex</span>
                <span className="text-[#0B57D0] dark:text-[#A8C7FA]">₦150 • 6 mins</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Departs from Central Roundabout opposite Senate Building.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
              <div className="flex justify-between items-center font-mono text-[11px] mb-1">
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">SMS Complex &rarr; Library / ETF</span>
                <span className="text-neutral-500 dark:text-neutral-400">3 mins walk</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Covered walkway connects SMS directly to ETF and central quad.
              </p>
            </div>
          </div>
        </GeminiCard>

        {/* Department Secretariat */}
        <GeminiCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                <GeminiIcon name="graduation-cap" size={15} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Department Office</h3>
                <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">SMS Wing B, 1st Floor</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] p-3 space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
              <span>Faculty Officer:</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-sans">Mrs. Olutayo</span>
            </div>
            <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
              <span>Staff Advisor (200L):</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-sans">Dr. K. Balogun</span>
            </div>
            <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
              <span>Official Mail:</span>
              <span className="text-[#0B57D0] dark:text-[#A8C7FA]">economics@oouagoiwoye.edu.ng</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-500 dark:text-neutral-400">Office Hours: 8:00 AM – 4:00 PM</span>
            <button
              onClick={() => onSelectVenue('SMS-SEC')}
              className="text-[#0B57D0] dark:text-[#A8C7FA] hover:underline flex items-center gap-1"
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
