'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { LectureItem } from '@/lib/types';

interface ScheduleCardProps {
  onSelectVenue: (locationCode: string) => void;
}

const UPCOMING_LECTURES: LectureItem[] = [
  {
    id: 'lec-1',
    courseCode: 'ECO 201',
    courseTitle: 'Principles of Microeconomics II',
    lecturer: 'Dr. Adeyemi / Prof. Balogun',
    time: '09:00 AM - 11:00 AM',
    venueName: 'SMS Lecture Theatre (SLR 1)',
    locationId: 'loc-sms-lt1',
    department: 'Economics',
    level: '200L',
    isLiveNow: true,
  },
  {
    id: 'lec-2',
    courseCode: 'ECO 203',
    courseTitle: 'Mathematics for Economists',
    lecturer: 'Dr. Oladipo',
    time: '12:00 PM - 02:00 PM',
    venueName: 'Economics Hall (ECO-H1)',
    locationId: 'loc-eco-h1',
    department: 'Economics',
    level: '200L',
  },
  {
    id: 'lec-3',
    courseCode: 'GNS 201',
    courseTitle: 'Modern Agriculture & Rural Dev.',
    lecturer: 'Joint Faculty Board',
    time: '03:00 PM - 05:00 PM',
    venueName: 'OGD Lecture Theatre',
    locationId: 'loc-ogd-lt',
    department: 'General Studies',
    level: '200L',
  },
];

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ onSelectVenue }) => {
  return (
    <GlassCard className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/10 text-amber-500 dark:text-amber-400 border border-amber-400/20">
              <GeminiIcon name="clock" size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Lecture Timetable</h3>
              <p className="text-[11px] font-mono text-slate-400">OOU Economics • First Semester</p>
            </div>
          </div>
          <Badge variant="amber">3 Classes Today</Badge>
        </div>

        {/* List of Lectures */}
        <div className="space-y-2.5">
          {UPCOMING_LECTURES.map((lecture) => (
            <div
              key={lecture.id}
              onClick={() => onSelectVenue(lecture.locationId)}
              className={`group relative flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer ${
                lecture.isLiveNow
                  ? 'border-amber-400/40 bg-amber-400/[0.06] shadow-[0_0_15px_rgba(245,158,11,0.12)]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center pt-0.5">
                  <span className="font-mono text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    {lecture.courseCode}
                  </span>
                  {lecture.isLiveNow && (
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-medium text-slate-200 line-clamp-1">
                    {lecture.courseTitle}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-400">
                    <span className="text-slate-300">{lecture.time}</span>
                    <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                      <GeminiIcon name="pin" size={12} />
                      <span>{lecture.venueName}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pl-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400 group-hover:bg-amber-400/10 group-hover:text-amber-400 transition-colors">
                  <GeminiIcon name="chevron-right" size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Tap any class to pinpoint venue</span>
        <span className="text-amber-500 dark:text-amber-400 hover:underline cursor-pointer">Full Schedule &rarr;</span>
      </div>
    </GlassCard>
  );
};
