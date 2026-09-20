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
  // === SOCIAL & MANAGEMENT SCIENCES ===
  {
    id: 'loc-sms-lt1',
    name: 'SMS Lecture Theatre 1 (SLR 1)',
    code: 'SMS-LT1',
    category: 'lecture_hall',
    description: 'Primary lecture theatre for large undergraduate Economics, Accounting, and Business cohorts. Equipped with tiered seating.',
    faculty: 'Faculty of Social & Management Sciences',
    department: 'Economics',
    latitude: 6.92295,
    longitude: 3.87180,
    capacity: 550,
    orientation_tips: 'Eastern wing of SMS Complex ground floor. Main access via the central departmental quadrangle.',
    is_active: true
  },
  {
    id: 'loc-eco-h1',
    name: 'Economics Departmental Hall (ECO-H1)',
    code: 'ECO-H1',
    category: 'lecture_hall',
    description: 'Dedicated hall for Economics seminars, econometric labs, and departmental continuous assessments.',
    faculty: 'Faculty of Social & Management Sciences',
    department: 'Economics',
    latitude: 6.92320,
    longitude: 3.87155,
    capacity: 220,
    orientation_tips: '1st floor corridor directly adjacent to the Head of Department (HOD) office.',
    is_active: true
  },
  {
    id: 'loc-sms-sec',
    name: 'Faculty of Social Sciences Secretariat',
    code: 'SMS-SEC',
    category: 'faculty',
    description: 'Administrative offices for the Dean, Faculty Officer, and Sub-Dean. Central notice boards for timetables.',
    faculty: 'Faculty of Social & Management Sciences',
    department: 'Deanery',
    latitude: 6.92305,
    longitude: 3.87140,
    capacity: 150,
    orientation_tips: 'Ground floor administrative wing. Notice boards outside display official lecture timetables.',
    is_active: true
  },
  {
    id: 'loc-etf-hall',
    name: 'Education Trust Fund (ETF) Complex',
    code: 'ETF-HALL',
    category: 'lecture_hall',
    description: 'Lecture complex hosting multidisciplinary tutorials, statistics courses, and combined assessments.',
    faculty: 'Faculty of Social & Management Sciences',
    department: 'Economics / Management',
    latitude: 6.92380,
    longitude: 3.87110,
    capacity: 400,
    orientation_tips: 'Situated north of the SMS block. Shaded outdoor benches available for revision.',
    is_active: true
  },

  // === MULTIPURPOSE & AUDITORIUMS ===
  {
    id: 'loc-ogd-lt',
    name: 'Otunba Gbenga Daniel (OGD) Hall',
    code: 'OGD-LT',
    category: 'lecture_hall',
    description: 'Major multidisciplinary auditorium hosting university-wide General Studies (GNS) lectures and symposiums.',
    faculty: 'Central Campus',
    department: 'General Studies',
    latitude: 6.92180,
    longitude: 3.87250,
    capacity: 1200,
    orientation_tips: 'East of Senate roundabout. Arrive 15 minutes early for general courses.',
    is_active: true
  },
  {
    id: 'loc-sonuga-hall',
    name: 'Christopher Oludayo Sonuga Hall',
    code: 'SONUGA-HALL',
    category: 'lecture_hall',
    description: 'Modern conference and lecture auditorium hosting postgraduate seminars, defenses, and inaugural lectures.',
    faculty: 'Postgraduate School',
    department: 'Postgraduate Studies',
    latitude: 6.92150,
    longitude: 3.87110,
    capacity: 350,
    orientation_tips: 'Adjacent to Central Library. Landmark academic hall for public lectures.',
    is_active: true
  },

  // === FACULTY OF LAW ===
  {
    id: 'loc-law-lt',
    name: 'Faculty of Law Lecture Theatre',
    code: 'LAW-LT',
    category: 'lecture_hall',
    description: 'Premier lecture auditorium for jurisprudence, commercial law, and student bar symposiums.',
    faculty: 'Faculty of Law',
    department: 'Law',
    latitude: 6.92080,
    longitude: 3.87290,
    capacity: 450,
    orientation_tips: 'Law faculty avenue opposite the moot court pavilion.',
    is_active: true
  },
  {
    id: 'loc-law-lib',
    name: 'Faculty of Law Library & Moot Court',
    code: 'LAW-LIB',
    category: 'library',
    description: 'Specialized legal repository housing Nigerian statutes, law reports, and student practice courts.',
    faculty: 'Faculty of Law',
    department: 'Legal Studies',
    latitude: 6.92095,
    longitude: 3.87315,
    capacity: 250,
    orientation_tips: 'South wing of the Law Complex. Strict silence observed at all times.',
    is_active: true
  },

  // === FACULTY OF SCIENCE ===
  {
    id: 'loc-sci-lt1',
    name: 'Faculty of Science Lecture Theatre',
    code: 'SCI-LT1',
    category: 'lecture_hall',
    description: 'Central lecture theatre for combined science programs including Computer Science, Physics, and Chemistry.',
    faculty: 'Faculty of Science',
    department: 'Natural Sciences',
    latitude: 6.92420,
    longitude: 3.87050,
    capacity: 600,
    orientation_tips: 'Western campus academic wing, accessible past the central faculty walkway.',
    is_active: true
  },
  {
    id: 'loc-sci-lab',
    name: 'Science Research Laboratories',
    code: 'SCI-LAB',
    category: 'lab',
    description: 'Practical training laboratories for physics experiments, chemical synthesis, and biological assays.',
    faculty: 'Faculty of Science',
    department: 'Chemical & Physical Sciences',
    latitude: 6.92460,
    longitude: 3.87020,
    capacity: 300,
    orientation_tips: 'Safety lab coats and badges required for entry.',
    is_active: true
  },

  // === FACULTY OF ARTS & EDUCATION ===
  {
    id: 'loc-arts-comp',
    name: 'Faculty of Arts Complex',
    code: 'ARTS-COMP',
    category: 'faculty',
    description: 'Houses departments of English, Philosophy, History & Diplomatic Studies, and Religious Studies.',
    faculty: 'Faculty of Arts',
    department: 'Humanities',
    latitude: 6.92350,
    longitude: 3.87240,
    capacity: 350,
    orientation_tips: 'Northeast of Senate lawn, surrounded by landscaped shaded gardens.',
    is_active: true
  },
  {
    id: 'loc-edu-hall',
    name: 'Faculty of Education Lecture Hall',
    code: 'EDU-HALL',
    category: 'lecture_hall',
    description: 'Lecture venue for educational foundations, guidance counselling, and pedagogy coursework.',
    faculty: 'Faculty of Education',
    department: 'Education Foundations',
    latitude: 6.92410,
    longitude: 3.87190,
    capacity: 500,
    orientation_tips: 'Accessible via Road 4 from the main avenue. Adjacent to educational resource centre.',
    is_active: true
  },

  // === LIBRARIES & TECHNOLOGY ===
  {
    id: 'loc-oou-lib',
    name: 'OOU Main Campus Library',
    code: 'OOU-LIB',
    category: 'library',
    description: 'Central university repository featuring reference collections, academic journals, and quiet e-library cubicles.',
    faculty: 'University Academic Core',
    department: 'Library Services',
    latitude: 6.92120,
    longitude: 3.87080,
    capacity: 800,
    orientation_tips: 'Central campus hub. E-library section equipped with power backup on the upper level.',
    is_active: true
  },
  {
    id: 'loc-sopolu-lib',
    name: 'Sopolu Research Library & Archives',
    code: 'SOPOLU-LIB',
    category: 'library',
    description: 'Special collections wing housing historical manuscripts, government archives, and rare documents.',
    faculty: 'University Academic Core',
    department: 'Research & Archives',
    latitude: 6.92160,
    longitude: 3.87040,
    capacity: 200,
    orientation_tips: 'Special collections wing. Library registration card required at reception.',
    is_active: true
  },
  {
    id: 'loc-ict-cbt',
    name: 'OOU ICT & CBT Testing Centre',
    code: 'ICT-CBT',
    category: 'lab',
    description: 'Central facility for computer-based testing, portal registration, and digital coursework.',
    faculty: 'Information Technology Services',
    department: 'ICT Directorate',
    latitude: 6.92050,
    longitude: 3.87320,
    capacity: 600,
    orientation_tips: 'Ensure student matriculation slip and biometric verification are ready at entry.',
    is_active: true
  },

  // === ADMINISTRATION & STUDENT WELFARE ===
  {
    id: 'loc-senate-adm',
    name: 'Senate Building (Central Tower)',
    code: 'SENATE-ADM',
    category: 'admin',
    description: 'Landmark administrative tower housing the Vice Chancellor’s office, Registrar, and Student Affairs.',
    faculty: 'University Administration',
    department: 'Central Registry',
    latitude: 6.91980,
    longitude: 3.87190,
    capacity: 300,
    orientation_tips: 'Main roundabout hub. Primary campus transit and shuttle stop.',
    is_active: true
  },
  {
    id: 'loc-health-ctr',
    name: 'Directorate of Health Services (Health Centre)',
    code: 'HEALTH-CTR',
    category: 'amenity',
    description: 'Primary healthcare facility providing outpatient clinics, emergency medical care, and pharmacy services.',
    faculty: 'Student Welfare',
    department: 'Medical Services',
    latitude: 6.91920,
    longitude: 3.87280,
    capacity: 150,
    orientation_tips: 'South campus loop road. 24/7 emergency entrance accessible from main gate road.',
    is_active: true
  },
  {
    id: 'loc-sug-sec',
    name: 'Students’ Union Government (SUG) Secretariat',
    code: 'SUG-SEC',
    category: 'amenity',
    description: 'Offices for student union executives, student affairs advocacy, and student council chambers.',
    faculty: 'Student Affairs',
    department: 'Student Government',
    latitude: 6.92210,
    longitude: 3.87330,
    capacity: 250,
    orientation_tips: 'Central student walkway between SMS and Law faculties.',
    is_active: true
  },
  {
    id: 'loc-shuttle-hub',
    name: 'Main Campus Shuttle Hub & Commercial Quad',
    code: 'SHUTTLE-HUB',
    category: 'amenity',
    description: 'Central transit interchange with ATM galleries, student bookshops, copy centres, and cafeterias.',
    faculty: 'Campus Services',
    department: 'Transit & Services',
    latitude: 6.91950,
    longitude: 3.87220,
    capacity: 200,
    orientation_tips: 'Adjacent to Senate roundabout. Official point for town and mini-campus shuttles.',
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
