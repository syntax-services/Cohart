import { createClient } from '@supabase/supabase-js';
import { Location, StudentProfile, AttendanceLog, SavedExplanation } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fnqnxdmdyevzavsbfelv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucW54ZG1keWV2emF2c2JmZWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MTI3NDUsImV4cCI6MjEwNTQ4ODc0NX0.BdJAhqwdSiPbGHCb5d3KbwNHalTlbO1jaqWTgXvVz6A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: 'usr_demo_student_01',
  email: 'student@oouagoiwoye.edu.ng',
  full_name: 'Adewale Johnson',
  matric_number: 'SMS/2023/18402',
  institution: 'Olabisi Onabanjo University (OOU)',
  faculty: 'Faculty of Social & Management Sciences',
  department: 'Economics',
  level: '200L',
  cognitive_traits: [
    'ADHD / Context Switcher',
    'Analogies & Real-World Models',
    'Night Owl Deep Focus',
  ],
  learning_style: 'visual_analogies',
  reading_speed_wpm: 240,
  referral_code: 'OOU-ADEWALE',
  wallet_balance: 14500, // in NGN
  is_verified_coordinator: true,
};

export const DEFAULT_OOU_LOCATIONS: Location[] = [
  {
    id: 'loc-sms-lt1',
    name: 'SMS Lecture Theatre (SLR 1)',
    code: 'SMS-LT1',
    category: 'lecture_hall',
    description: 'Primary lecture theatre for large undergraduate Economics and Accounting cohorts. Equipped with dual projection and tiered seating.',
    faculty: 'Faculty of Social and Management Sciences',
    department: 'Economics',
    latitude: 6.92295,
    longitude: 3.87180,
    capacity: 550,
    orientation_tips: 'Located on the eastern wing of the SMS Complex ground floor. Use the central walkway facing the departmental quad.',
    is_active: true
  },
  {
    id: 'loc-eco-h1',
    name: 'Economics Departmental Hall (ECO-H1)',
    code: 'ECO-H1',
    category: 'lecture_hall',
    description: 'Dedicated lecture and seminar hall for Economics 200L to 400L core courses (Macroeconomics, Econometrics, Quantitative Analysis).',
    faculty: 'Faculty of Social and Management Sciences',
    department: 'Economics',
    latitude: 6.92320,
    longitude: 3.87155,
    capacity: 220,
    orientation_tips: 'Directly adjacent to the Head of Department (HOD) office corridor on the 1st floor.',
    is_active: true
  },
  {
    id: 'loc-ogd-lt',
    name: 'Otunba Gbenga Daniel (OGD) Hall',
    code: 'OGD-LT',
    category: 'lecture_hall',
    description: 'Major multidisciplinary lecture theatre hosting university-wide general studies (GNS), joint faculty electives, and symposiums.',
    faculty: 'Central Campus',
    department: 'General Studies',
    latitude: 6.92180,
    longitude: 3.87250,
    capacity: 1200,
    orientation_tips: 'South of the Senate roundabout. Arrive 15 minutes early for general courses to secure front-tier audio clarity.',
    is_active: true
  },
  {
    id: 'loc-etf-hall',
    name: 'Education Trust Fund (ETF) Complex',
    code: 'ETF-HALL',
    category: 'lecture_hall',
    description: 'Spacious lecture complex used for inter-departmental tutorials, economics statistics courses, and continuous assessments.',
    faculty: 'Faculty of Social and Management Sciences',
    department: 'Economics / Management',
    latitude: 6.92380,
    longitude: 3.87110,
    capacity: 400,
    orientation_tips: 'Situated north of the SMS block. Shaded outdoor benches available nearby for pre-class revision.',
    is_active: true
  },
  {
    id: 'loc-oou-lib',
    name: 'OOU Main Campus Library',
    code: 'OOU-LIB',
    category: 'library',
    description: 'Central university repository featuring the Social Sciences reference section, Economics academic journals, and quiet e-library cubicles.',
    faculty: 'University Academic Core',
    department: 'Library Services',
    latitude: 6.92120,
    longitude: 3.87080,
    capacity: 800,
    orientation_tips: 'Library card registration is required at the front desk. E-learning hub is on the upper level with power backup.',
    is_active: true
  },
  {
    id: 'loc-sms-sec',
    name: 'Faculty of Social Sciences Secretariat',
    code: 'SMS-SEC',
    category: 'faculty',
    description: 'Administrative Dean’s office, Faculty Officer, Sub-Dean, and student affairs desk for course registration sign-offs and inquiries.',
    faculty: 'Faculty of Social and Management Sciences',
    department: 'Administration',
    latitude: 6.92305,
    longitude: 3.87140,
    capacity: 150,
    orientation_tips: 'Ground floor administrative wing. Notice boards outside display official lecture timetables and exam allocations.',
    is_active: true
  }
];

// Fetch locations with resilient local fallback
export async function fetchLocations(): Promise<Location[]> {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error || !data || data.length === 0) {
      return DEFAULT_OOU_LOCATIONS;
    }

    return data as Location[];
  } catch {
    return DEFAULT_OOU_LOCATIONS;
  }
}

// Student profile operations
export async function fetchProfile(userId: string): Promise<StudentProfile> {
  try {
    const cached = typeof window !== 'undefined' ? localStorage.getItem(`cohart_profile_${userId}`) : null;
    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_STUDENT_PROFILE;
    }

    return data as StudentProfile;
  } catch {
    return DEFAULT_STUDENT_PROFILE;
  }
}

export async function updateProfile(profile: Partial<StudentProfile> & { id: string }): Promise<StudentProfile> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cohart_profile_${profile.id}`, JSON.stringify(profile));
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error || !data) {
      return { ...DEFAULT_STUDENT_PROFILE, ...profile };
    }

    return data as StudentProfile;
  } catch {
    return { ...DEFAULT_STUDENT_PROFILE, ...profile };
  }
}

// Attendance operations
export async function logAttendance(entry: Omit<AttendanceLog, 'id'>): Promise<AttendanceLog> {
  const localId = `att_${Date.now()}`;
  const record: AttendanceLog = {
    ...entry,
    id: localId,
  };

  try {
    // Save to Supabase
    const { data, error } = await supabase
      .from('attendance_logs')
      .insert([entry])
      .select('*')
      .single();

    if (!error && data) {
      return data as AttendanceLog;
    }
  } catch {
    // Offline resilience
  }

  // Local storage backup
  if (typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('cohart_attendance') || '[]');
    existing.unshift(record);
    localStorage.setItem('cohart_attendance', JSON.stringify(existing));
  }

  return record;
}

export async function fetchAttendanceLogs(userId: string): Promise<AttendanceLog[]> {
  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('user_id', userId)
      .order('attended_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as AttendanceLog[];
    }
  } catch {
    // Offline fallback
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('cohart_attendance');
    if (local) return JSON.parse(local);
  }

  return [];
}

// Saved explanations from Interactive Reader
export async function saveExplanation(explanation: Omit<SavedExplanation, 'id'>): Promise<SavedExplanation> {
  const item: SavedExplanation = {
    ...explanation,
    id: `exp_${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('saved_explanations')
      .insert([explanation])
      .select('*')
      .single();

    if (!error && data) return data as SavedExplanation;
  } catch {}

  if (typeof window !== 'undefined') {
    const list = JSON.parse(localStorage.getItem('cohart_explanations') || '[]');
    list.unshift(item);
    localStorage.setItem('cohart_explanations', JSON.stringify(list));
  }

  return item;
}
