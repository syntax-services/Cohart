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
    <div className="space-y-5">
      {/* Schedule Header & Day Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-[#080C14] border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-[#60A5FA]">
              {profile.department}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-mono text-slate-400">
              {profile.level} Master Timetable
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
            Lecture Schedule & Attendance
          </h1>
        </div>

        {/* Day Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                activeDay === day
                  ? 'bg-gradient-to-r from-[#1A73E8] to-[#387BFF] text-white font-semibold shadow-[0_0_12px_rgba(56,123,255,0.3)]'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Proactive Attendance Advisor Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0C1526] via-[#0A0F1D] to-[#070B14] border border-blue-500/25 shadow-[0_0_24px_rgba(56,123,255,0.12)]">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#387BFF]/20 text-[#387BFF]">
            <GeminiIcon name="sparkle" size={18} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-semibold text-white">Smart Attendance Advisor</h3>
              <Badge variant="blue" size="sm">
                <span>{advice.rate}% CA Readiness</span>
              </Badge>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {advice.text}
            </p>
          </div>
        </div>
      </div>

      {/* Toast feedback */}
      {markedToast && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <GeminiIcon name="check-circle" size={16} />
          <span>{markedToast}</span>
        </div>
      )}

      {/* Daily Timetable Cards */}
      <div className="space-y-3">
        {filteredSchedule.length === 0 ? (
          <GeminiCard className="text-center py-10">
            <p className="text-xs font-mono text-slate-400">
              No scheduled lectures found for {activeDay}. Use this period for asynchronous reading.
            </p>
          </GeminiCard>
        ) : (
          filteredSchedule.map((lecture) => {
            const hasMarked = hasMarkedToday(lecture.courseCode);

            return (
              <GeminiCard key={lecture.id} glow={lecture.isLiveNow}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white tracking-tight">
                        {lecture.courseCode}
                      </span>
                      {lecture.isLiveNow && (
                        <Badge variant="blue" size="sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#387BFF] animate-pulse" />
                          <span>Active Now</span>
                        </Badge>
                      )}
                      <span className="text-[11px] font-mono text-slate-400">
                        {lecture.time}
                      </span>
                    </div>

                    <h2 className="text-xs sm:text-sm font-medium text-slate-200">
                      {lecture.courseTitle}
                    </h2>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      Lecturer: {lecture.lecturer} • Venue: {lecture.venueName}
                    </p>
                  </div>

                  {/* Actions: Attendance Mark & Map Pin */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onLocateVenue(lecture.locationId.replace('loc-', '').toUpperCase())}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 hover:text-white hover:border-white/[0.16] transition-all"
                    >
                      <GeminiIcon name="pin" size={14} />
                      <span className="hidden xs:inline">Map</span>
                    </button>

                    <button
                      disabled={hasMarked || isSubmitting}
                      onClick={() => handleMark(lecture.courseCode, lecture.venueName)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                        hasMarked
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 cursor-default'
                          : 'bg-gradient-to-r from-[#1A73E8] to-[#387BFF] text-white shadow-[0_0_16px_rgba(56,123,255,0.3)] hover:opacity-95'
                      }`}
                    >
                      <GeminiIcon name={hasMarked ? 'check' : 'check-circle'} size={15} />
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
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#387BFF]/15 text-[#387BFF]">
                <GeminiIcon name="bell" size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Upcoming Test Reminders</h3>
                <p className="text-[10px] font-mono text-slate-400">Department CA Schedule</p>
              </div>
            </div>
            <Badge variant="blue" size="sm">2 Tests Upcoming</Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex justify-between font-mono text-[11px] mb-1">
                <span className="text-white font-medium">ECO 201 Continuous Assessment</span>
                <span className="text-[#60A5FA]">Oct 18 • 10:00 AM</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Venue: SMS Lecture Theatre 1. Focus: Cournot Equilibrium & Consumer Surplus.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex justify-between font-mono text-[11px] mb-1">
                <span className="text-white font-medium">ECO 203 Empirical Statistics Quiz</span>
                <span className="text-[#60A5FA]">Oct 24 • 11:30 AM</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Venue: ETF Hall A. Scientific calculator & statistical table mandatory.
              </p>
            </div>
          </div>
        </GeminiCard>

        {/* Verified Attendance History */}
        <GeminiCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#387BFF]/15 text-[#387BFF]">
                <GeminiIcon name="shield-check" size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Attendance Logs</h3>
                <p className="text-[10px] font-mono text-slate-400">Supabase Verified</p>
              </div>
            </div>
            <Badge variant="emerald" size="sm">{logs.length} Logged</Badge>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 font-mono">
              Tap "Mark Attendance" during lecture hours to start your trail.
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {logs.slice(0, 4).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] font-mono"
                >
                  <div className="flex items-center gap-2">
                    <GeminiIcon name="check" size={13} className="text-emerald-400" />
                    <span className="text-white font-medium">{l.course_code}</span>
                    <span className="text-slate-400">{l.venue}</span>
                  </div>
                  <span className="text-slate-500">
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
