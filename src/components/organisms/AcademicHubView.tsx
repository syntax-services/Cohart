'use client';

import React from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, Location } from '@/lib/types';
import { useAttendanceTracker } from '@/hooks/useAttendanceTracker';
import { isOouStudent } from '@/lib/campusVerification';

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
  const hasCampusMap = isOouStudent(profile.institution);

  return (
    <div className="space-y-6 sm:space-y-8 pb-32">
      {/* Clean Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-6 sm:p-8 rounded-[2rem] bg-white/80 dark:bg-[#12151E]/80 border border-black/[0.04] dark:border-white/[0.04] backdrop-blur-3xl shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8] font-bold">
              {profile.institution}
            </span>
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {profile.department
                ? `${profile.department} • ${profile.level || '100L'}`
                : 'Student Hub'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white font-sans mt-2">
            Welcome back, {studentFirstName}
          </h1>

          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
            {nextLecture
              ? `Next lecture: ${nextLecture.courseCode} at ${nextLecture.time}`
              : 'Campus Hub'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {hasCampusMap && (
            <button
              onClick={() => onSelectVenue(nextLecture ? nextLecture.locationId : 'SMS-LT1')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-sm font-bold hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <GeminiIcon name="compass" size={20} />
              <span>Find Lecture Hall</span>
            </button>
          )}

          <button
            onClick={() => onOpenAi?.()}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200 text-sm font-bold hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-all active:scale-95 cursor-pointer"
          >
            <GeminiIcon name="chat" size={20} />
            <span>Ask Cohart AI</span>
          </button>
        </div>
      </div>

      {/* Industrial Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Next Lecture Card */}
        <div className="md:col-span-7">
          <GeminiCard className="h-full flex flex-col justify-between p-6 sm:p-8 rounded-[2rem] bg-white/80 dark:bg-[#12151E]/80 backdrop-blur-3xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8]">
                    <GeminiIcon name="calendar" size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Upcoming Class</h2>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Timetable & Venue</p>
                  </div>
                </div>
                <Badge variant={nextLecture?.isLiveNow ? 'emerald' : 'blue'} size="md">
                  {nextLecture?.isLiveNow ? 'Happening Now' : 'Scheduled'}
                </Badge>
              </div>

              {/* Lecture Details */}
              <div className="p-5 rounded-[1.25rem] bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] space-y-3 mb-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold px-3 py-1 rounded-lg bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8]">
                    {nextLecture ? nextLecture.courseCode : 'ECO 201'}
                  </span>
                  <span className="text-sm font-medium text-neutral-500">
                    {nextLecture ? nextLecture.time : '09:00 - 11:00 AM'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {nextLecture ? nextLecture.courseTitle : 'Microeconomic Theory I'}
                </h3>

                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300 font-medium">
                  <GeminiIcon name="pin" size={18} className="text-[#0B57D0] dark:text-[#1A73E8]" />
                  <span>Venue: <strong>{nextLecture ? nextLecture.locationId : 'SMS-LT1'}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`grid gap-3 text-sm font-bold ${hasCampusMap ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {hasCampusMap && (
                  <button
                    onClick={() => onSelectVenue(nextLecture ? nextLecture.locationId : 'SMS-LT1')}
                    className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-neutral-800 dark:text-neutral-200 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <GeminiIcon name="compass" size={18} />
                    <span>Directions</span>
                  </button>
                )}
                <button
                  onClick={onOpenReader}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-neutral-800 dark:text-neutral-200 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <GeminiIcon name="reader" size={18} />
                  <span>Study Notes</span>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-sm font-medium text-neutral-500 dark:text-neutral-400">
              <span>{timetable.length} classes scheduled this week</span>
              <button onClick={onOpenSchedule} className="text-[#0B57D0] dark:text-[#1A73E8] hover:underline cursor-pointer font-bold">
                Full Timetable &rarr;
              </button>
            </div>
          </GeminiCard>
        </div>

        {/* Class Attendance Summary Card */}
        <div className="md:col-span-5">
          <GeminiCard className="h-full flex flex-col justify-between p-6 sm:p-8 rounded-[2rem] bg-white/80 dark:bg-[#12151E]/80 backdrop-blur-3xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <GeminiIcon name="shield-check" size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Attendance</h2>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Exam Eligibility Metric</p>
                  </div>
                </div>
                <Badge variant={isAttendanceQualified ? 'emerald' : 'amber'} size="md">
                  {isAttendanceQualified ? 'Qualified' : 'Below 75%'}
                </Badge>
              </div>

              {/* Attendance Metric Hero */}
              <div className="p-5 rounded-[1.25rem] bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-4xl font-bold font-mono text-neutral-900 dark:text-white">
                    {advice.rate}%
                  </span>
                  <span className="text-sm font-medium text-neutral-500">
                    {logs.length} logged
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      advice.rate >= 75
                        ? 'bg-emerald-500'
                        : advice.rate >= 50
                        ? 'bg-[#0B57D0] dark:bg-[#1A73E8]'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, advice.rate))}%` }}
                  />
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
                  {advice.text}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.06]">
              <button
                onClick={onOpenSchedule}
                className="w-full py-3.5 px-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-neutral-800 dark:text-neutral-200 text-sm font-bold hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer text-center"
              >
                Check In to Class
              </button>
            </div>
          </GeminiCard>
        </div>
      </div>

      {/* AI Practice & Quick Study Hub */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white/80 dark:bg-[#12151E]/80 border border-black/[0.04] dark:border-white/[0.04] backdrop-blur-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8]">
              <GeminiIcon name="brain" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Exam Practice & Study Assistant</h2>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Past questions, smart explanations & CBT drills</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAi?.('Set 10 practice exam questions for my courses', 'general')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-sm font-bold hover:opacity-90 transition-all cursor-pointer shadow-md"
            >
              <GeminiIcon name="zap" size={18} />
              <span>Start Practice Quiz</span>
            </button>
          </div>
        </div>

        {/* Real Academic Action Chips */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => onOpenAi?.('Set 10 objective CBT questions for my department courses', 'general')}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 text-sm font-bold shrink-0 transition-all cursor-pointer"
          >
            <GeminiIcon name="zap" size={18} className="text-[#0B57D0] dark:text-[#1A73E8]" />
            <span>Generate CBT Quiz</span>
          </button>

          <button
            onClick={() => onOpenAi?.('Give me a high-yield summary of my next lecture topic', 'general')}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 text-sm font-bold shrink-0 transition-all cursor-pointer"
          >
            <GeminiIcon name="reader" size={18} />
            <span>Summarize Lecture</span>
          </button>

          <button
            onClick={() => onOpenAi?.('Test my exam readiness with 5 challenging course questions', 'grill_mode')}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 text-sm font-bold shrink-0 transition-all cursor-pointer"
          >
            <GeminiIcon name="check-circle" size={18} />
            <span>Test My Readiness</span>
          </button>

          {hasCampusMap && (
            <button
              onClick={() => onSelectVenue(nextLecture ? nextLecture.locationId : 'SMS-LT1')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 text-sm font-bold shrink-0 transition-all cursor-pointer"
            >
              <GeminiIcon name="pin" size={18} />
              <span>Find Lecture Venue</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
