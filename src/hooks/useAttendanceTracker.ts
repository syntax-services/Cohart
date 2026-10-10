'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AttendanceLog, TimetableItem, StudentProfile } from '@/lib/types';
import { logAttendance, fetchAttendanceLogs } from '@/lib/supabase';
import {
  generateAssumedTimetable,
  computeStudentAttendanceBrief,
  StudentAttendanceBrief,
} from '@/lib/curriculumTimetable';

export { TIMETABLE_DATA } from '@/lib/curriculumTimetable';

export function useAttendanceTracker(userId: string, profile?: StudentProfile) {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchAttendanceLogs(userId);
      setLogs(data);
    }
    load();
  }, [userId]);

  // Dynamically resolve timetable based on student's institution, department, and level
  const timetable = useMemo(() => {
    return generateAssumedTimetable(
      profile?.institution || 'OOU',
      profile?.department || 'Economics',
      profile?.level || '200L'
    );
  }, [profile?.institution, profile?.department, profile?.level]);

  // Dynamically calculate comprehensive attendance brief & projected scores
  const attendanceBrief: StudentAttendanceBrief = useMemo(() => {
    return computeStudentAttendanceBrief(logs, timetable);
  }, [logs, timetable]);

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
  const getAttendanceAdvice = useCallback(() => {
    const attendedCount = logs.length;
    if (attendedCount === 0) {
      return {
        rate: 0,
        text: 'No attendance recorded yet for this semester. Marking your classes enables the AI to track your exam clearance and project your CA score.',
        status: 'urgent',
      };
    }

    const rate = attendanceBrief.overallAttendanceRate;

    if (rate >= 75) {
      return {
        rate,
        text: `Strong attendance rate (${rate}%). You meet the statutory NUC 75% exam board clearance threshold. Projected CA: ${attendanceBrief.projectedCaScore}/30.`,
        status: 'optimal',
      };
    }
    if (rate >= 40) {
      return {
        rate,
        text: `Active semester progress (${rate}%). You have logged ${attendedCount} lectures so far. Projected CA: ${attendanceBrief.projectedCaScore}/30. Maintain steady check-ins to reach 75% exam clearance.`,
        status: 'optimal',
      };
    }
    return {
      rate,
      text: `Early semester progress: ${attendedCount} lecture${attendedCount === 1 ? '' : 's'} logged (${rate}% of semester benchmark). Keep checking in every week to avoid exam board restrictions.`,
      status: 'warning',
    };
  }, [logs, attendanceBrief]);

  return {
    timetable,
    logs,
    attendanceBrief,
    isSubmitting,
    markAttendance,
    hasMarkedToday,
    getAttendanceAdvice,
  };
}
