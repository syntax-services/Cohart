import { TimetableItem } from './types';
import { supabase } from './supabase';

export interface SharedDepartmentTimetable {
  id: string;
  institution: string;
  department: string;
  level: string;
  semester: 1 | 2;
  academicSession: string; // e.g. '2024/2025'
  schedule: TimetableItem[];
  contributorCount: number;
  lastUpdated: string;
  verifiedByRep?: boolean;
}

const STORAGE_PREFIX = 'cohart_shared_tt_';

export function getSharedTimetableKey(institution: string, department: string, level: string): string {
  return `${STORAGE_PREFIX}${institution.toUpperCase()}_${department.toLowerCase().replace(/\s+/g, '_')}_${level.toLowerCase()}`;
}

export function getLocalSharedDepartmentTimetable(
  institution: string,
  department: string,
  level: string
): SharedDepartmentTimetable | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = getSharedTimetableKey(institution, department, level);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveSharedDepartmentTimetable(
  institution: string,
  department: string,
  level: string,
  schedule: TimetableItem[]
): SharedDepartmentTimetable {
  const existing = getLocalSharedDepartmentTimetable(institution, department, level);
  const now = new Date().toISOString();

  const timetable: SharedDepartmentTimetable = {
    id: existing?.id || `tt_shared_${Date.now()}`,
    institution: institution.toUpperCase(),
    department,
    level,
    semester: 1,
    academicSession: '2024/2025',
    schedule,
    contributorCount: (existing?.contributorCount || 0) + 1,
    lastUpdated: now,
    verifiedByRep: true,
  };

  if (typeof window !== 'undefined') {
    try {
      const key = getSharedTimetableKey(institution, department, level);
      localStorage.setItem(key, JSON.stringify(timetable));
    } catch (e) {
      console.warn('Could not cache shared timetable locally:', e);
    }
  }

  // Cloud sync to Supabase (asynchronous, non-blocking)
  try {
    supabase.from('department_timetables').upsert({
      id: timetable.id,
      institution: timetable.institution,
      department: timetable.department,
      level: timetable.level,
      academic_session: timetable.academicSession,
      schedule: timetable.schedule,
      contributor_count: timetable.contributorCount,
      last_updated: timetable.lastUpdated,
    }).then(() => {}, () => {});
  } catch {}

  return timetable;
}
