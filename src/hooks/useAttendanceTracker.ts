'use client';

import { useState, useEffect, useCallback } from 'react';
import { AttendanceLog, TimetableItem } from '@/lib/types';
import { logAttendance, fetchAttendanceLogs } from '@/lib/supabase';

export const TIMETABLE_DATA: TimetableItem[] = [
  {
    id: 'tt_1',
    courseCode: 'ECO 201',
    courseTitle: 'Principles of Microeconomics II',
    lecturer: 'Dr. K. Balogun',
    day: 'Monday',
    time: '08:00 - 10:00',
    venueName: 'SMS Lecture Theatre (SLR 1)',
    locationId: 'loc-sms-lt1',
    department: 'Economics',
    level: '200L',
    isLiveNow: true,
  },
  {
    id: 'tt_2',
    courseCode: 'ECO 203',
    courseTitle: 'Applied Statistics for Economists',
    lecturer: 'Prof. A. Adeleke',
    day: 'Monday',
    time: '11:00 - 13:00',
    venueName: 'ETF Complex Hall A',
    locationId: 'loc-etf-hall',
    department: 'Economics',
    level: '200L',
  },
  {
    id: 'tt_3',
    courseCode: 'ACC 205',
    courseTitle: 'Management Accounting Principles',
    lecturer: 'Mrs. Olutayo',
    day: 'Tuesday',
    time: '09:00 - 11:00',
    venueName: 'Economics Departmental Hall (ECO-H1)',
    locationId: 'loc-eco-h1',
    department: 'Economics',
    level: '200L',
  },
  {
    id: 'tt_4',
    courseCode: 'GNS 201',
    courseTitle: 'General Studies: Nigerian Culture & Society',
    lecturer: 'Dr. Falana',
    day: 'Wednesday',
    time: '10:00 - 12:00',
    venueName: 'Otunba Gbenga Daniel (OGD) Hall',
    locationId: 'loc-ogd-lt',
    department: 'General Studies',
    level: '200L',
  },
  {
    id: 'tt_5',
    courseCode: 'ECO 207',
    courseTitle: 'Mathematics for Economists',
    lecturer: 'Dr. S. O. Ogundele',
    day: 'Thursday',
    time: '12:00 - 14:00',
    venueName: 'SMS Lecture Theatre (SLR 1)',
    locationId: 'loc-sms-lt1',
    department: 'Economics',
    level: '200L',
  },
  {
    id: 'tt_6',
    courseCode: 'ECO 209',
    courseTitle: 'Structure of the Nigerian Economy',
    lecturer: 'Dr. M. A. Adelekan',
    day: 'Friday',
    time: '09:00 - 11:00',
    venueName: 'Law Lecture Theatre 1 (LLT 1)',
    locationId: 'loc-llt-1',
    department: 'Economics',
    level: '200L',
  },
];

export function useAttendanceTracker(userId: string) {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchAttendanceLogs(userId);
      setLogs(data);
    }
    load();
  }, [userId]);

  const markAttendance = useCallback(async (courseCode: string, venue: string) => {
    setIsSubmitting(true);
    try {
      const newEntry = await logAttendance({
        user_id: userId,
        course_code: courseCode,
        venue,
        status: 'present',
      });
      if (newEntry) {
        setLogs((prev) => [newEntry, ...prev]);
      }
      return newEntry;
    } finally {
      setIsSubmitting(false);
    }
  }, [userId]);

  const hasMarkedToday = useCallback((courseCode: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return logs.some((l) => l.course_code === courseCode && l.attended_at.startsWith(todayStr));
  }, [logs]);

  // Attendance behavior advice generator
  // In a typical 12-week semester with 6 lectures per week, total expected lectures is ~72.
  // We calculate continuous assessment score relative to total expected lectures so far,
  // preventing artificial 100% scores in early semester weeks.
  const getAttendanceAdvice = useCallback(() => {
    const attendedCount = logs.length;
    if (attendedCount === 0) {
      return {
        rate: 0,
        text: 'No attendance recorded yet for this semester. Marking your classes enables the AI to cross-verify your exam attendance eligibility.',
        status: 'urgent',
      };
    }

    // Realistic semester progression benchmark: 50 target sessions across semester
    const targetSessions = 50;
    const rate = Math.min(100, Math.round((attendedCount / targetSessions) * 100));

    if (rate >= 75) {
      return {
        rate,
        text: `Strong attendance rate (${rate}%). You meet the Continuous Assessment threshold (minimum 75% standard). Keep this rhythm.`,
        status: 'optimal',
      };
    }
    if (rate >= 40) {
      return {
        rate,
        text: `Active semester progress (${rate}%). You have logged ${attendedCount} lectures so far. Maintain steady check-ins to reach the 75% exam board clearance.`,
        status: 'optimal',
      };
    }
    return {
      rate,
      text: `Early semester progress: ${attendedCount} lecture${attendedCount === 1 ? '' : 's'} logged (${rate}% of full semester target). Keep checking in every week.`,
      status: 'warning',
    };
  }, [logs]);

  return {
    timetable: TIMETABLE_DATA,
    logs,
    isSubmitting,
    markAttendance,
    hasMarkedToday,
    getAttendanceAdvice,
  };
}
