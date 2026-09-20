'use client';

import React, { useState } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { useAttendanceTracker } from '@/hooks/useAttendanceTracker';
import { StudentProfile } from '@/lib/types';

interface ScheduleViewProps {
  profile: StudentProfile;
  onLocateVenue: (code: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ profile, onLocateVenue }) => {
  const { timetable, logs, isSubmitting, markAttendance, hasMarkedToday, getAttendanceAdvice } =
    useAttendanceTracker(profile.id);

  const [activeDay, setActiveDay] = useState<string>('Monday');
  const [markedToast, setMarkedToast] = useState<string | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const filteredSchedule = timetable.filter((item) => item.day === activeDay);
  const advice = getAttendanceAdvice();

  const handleMark = async (courseCode: string, venue: string) => {
    await markAttendance(courseCode, venue);
    setMarkedToast(`Attendance verified for ${courseCode} at ${venue}`);
    setTimeout(() => setMarkedToast(null), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Schedule Header & Day Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] transition-colors">
        <div>
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            {profile.department} • {profile.level}
          </span>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900 dark:text-white font-sans mt-0.5">
            Weekly Schedule
          </h1>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                activeDay === day
                  ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-medium'
                  : 'bg-black/[0.03] dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Status Bar */}
      <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <GeminiIcon name="check-circle" size={15} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
          <span className="text-neutral-700 dark:text-neutral-300 font-sans">
            {advice.text}
          </span>
        </div>
        <span className="font-mono font-medium text-[#0B57D0] dark:text-[#A8C7FA] shrink-0">
          {advice.rate}% Logged
        </span>
      </div>

      {/* Toast feedback */}
      {markedToast && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <GeminiIcon name="check" size={14} />
          <span>{markedToast}</span>
        </div>
      )}

      {/* Daily Timetable Cards */}
      <div className="space-y-3">
        {filteredSchedule.length === 0 ? (
          <GeminiCard className="text-center py-10">
            <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              No scheduled lectures for {activeDay}.
            </p>
          </GeminiCard>
        ) : (
          filteredSchedule.map((lecture) => {
            const hasMarked = hasMarkedToday(lecture.courseCode);

            return (
              <GeminiCard key={lecture.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">
                        {lecture.courseCode}
                      </span>
                      {lecture.isLiveNow && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 text-[#0B57D0] dark:text-[#A8C7FA] font-medium">
                          Active Now
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                        {lecture.time}
                      </span>
                    </div>

                    <h2 className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {lecture.courseTitle}
                    </h2>
                    <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Lecturer: {lecture.lecturer} • {lecture.venueName}
                    </p>
                  </div>

                  {/* Actions: Attendance Mark & Map Pin */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onLocateVenue(lecture.locationId.replace('loc-', '').toUpperCase())}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-all"
                    >
                      <GeminiIcon name="pin" size={13} />
                      <span className="hidden xs:inline">Map</span>
                    </button>

                    <button
                      disabled={hasMarked || isSubmitting}
                      onClick={() => handleMark(lecture.courseCode, lecture.venueName)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                        hasMarked
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 cursor-default'
                          : 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 hover:opacity-90'
                      }`}
                    >
                      <GeminiIcon name={hasMarked ? 'check' : 'check-circle'} size={14} />
                      <span>{hasMarked ? 'Marked Present' : 'Mark Attendance'}</span>
                    </button>
                  </div>
                </div>
              </GeminiCard>
            );
          })
        )}
      </div>

      {/* Test Reminders & Continuous Assessment Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Test Reminders Card */}
        <GeminiCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                <GeminiIcon name="bell" size={15} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Upcoming Assessments</h3>
                <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Department CA Schedule</p>
              </div>
            </div>
            <span className="text-xs font-mono text-neutral-500">2 upcoming</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
              <div className="flex justify-between font-mono text-[11px] mb-1">
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">ECO 201 Test</span>
                <span className="text-[#0B57D0] dark:text-[#A8C7FA]">Oct 18 • 10:00 AM</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                SMS Lecture Theatre 1 • Cournot Equilibrium & Consumer Surplus
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
              <div className="flex justify-between font-mono text-[11px] mb-1">
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">ECO 203 Statistics Quiz</span>
                <span className="text-[#0B57D0] dark:text-[#A8C7FA]">Oct 24 • 11:30 AM</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                ETF Hall A • Tables & scientific calculators permitted
              </p>
            </div>
          </div>
        </GeminiCard>

        {/* Verified Attendance History */}
        <GeminiCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                <GeminiIcon name="shield-check" size={15} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Recent Attendance</h3>
                <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Verified Logs</p>
              </div>
            </div>
            <span className="text-xs font-mono text-neutral-500">{logs.length} logged</span>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-6 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              Tap "Mark Attendance" during lecture hours to record your attendance.
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {logs.slice(0, 4).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] text-[11px] font-mono"
                >
                  <div className="flex items-center gap-2">
                    <GeminiIcon name="check" size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-neutral-800 dark:text-neutral-200 font-medium">{l.course_code}</span>
                    <span className="text-neutral-500 dark:text-neutral-400">{l.venue}</span>
                  </div>
                  <span className="text-neutral-400 dark:text-neutral-500">
                    {new Date(l.attended_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GeminiCard>
      </div>
    </div>
  );
};
