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
    courseTitle: 'Principles of Microeconomics I',
    lecturer: 'Dr. Adeyemi / Prof. Balogun',
    time: '09:00 AM - 11:00 AM',
    venueName: 'SMS Lecture Theatre (SLR 1)',
    locationId: 'SMS-LT1',
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
    locationId: 'ECO-H1',
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
    locationId: 'OGD-LT',
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
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#387BFF]/15 text-[#387BFF]">
              <GeminiIcon name="clock" size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Lecture Timetable</h3>
              <p className="text-[11px] font-mono text-slate-400">OOU Economics • First Semester</p>
            </div>
          </div>
          <Badge variant="blue">3 Classes Today</Badge>
        </div>

        {/* List of Lectures */}
        <div className="space-y-2.5">
          {UPCOMING_LECTURES.map((lecture) => (
            <div
              key={lecture.id}
              onClick={() => onSelectVenue(lecture.locationId)}
              className={`group relative flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer ${
                lecture.isLiveNow
                  ? 'border-[#387BFF]/40 bg-[#387BFF]/[0.06] shadow-[0_0_15px_rgba(56,123,255,0.12)]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center pt-0.5">
                  <span className="font-mono text-xs font-bold text-white group-hover:text-[#60A5FA] transition-colors">
                    {lecture.courseCode}
                  </span>
                  {lecture.isLiveNow && (
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#387BFF] animate-pulse" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-medium text-slate-200 line-clamp-1">
                    {lecture.courseTitle}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-400">
                    <span className="text-slate-300">{lecture.time}</span>
                    <span className="flex items-center gap-1 text-[#60A5FA]">
                      <GeminiIcon name="pin" size={12} />
                      <span>{lecture.venueName}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pl-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400 group-hover:bg-[#387BFF]/15 group-hover:text-[#387BFF] transition-colors">
                  <GeminiIcon name="chevron-right" size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Tap any class to pinpoint venue</span>
        <span className="text-[#60A5FA] hover:underline cursor-pointer">Full Schedule &rarr;</span>
      </div>
    </GlassCard>
  );
};
