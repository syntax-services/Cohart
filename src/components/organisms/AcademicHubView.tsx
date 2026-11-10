'use client';

import React from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, Location } from '@/lib/types';
import { useAttendanceTracker } from '@/hooks/useAttendanceTracker';
import { isOouStudent } from '@/lib/campusVerification';
import { DailyRetentionSuite } from '@/components/retention/DailyRetentionSuite';

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
  const { timetable, logs, getAttendanceAdvice } = useAttendanceTracker(profile.id, profile);
  const advice = getAttendanceAdvice();
  const nextLecture = timetable.find((t) => t.isLiveNow) || timetable[0];

  const studentFirstName = profile.full_name?.trim()
    ? profile.full_name.trim().split(' ')[0]
    : 'Scholar';

  const isAttendanceQualified = advice.rate >= 75;
  const hasCampusMap = isOouStudent(profile.institution);

  const formatVenueDisplay = (venueName?: string, locationId?: string) => {
    if (venueName && !venueName.startsWith('loc-')) return venueName;
    if (locationId === 'loc-sms-lt1' || locationId === 'SMS-LT1') return 'SMS Lecture Theatre (SLR 1)';
    if (locationId === 'loc-soc-sci-econ' || locationId === 'ECO-SMS') return 'Department Building (Economics & Social Sciences Block)';
    if (locationId === 'loc-llt1' || locationId === 'loc-llt-1') return 'Faculty of Art (LLT-I)';
    if (locationId === 'loc-etf-hall') return 'ETF Complex Hall A';
    if (locationId === 'loc-eco-h1') return 'Economics Departmental Hall (ECO-H1)';
    if (locationId === 'loc-ogd-lt') return 'Otunba Gbenga Daniel (OGD) Hall';
    return venueName || 'SMS Lecture Theatre (SLR 1)';
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Clean Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-6 sm:p-8 rounded-[2rem] bg-[#121316] ring-1 ring-white/[0.08] shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-white/[0.06] text-neutral-200 font-semibold border border-white/[0.1]">
              {profile.institution || 'Campus OS'}
            </span>
            <span className="text-sm font-medium text-neutral-400">
              {profile.department ? `${profile.department} • ${profile.level || '100L'}` : 'Academic Intelligence'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-1">
            Welcome back, {studentFirstName}
          </h1>

          <p className="text-sm text-neutral-400 mt-2 font-medium">
            {nextLecture ? `Next lecture: ${nextLecture.courseCode} at ${nextLecture.time}` : 'Your academic workspace is ready.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {hasCampusMap && (
            <button
              onClick={() => onSelectVenue(nextLecture ? nextLecture.locationId : 'SMS-LT1')}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-neutral-200 text-neutral-950 text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <GeminiIcon name="compass" size={18} />
              <span>Find Lecture Hall</span>
            </button>
          )}

          <button
            onClick={() => onOpenAi?.()}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.06] ring-1 ring-white/[0.1] text-neutral-200 text-sm font-semibold hover:bg-white/[0.1] transition-all active:scale-95 cursor-pointer"
          >
            <GeminiIcon name="chat" size={18} />
            <span>Ask Aurora</span>
          </button>
        </div>
      </div>

      {/* Daily Engagement & Retention Suite */}
      <DailyRetentionSuite
        profile={profile}
        onOpenSchedule={onOpenSchedule}
        onSelectVenue={onSelectVenue}
        onOpenReader={onOpenReader}
        onOpenVault={onOpenReader}
      />

      {/* Industrial Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Next Lecture Card */}
        <div className="md:col-span-7">
          <GeminiCard className="h-full flex flex-col justify-between p-6 sm:p-8 rounded-[2rem] bg-[#121316] ring-1 ring-white/[0.08]">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white border border-white/15">
                    <GeminiIcon name="calendar" size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Upcoming Class</h2>
                    <p className="text-xs font-medium text-neutral-400">Timetable & Venue</p>
                  </div>
                </div>
                <Badge variant={nextLecture?.isLiveNow ? 'emerald' : 'slate'} size="md" className="rounded-full">
                  {nextLecture?.isLiveNow ? 'Happening Now' : 'Scheduled'}
                </Badge>
              </div>

              {/* Lecture Details */}
              <div className="p-6 rounded-[1.5rem] bg-white/[0.03] ring-1 ring-white/[0.06] space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.06] text-neutral-200 border border-white/[0.1]">
                    {nextLecture ? nextLecture.courseCode : 'ECO 201'}
                  </span>
                  <span className="text-sm font-medium text-neutral-400">
                    {nextLecture ? nextLecture.time : '08:00 - 10:00 AM'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white leading-tight">
                  {nextLecture ? nextLecture.courseTitle : 'Principles of Microeconomics II'}
                </h3>

                <div className="flex items-center gap-2 text-sm text-neutral-300 font-medium">
                  <GeminiIcon name="pin" size={16} className="text-neutral-300" />
                  <span>Venue: <strong className="font-semibold text-white">{formatVenueDisplay(nextLecture?.venueName, nextLecture?.locationId)}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`grid gap-3 text-sm font-semibold ${hasCampusMap ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {hasCampusMap && (
                  <button
                    onClick={() => onSelectVenue(nextLecture ? nextLecture.locationId : 'loc-sms-lt1')}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] text-neutral-200 hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <GeminiIcon name="compass" size={16} />
                    <span>Directions</span>
                  </button>
                )}
                <button
                  onClick={onOpenReader}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] text-neutral-200 hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <GeminiIcon name="reader" size={16} />
                  <span>Study Notes</span>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-between text-sm font-medium text-neutral-400">
              <span>{timetable.length} classes this week</span>
              <button onClick={onOpenSchedule} className="text-neutral-300 hover:text-white hover:underline transition-colors cursor-pointer font-semibold">
                View Timetable &rarr;
              </button>
            </div>
          </GeminiCard>
        </div>

        {/* Class Attendance Summary Card */}
        <div className="md:col-span-5">
          <GeminiCard className="h-full flex flex-col justify-between p-6 sm:p-8 rounded-[2rem] bg-[#121316] ring-1 ring-white/[0.08]">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white border border-white/15">
                    <GeminiIcon name="shield-check" size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Attendance</h2>
                    <p className="text-xs font-medium text-neutral-400">Eligibility Metric</p>
                  </div>
                </div>
                <Badge variant={isAttendanceQualified ? 'emerald' : 'slate'} size="md" className="rounded-full">
                  {isAttendanceQualified ? 'Qualified' : 'Below 75%'}
                </Badge>
              </div>

              {/* Attendance Metric Hero */}
              <div className="p-6 rounded-[1.5rem] bg-white/[0.03] ring-1 ring-white/[0.06] space-y-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-4xl font-semibold font-mono text-white tracking-tight">
                    {advice.rate}%
                  </span>
                  <span className="text-sm font-medium text-neutral-400">
                    {logs.length} logged
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      advice.rate >= 75
                        ? 'bg-white'
                        : advice.rate >= 50
                        ? 'bg-neutral-300'
                        : 'bg-neutral-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, advice.rate))}%` }}
                  />
                </div>

                <p className="text-sm text-neutral-300 font-medium leading-relaxed">
                  {advice.text}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/[0.06]">
              <button
                onClick={onOpenSchedule}
                className="w-full py-3 px-4 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] text-neutral-200 text-sm font-semibold hover:bg-white/[0.08] transition-colors cursor-pointer text-center"
              >
                Check In to Class
              </button>
            </div>
          </GeminiCard>
        </div>
      </div>

      {/* Quick Actions Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <button
          onClick={() => onOpenAi?.('Set 10 objective CBT questions for my department courses', 'general')}
          className="group relative overflow-hidden rounded-[2rem] p-6 bg-[#121316] ring-1 ring-white/[0.08] shadow-sm text-left flex flex-col h-full hover:ring-white/[0.16] hover:bg-white/[0.02] transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="h-12 w-12 mb-5 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/15 group-hover:scale-110 transition-transform duration-300 ease-out">
            <GeminiIcon name="zap" size={22} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Generate Quiz</h3>
          <p className="text-xs text-neutral-400 font-medium">Practice with 10 smart questions</p>
        </button>

        <button
          onClick={onOpenReader}
          className="group relative overflow-hidden rounded-[2rem] p-6 bg-[#121316] ring-1 ring-white/[0.08] shadow-sm text-left flex flex-col h-full hover:ring-white/[0.16] hover:bg-white/[0.02] transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="h-12 w-12 mb-5 rounded-full bg-white/[0.06] flex items-center justify-center text-white border border-white/10 group-hover:scale-110 transition-transform duration-300 ease-out">
            <GeminiIcon name="reader" size={22} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Study Notes</h3>
          <p className="text-xs text-neutral-400 font-medium">Continue where you left off</p>
        </button>

        <button
          onClick={() => onOpenAi?.('Test my exam readiness with 5 challenging course questions', 'grill_mode')}
          className="group relative overflow-hidden rounded-[2rem] p-6 bg-[#121316] ring-1 ring-white/[0.08] shadow-sm text-left flex flex-col h-full hover:ring-white/[0.16] hover:bg-white/[0.02] transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="h-12 w-12 mb-5 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/15 group-hover:scale-110 transition-transform duration-300 ease-out">
            <GeminiIcon name="check-circle" size={22} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Test Readiness</h3>
          <p className="text-xs text-neutral-400 font-medium">Enter Grill Mode</p>
        </button>
      </div>
    </div>
  );
};
