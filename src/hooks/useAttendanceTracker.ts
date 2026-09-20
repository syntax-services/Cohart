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
        attended_at: new Date().toISOString(),
      });
      setLogs((prev) => [newEntry, ...prev]);
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
  const getAttendanceAdvice = useCallback(() => {
    const totalCourses = 5;
    const attendedCount = logs.length;
    if (attendedCount === 0) {
      return {
        rate: 0,
        text: 'No attendance recorded yet for this semester. Marking your classes enables the AI to cross-verify your exam attendance eligibility.',
        status: 'urgent',
      };
    }
    const score = Math.min(100, Math.round((attendedCount / 6) * 100));
    if (score >= 75) {
      return {
        rate: score,
        text: `Strong attendance rate (${score}%). You meet the SMS faculty continuous assessment qualification criteria. Keep this rhythm.`,
        status: 'optimal',
      };
    }
    return {
      rate: score,
      text: `Your current attendance is ${score}%. OOU Economics exam board requires minimum 75% attendance for continuous assessment verification.`,
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
