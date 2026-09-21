'use client';

import React, { useMemo } from 'react';
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
  verifiedMilestones = [],
}) => {
  const { timetable, getAttendanceAdvice } = useAttendanceTracker(profile.id);
  const advice = getAttendanceAdvice();
  const nextLecture = timetable.find((t) => t.isLiveNow) || timetable[0];

  const studentFirstName = profile.full_name?.trim()
    ? profile.full_name.trim().split(' ')[0]
    : 'Scholar';

  const isProfileComplete = Boolean(
    profile.full_name?.trim() &&
    profile.department?.trim() &&
    profile.matric_number?.trim()
  );

  const isAttendanceQualified = advice.rate >= 75;

  // 2-Way Synced Milestones Definition
  const milestones = useMemo(() => [
    {
      id: 'profile_complete',
      label: 'Student Profile & Department Setup',
      done: isProfileComplete || verifiedMilestones.includes('profile_complete'),
      instruction: 'Set your name, department, matric no in Profile Settings',
      action: onOpenProfile,
    },
    {
      id: 'course_form',
      label: 'Departmental Course Form Verification',
      done: verifiedMilestones.includes('course_form'),
      instruction: 'Tell Cohart AI: "I signed and submitted my course form"',
      action: () => onOpenAi?.('I have submitted and verified my green course form with my department.'),
    },
    {
      id: 'advisor_sign',
      label: 'Faculty Level Advisor Clearance',
      done: verifiedMilestones.includes('advisor_sign'),
      instruction: 'Tell Cohart AI: "My faculty advisor cleared my courses"',
      action: () => onOpenAi?.('My faculty advisor has cleared and signed my course registration.'),
    },
    {
      id: 'ca_target',
      label: '75% Lecture Attendance CA Target',
      done: isAttendanceQualified || verifiedMilestones.includes('ca_target'),
      instruction: 'Achieved automatically when CA attendance >= 75%',
      action: onOpenSchedule,
    },
    {
      id: 'reader_quiz',
      label: 'Foundational Curriculum Recall Test',
      done: verifiedMilestones.includes('reader_quiz'),
      instruction: 'Complete chapter checkpoints in Course Reader',
      action: onOpenReader,
    },
  ], [isProfileComplete, verifiedMilestones, isAttendanceQualified, onOpenProfile, onOpenAi, onOpenSchedule, onOpenReader]);

  const completedCount = milestones.filter((m) => m.done).length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Academic Greeting Header with Liquid Glass */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-xl shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA] font-bold">
              {profile.institution}
            </span>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              {profile.department ? `${profile.department} • ${profile.level || '100L'}` : 'Profile Pending Setup'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-sans mt-0.5">
            Welcome back, {studentFirstName}
          </h1>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {nextLecture
              ? `Next Up: ${nextLecture.courseCode} (${nextLecture.courseTitle}) at ${nextLecture.time}`
              : 'Permanent Site (PS) Ago-Iwoye Academic Session'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenSchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            <GeminiIcon name="check-circle" size={13} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
            <span>{advice.rate}% CA Score</span>
          </button>

          <button
            onClick={() => onSelectVenue(nextLecture ? nextLecture.locationId : 'SMS-LT1')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-medium hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <GeminiIcon name="compass" size={14} />
            <span>Locate Hall</span>
          </button>

          <button
            onClick={() => onOpenAi?.()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200 text-xs font-medium hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-all active:scale-95 cursor-pointer"
          >
            <GeminiIcon name="sparkle" size={14} />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Primary Highlights Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Next Lecture & Active Protocol Card */}
        <div className="md:col-span-7">
          <GeminiCard className="h-full flex flex-col justify-between p-5 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                    <GeminiIcon name="calendar" size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Active Lecture Schedule</h2>
                    <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Timetable & Attendance Gate</p>
                  </div>
                </div>
                <Badge variant={nextLecture?.isLiveNow ? 'emerald' : 'blue'} size="sm">
                  {nextLecture?.isLiveNow ? 'Lecture In Progress' : 'Upcoming'}
                </Badge>
              </div>

              {/* Lecture Highlights */}
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
                  <span>Venue: <strong>{nextLecture ? nextLecture.locationId : 'SMS-LT1'}</strong> (Open seating on arrival)</span>
                </div>
              </div>

              {/* Quick Action Bar */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onSelectVenue(nextLecture ? nextLecture.locationId : 'SMS-LT1')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200 font-medium hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <GeminiIcon name="compass" size={13} />
                  <span>Walk Route</span>
                </button>
                <button
                  onClick={onOpenReader}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200 font-medium hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <GeminiIcon name="reader" size={13} />
                  <span>Prep Notes</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              <span>CA Target: 75% Required for Exams</span>
              <button onClick={onOpenSchedule} className="text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer">
                View Timetable &rarr;
              </button>
            </div>
          </GeminiCard>
        </div>

        {/* 2-Way Synced Semester Milestones Tracker */}
        <div className="md:col-span-5">
          <GeminiCard className="h-full flex flex-col justify-between p-5 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <GeminiIcon name="shield-check" size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Semester Milestones</h2>
                    <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">2-Way Verified with AI</p>
                  </div>
                </div>
                <Badge variant={completedCount === milestones.length ? 'emerald' : 'blue'} size="sm">
                  {completedCount} / {milestones.length} Verified
                </Badge>
              </div>

              {/* Verified Checklist Stream */}
              <div className="space-y-2">
                {milestones.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!item.done && item.action) {
                        item.action();
                      }
                    }}
                    className={`flex items-start gap-2.5 p-2.5 rounded-2xl border transition-all ${
                      item.done
                        ? 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] border-emerald-500/20 text-neutral-400 dark:text-neutral-500 pointer-events-none'
                        : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06] hover:border-[#0B57D0]/40 cursor-pointer'
                    }`}
                  >
                    <div
                      className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border mt-0.5 transition-colors ${
                        item.done
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-neutral-300 dark:border-neutral-600 bg-transparent'
                      }`}
                    >
                      {item.done && <GeminiIcon name="check" size={12} strokeWidth={2.5} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-sans leading-snug ${
                          item.done
                            ? 'line-through text-neutral-400 dark:text-neutral-500'
                            : 'text-neutral-800 dark:text-neutral-200 font-medium'
                        }`}
                      >
                        {item.label}
                      </p>
                      {!item.done && (
                        <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-0.5">
                          {item.instruction}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              <span>Automatic 2-Way AI Sync</span>
              <span className="text-[#0B57D0] dark:text-[#A8C7FA]">Permanent Strike-through</span>
            </div>
          </GeminiCard>
        </div>
      </div>

      {/* Quick AI Academic Prompt Launchers */}
      <div className="p-4 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <GeminiIcon name="sparkle" size={15} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider font-mono">
              Cohart AI Quick Actions
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">Tap to query</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => onOpenAi?.('Where is LLT1 from the PS Main Gate?', 'general')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-[#0B57D0]/10 hover:border-[#0B57D0]/30 text-neutral-700 dark:text-neutral-300 text-xs shrink-0 transition-all cursor-pointer"
          >
            <span>📍 Walking Route to LLT1</span>
          </button>
          <button
            onClick={() => onOpenAi?.('Explain the Cournot duopoly equilibrium with a Nigerian market analogy', 'general')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-[#0B57D0]/10 hover:border-[#0B57D0]/30 text-neutral-700 dark:text-neutral-300 text-xs shrink-0 transition-all cursor-pointer"
          >
            <span>💡 Cournot Duopoly Breakdown</span>
          </button>
          <button
            onClick={() => onOpenAi?.('I want to test my exam readiness. Ask me an exam curveball question on my department courses.', 'grill_mode')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs shrink-0 transition-all cursor-pointer font-medium"
          >
            <span>🔥 Socratic Exam Grill Mode</span>
          </button>
          <button
            onClick={() => onOpenAi?.('I have submitted and signed my course form with my faculty advisor.', 'general')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs shrink-0 transition-all cursor-pointer font-medium"
          >
            <span>✓ Sync Milestone with AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
