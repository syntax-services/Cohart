'use client';

import React from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, Location } from '@/lib/types';
import { useAttendanceTracker } from '@/hooks/useAttendanceTracker';

interface AcademicHubViewProps {
  profile: StudentProfile;
  locations: Location[];
  onSelectVenue: (code: string) => void;
  onOpenReader: () => void;
  onOpenSchedule: () => void;
  onOpenProfile?: () => void;
  onOpenAi?: (prompt?: string, mode?: 'general' | 'grill_mode') => void;
  verifiedMilestones?: string[];
  onMarkMilestone?: (milestoneId: string) => void;
}

export const AcademicHubView: React.FC<AcademicHubViewProps> = ({
  profile,
  onSelectVenue,
  onOpenReader,
  onOpenSchedule,
  onOpenProfile,
  onOpenAi,
}) => {
  const { timetable, logs, getAttendanceAdvice } = useAttendanceTracker(profile.id);
  const advice = getAttendanceAdvice();
  const nextLecture = timetable.find((t) => t.isLiveNow) || timetable[0];

  const studentFirstName = profile.full_name?.trim()
    ? profile.full_name.trim().split(' ')[0]
    : 'Scholar';

  const isAttendanceQualified = advice.rate >= 75;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Clean Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-xl shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA] font-bold">
              {profile.institution}
            </span>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              {profile.department
                ? `${profile.department} • ${profile.level || '100L'}`
                : 'Student Hub'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-sans mt-0.5">
            Welcome back, {studentFirstName}
          </h1>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {nextLecture
              ? `Next lecture: ${nextLecture.courseCode} at ${nextLecture.time}`
              : 'Campus Hub'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onSelectVenue(nextLecture ? nextLecture.locationId : 'SMS-LT1')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <GeminiIcon name="compass" size={14} />
            <span>Find Lecture Hall</span>
          </button>

          <button
            onClick={() => onOpenAi?.()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200 text-xs font-medium hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-all active:scale-95 cursor-pointer"
          >
            <GeminiIcon name="sparkle" size={14} />
            <span>Ask Cohart AI</span>
          </button>
        </div>
      </div>

      {/* Industrial Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Next Lecture Card */}
        <div className="md:col-span-7">
          <GeminiCard className="h-full flex flex-col justify-between p-5 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                    <GeminiIcon name="calendar" size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Upcoming Class</h2>
                    <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Timetable & Venue</p>
                  </div>
                </div>
                <Badge variant={nextLecture?.isLiveNow ? 'emerald' : 'blue'} size="sm">
                  {nextLecture?.isLiveNow ? 'Happening Now' : 'Scheduled'}
                </Badge>
              </div>

              {/* Lecture Details */}
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                    {nextLecture ? nextLecture.courseCode : 'ECO 201'}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {nextLecture ? nextLecture.time : '09:00 - 11:00 AM'}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {nextLecture ? nextLecture.courseTitle : 'Microeconomic Theory I'}
                </h3>

                <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                  <GeminiIcon name="pin" size={13} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
                  <span>Venue: <strong>{nextLecture ? nextLecture.locationId : 'SMS-LT1'}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onSelectVenue(nextLecture ? nextLecture.locationId : 'SMS-LT1')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200 font-medium hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <GeminiIcon name="compass" size={14} />
                  <span>Directions</span>
                </button>
                <button
                  onClick={onOpenReader}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200 font-medium hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <GeminiIcon name="reader" size={14} />
                  <span>Study Notes</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              <span>{timetable.length} classes scheduled this week</span>
              <button onClick={onOpenSchedule} className="text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer">
                Full Timetable &rarr;
              </button>
            </div>
          </GeminiCard>
        </div>

        {/* Class Attendance Summary Card */}
        <div className="md:col-span-5">
          <GeminiCard className="h-full flex flex-col justify-between p-5 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <GeminiIcon name="shield-check" size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Attendance</h2>
                    <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Exam Eligibility Metric</p>
                  </div>
                </div>
                <Badge variant={isAttendanceQualified ? 'emerald' : 'amber'} size="sm">
                  {isAttendanceQualified ? 'Qualified' : 'Below 75%'}
                </Badge>
              </div>

              {/* Attendance Metric Hero */}
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold font-mono text-neutral-900 dark:text-white">
                    {advice.rate}%
                  </span>
                  <span className="text-xs font-mono text-neutral-500">
                    {logs.length} logged
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      advice.rate >= 75
                        ? 'bg-emerald-500'
                        : advice.rate >= 50
                        ? 'bg-[#0B57D0] dark:bg-[#A8C7FA]'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, advice.rate))}%` }}
                  />
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  {advice.text}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
              <button
                onClick={onOpenSchedule}
                className="w-full py-2 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200 font-medium hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer text-center"
              >
                Check In to Class
              </button>
            </div>
          </GeminiCard>
        </div>
      </div>

      {/* AI Practice & Quick Study Hub */}
      <div className="p-5 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
              <GeminiIcon name="sparkle" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Exam Practice & Study Assistant</h2>
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Past questions, smart explanations & CBT drills</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAi?.('Set 10 practice exam questions for my courses', 'general')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs"
            >
              <GeminiIcon name="zap" size={13} />
              <span>Start Practice Quiz</span>
            </button>
          </div>
        </div>

        {/* Real Academic Action Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => onOpenAi?.('Set 10 objective CBT questions for my department courses', 'general')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 text-xs shrink-0 transition-all cursor-pointer"
          >
            <GeminiIcon name="zap" size={13} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
            <span>Generate CBT Quiz</span>
          </button>

          <button
            onClick={() => onOpenAi?.('Give me a high-yield summary of my next lecture topic', 'general')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 text-xs shrink-0 transition-all cursor-pointer"
          >
            <GeminiIcon name="reader" size={13} />
            <span>Summarize Lecture</span>
          </button>

          <button
            onClick={() => onOpenAi?.('Test my exam readiness with 5 challenging course questions', 'grill_mode')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 text-xs shrink-0 transition-all cursor-pointer"
          >
            <GeminiIcon name="check-circle" size={13} />
            <span>Test My Readiness</span>
          </button>

          <button
            onClick={() => onSelectVenue(nextLecture ? nextLecture.locationId : 'SMS-LT1')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 text-xs shrink-0 transition-all cursor-pointer"
          >
            <GeminiIcon name="pin" size={13} />
            <span>Find Lecture Venue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
