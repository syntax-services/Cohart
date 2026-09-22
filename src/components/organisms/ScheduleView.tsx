'use client';

import React, { useState } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';
import { useAttendanceTracker } from '@/hooks/useAttendanceTracker';

interface ScheduleViewProps {
  profile: StudentProfile;
  onLocateVenue: (code: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ profile, onLocateVenue }) => {
  // Days list Monday to Friday
  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Current real-world day name (e.g. 'Monday', or weekend)
  const todayDayName = React.useMemo(() => {
    const dayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const map = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return map[dayIndex];
  }, []);

  // Selected day for timetable filter (default to today if weekday, else Monday)
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    if (DAYS_OF_WEEK.includes(todayDayName)) {
      return todayDayName;
    }
    return 'Monday';
  });

  // Check if a class has ended today
  const isClassPast = (classTime: string) => {
    try {
      const parts = classTime.split('-');
      if (parts.length < 2) return false;
      const endTimeStr = parts[1].trim(); // e.g. "10:00"
      const [endH, endM] = endTimeStr.split(':').map(Number);
      const now = new Date();
      const end = new Date();
      end.setHours(endH, endM, 0, 0);
      return now > end;
    } catch {
      return false;
    }
  };

  // Find next class day from a given day
  const getNextClassDay = (fromDay: string) => {
    const fromIdx = DAYS_OF_WEEK.indexOf(fromDay);
    for (let i = 1; i <= 5; i++) {
      const nextIdx = (fromIdx + i) % DAYS_OF_WEEK.length;
      const candidateDay = DAYS_OF_WEEK[nextIdx];
      const hasClasses = timetable.some((c) => c.day === candidateDay);
      if (hasClasses) return candidateDay;
    }
    return 'Monday';
  };

  // Classes for the currently selected day
  const dayClasses = timetable.filter((item) => item.day === selectedDay);

  // Check if all classes for today are marked or past
  const isTodaySelected = selectedDay === todayDayName;
  const allTodayClassesDone =
    isTodaySelected &&
    dayClasses.length > 0 &&
    dayClasses.every((item) => hasMarkedToday(item.courseCode) || isClassPast(item.time));

  const {
    timetable,
    logs,
    markAttendance,
    hasMarkedToday,
    getAttendanceAdvice,
  } = useAttendanceTracker(profile.id);

  const advice = getAttendanceAdvice();

  const handleCheckIn = async (courseCode: string, venue: string) => {
    setMarkingCourse(courseCode);
    try {
      await markAttendance(courseCode, venue);
    } finally {
      setMarkingCourse(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] transition-colors">
        <div>
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            {profile.institution} • {profile.department} • {profile.level}
          </span>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900 dark:text-white font-sans mt-0.5">
            Academic Schedule & Attendance
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            First Semester 2024/2025 Session • Central Academic Registry
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'attendance'
                ? 'bg-white dark:bg-[#2A2B2E] text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <GeminiIcon name="check-circle" size={13} />
            <span>Attendance & Check-In</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-[#2A2B2E] text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <GeminiIcon name="calendar" size={13} />
            <span>Senate Calendar</span>
          </button>
        </div>
      </div>

      {activeTab === 'attendance' && (
        <>
          {/* Live Continuous Assessment Attendance Score Hero */}
          <GeminiCard className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={advice.status === 'optimal' ? 'blue' : advice.status === 'warning' ? 'slate' : 'slate'}
                    size="sm"
                  >
                    {advice.status === 'optimal'
                      ? 'CA Verified'
                      : advice.status === 'warning'
                      ? 'Attendance Warning'
                      : 'Not Started'}
                  </Badge>
                  <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                    OOU SMS Minimum 75% CA Standard
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
                  {advice.rate}% CA Lecture Attendance
                </h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 max-w-xl leading-relaxed">
                  {advice.text}
                </p>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="text-2xl font-mono font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
                  {logs.length}
                </div>
                <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  Lectures Logged
                </div>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
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
            </div>
          </GeminiCard>

          {/* Department Timetable & Active Check-In List */}
          <div className="space-y-3">
            {/* Header with Title & Day Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Department Courses & Check-In ({profile.department})
                </h3>
                <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  Today is {todayDayName}. Check-in is active only during your scheduled lecture window.
                </p>
              </div>

              {/* Day of Week Selector Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                {DAYS_OF_WEEK.map((d) => {
                  const isCurrentRealDay = d === todayDayName;
                  const isSelected = d === selectedDay;
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className={`relative px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-semibold shadow-xs'
                          : 'bg-black/[0.04] dark:bg-white/[0.05] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {d.slice(0, 3)}
                      {isCurrentRealDay && (
                        <span
                          className={`absolute -top-1 -right-1 h-2 w-2 rounded-full border border-white dark:border-neutral-950 ${
                            isSelected ? 'bg-emerald-400' : 'bg-emerald-500 animate-pulse'
                          }`}
                          title="Today"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Status Banners */}
            {allTodayClassesDone && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <GeminiIcon name="check" size={14} />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                      Done with today&apos;s classes!
                    </p>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-mono">
                      Getting prepared for tomorrow&apos;s lectures? Review chapter summaries in the Reader.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {dayClasses.length === 0 && (
              <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-neutral-500 dark:text-neutral-400">
                  <GeminiIcon name="calendar" size={18} />
                </div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  No classes scheduled for {selectedDay}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto font-mono">
                  {selectedDay === todayDayName
                    ? `No classes today until ${getNextClassDay(selectedDay)}. Use this free time to study or visit the campus library.`
                    : `No departmental courses on ${selectedDay}.`}
                </p>
              </div>
            )}

            {/* Courses Grid */}
            {dayClasses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {dayClasses.map((item) => {
                  const markedToday = hasMarkedToday(item.courseCode);
                  const isMarking = markingCourse === item.courseCode;
                  const isClassDay = item.day === todayDayName;
                  const isPast = isClassDay && isClassPast(item.time);
                  const isLocked = !isClassDay || isPast;

                  let lockReason = '';
                  if (!isClassDay) {
                    lockReason = `Only on ${item.day}s`;
                  } else if (isPast) {
                    lockReason = 'Class session ended';
                  }

                  return (
                    <GeminiCard key={item.id} className="p-4 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                              {item.courseCode}
                            </span>
                            {item.isLiveNow && isClassDay && !isPast && (
                              <span className="flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Scheduled Now
                              </span>
                            )}
                          </div>

                          {markedToday ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-300">
                              <GeminiIcon name="check" size={11} />
                              Checked In
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-neutral-400">
                              {item.day}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white leading-snug">
                          {item.courseTitle}
                        </h4>

                        <div className="mt-2 space-y-1 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                          <div className="flex items-center gap-1.5">
                            <GeminiIcon name="clock" size={12} className="shrink-0" />
                            <span>{item.day}, {item.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <GeminiIcon name="pin" size={12} className="shrink-0" />
                            <span className="truncate">{item.venueName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                            <GeminiIcon name="user" size={12} className="shrink-0" />
                            <span>Lecturer: {item.lecturer}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2">
                        <button
                          onClick={() => onLocateVenue(item.locationId)}
                          className="flex-1 py-1.5 px-3 rounded-lg border border-black/[0.08] dark:border-white/[0.08] text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <GeminiIcon name="compass" size={13} />
                          <span>Locate Hall</span>
                        </button>

                        <button
                          disabled={markedToday || isMarking || isLocked}
                          onClick={() => handleCheckIn(item.courseCode, item.venueName)}
                          title={isLocked && !markedToday ? lockReason : undefined}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            markedToday
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default'
                              : isLocked
                              ? 'bg-black/[0.04] dark:bg-white/[0.04] text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-black/[0.05] dark:border-white/[0.05]'
                              : 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 hover:opacity-90 active:scale-95'
                          }`}
                        >
                          {isMarking ? (
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          ) : markedToday ? (
                            <>
                              <GeminiIcon name="check" size={13} />
                              <span>Logged</span>
                            </>
                          ) : isLocked ? (
                            <>
                              <GeminiIcon name="clock" size={13} />
                              <span className="truncate">{lockReason}</span>
                            </>
                          ) : (
                            <>
                              <GeminiIcon name="check-circle" size={13} />
                              <span>Check In</span>
                            </>
                          )}
                        </button>
                      </div>
                    </GeminiCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Attendance Logs Stream */}
          {logs.length > 0 && (
            <GeminiCard>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                    <GeminiIcon name="clock" size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Recent Check-In History
                    </h3>
                    <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                      Verified Attendance Records ({logs.length} total)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {logs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                          {log.course_code}
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">
                          • {log.venue}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                        {new Date(log.attended_at).toLocaleDateString()} at{' '}
                        {new Date(log.attended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <Badge variant="blue" size="sm" className="capitalize">
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </GeminiCard>
          )}
        </>
      )}

      {activeTab === 'calendar' && (
        <>
          {/* Realistic Timetable Pending Status Hero Card */}
          <GeminiCard className="p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA] mb-4">
              <GeminiIcon name="calendar" size={24} />
            </div>

            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white font-sans mb-1.5">
              Central Senate Timetable Pending
            </h2>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed font-sans mb-5">
              The Central Academic Planning Committee and {profile.department} Department are currently scheduling lecture hall allocations and course cross-matches. Official lecture timetables will be published once departmental registration concludes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setNotifySubscribed(!notifySubscribed)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                  notifySubscribed
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 hover:opacity-90'
                }`}
              >
                <GeminiIcon name={notifySubscribed ? 'check' : 'bell'} size={14} />
                <span>{notifySubscribed ? 'Alert Set: Notifying when released' : 'Notify me when timetable drops'}</span>
              </button>

              <button
                onClick={() => onLocateVenue('LLT-1')}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-neutral-800 dark:text-neutral-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-xs font-medium transition-all active:scale-95 cursor-pointer"
              >
                <GeminiIcon name="pin" size={14} />
                <span>Explore Common Lecture Halls</span>
              </button>
            </div>
          </GeminiCard>

          {/* Academic Calendar Milestones & Venues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Academic Calendar Milestones */}
            <GeminiCard>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                  <GeminiIcon name="clock" size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Academic Calendar Guide</h3>
                  <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Senate Approved Schedule</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
                  <div className="flex justify-between font-mono text-[11px] mb-1">
                    <span className="text-neutral-900 dark:text-neutral-100 font-medium">Portal Re-opening & Fee Clearance</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Ongoing</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    School fees payment receipt generation and course registration on portal.oouagoiwoye.edu.ng
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
                  <div className="flex justify-between font-mono text-[11px] mb-1">
                    <span className="text-neutral-900 dark:text-neutral-100 font-medium">Departmental Verification & Signing</span>
                    <span className="text-[#0B57D0] dark:text-[#A8C7FA]">Starts Resumption Week</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Sign course forms at Departmental Office with Course Advisor and HOD.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
                  <div className="flex justify-between font-mono text-[11px] mb-1">
                    <span className="text-neutral-900 dark:text-neutral-100 font-medium">Lectures Commence Officially</span>
                    <span className="text-neutral-500">Upcoming</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Full lecture timetable to be enforced across LLT1, LLT2, SMS LT, and ECO Hall.
                  </p>
                </div>
              </div>
            </GeminiCard>

            {/* Expected Lecture Venues for Your Faculty */}
            <GeminiCard>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                  <GeminiIcon name="compass" size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Frequent Lecture Venues</h3>
                  <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Main Campus (PS)</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div
                  onClick={() => onLocateVenue('LLT-1')}
                  className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between hover:border-[#0B57D0]/30 transition-all cursor-pointer group"
                >
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors">
                      Law Lecture Theatre 1 (LLT 1)
                    </p>
                    <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                      Capacity: ~800 seats • Near Sam Ewang / Footbridge
                    </p>
                  </div>
                  <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div
                  onClick={() => onLocateVenue('LLT-2')}
                  className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between hover:border-[#0B57D0]/30 transition-all cursor-pointer group"
                >
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors">
                      Law Lecture Theatre 2 (LLT 2)
                    </p>
                    <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                      Capacity: ~750 seats • Beside LLT 1
                    </p>
                  </div>
                  <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div
                  onClick={() => onLocateVenue('LLT-3')}
                  className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between hover:border-[#0B57D0]/30 transition-all cursor-pointer group"
                >
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors">
                      Law Lecture Theatre 3 (LLT 3)
                    </p>
                    <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                      Motion Ground • Opposite Saburi Modern Market
                    </p>
                  </div>
                  <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div
                  onClick={() => onLocateVenue('SMS-LT1')}
                  className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between hover:border-[#0B57D0]/30 transition-all cursor-pointer group"
                >
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors">
                      SMS Lecture Theatre 1 (SMS LT)
                    </p>
                    <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                      Faculty of Administration & Management Sciences
                    </p>
                  </div>
                  <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </GeminiCard>
          </div>
        </>
      )}
    </div>
  );
};

