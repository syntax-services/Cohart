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
  // === LECTURE THEATRE COMPLEXES (LLT1, LLT2, LLT3, SLR1) ===
  {
    id: 'loc-llt1',
    name: 'Law Lecture Theatre 1 (LLT 1)',
    code: 'LLT-1',
    category: 'lecture_hall',
    description: 'Prominent tiered lecture auditorium situated behind SMS and beside Law Faculty. Known as one of the busiest multidisciplinary halls.',
    faculty: 'Faculty of Law / Inter-faculty',
    department: 'Law & Social Sciences',
    latitude: 6.92120,
    longitude: 3.87260,
    capacity: 750,
    orientation_tips: 'From PS Gate, take the paved walkway past the Access Bank ATM gallery, turn at the Sam Ewang building across the road, and walk straight across the small bridge. LLT1 is on your right after a few steps. Arrive 20 mins early to secure a seat!',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
        caption: 'LLT 1 Main Exterior Entrance & Tiered Steps',
        year: '2024'
      },
      {
        url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
        caption: 'Auditorium Hall Interior & Tiered Benches',
        year: '2022'
      },
      {
        url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80',
        caption: 'Connecting Footpath from Sam Ewang Footbridge',
        year: '2019'
      }
    ],
    is_active: true
  },
  {
    id: 'loc-llt2',
    name: 'Law Lecture Theatre 2 (LLT 2)',
    code: 'LLT-2',
    category: 'lecture_hall',
    description: 'Sister auditorium to LLT1, heavily utilized for large joint lectures across Law, Economics, and Management sciences.',
    faculty: 'Faculty of Law / Inter-faculty',
    department: 'Law & Social Sciences',
    latitude: 6.92140,
    longitude: 3.87275,
    capacity: 650,
    orientation_tips: 'Directly adjacent to LLT1 across the connecting courtyard. Follow the same path across the small bridge from Access Bank.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
        caption: 'LLT 2 East Facade & Quadrangle Walkway',
        year: '2024'
      },
      {
        url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
        caption: 'Lecturer Podium & Dual Projector Setup',
        year: '2023'
      }
    ],
    is_active: true
  },
  {
    id: 'loc-llt3',
    name: 'Lecture Theatre 3 (LLT 3 / Motion Ground)',
    code: 'LLT-3',
    category: 'lecture_hall',
    description: 'Major student lecture auditorium located opposite Professor Saburi Modern Market in the area widely known to students as Motion Ground.',
    faculty: 'Central Campus',
    department: 'General Studies & Combined Arts',
    latitude: 6.92510,
    longitude: 3.87350,
    capacity: 900,
    orientation_tips: 'Head towards Motion Ground in front of Professor Saburi Modern Market. Landmark: commercial shops and student food pavilions nearby.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
        caption: 'LLT 3 Motion Ground Exterior Entrance',
        year: '2024'
      },
      {
        url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
        caption: 'Motion Ground Courtyard & Gathering Plaza',
        year: '2021'
      }
    ],
    is_active: true
  },
  {
    id: 'loc-sms-lt1',
    name: 'SMS Lecture Theatre 1 (SLR 1)',
    code: 'SMS-LT1',
    category: 'lecture_hall',
    description: 'Primary lecture theatre for undergraduate Economics, Accounting, and Business cohorts. Equipped with tiered seating.',
    faculty: 'Faculty of Social & Management Sciences',
    department: 'Economics',
    latitude: 6.92295,
    longitude: 3.87180,
    capacity: 550,
    orientation_tips: 'Eastern wing of SMS Complex ground floor. Main access via the central departmental quadrangle.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80',
        caption: 'SMS SLR 1 Lecture Wing Front View',
        year: '2024'
      },
      {
        url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80',
        caption: 'Tiered Seating Section B Interior',
        year: '2020'
      }
    ],
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
        caption: 'Economics Department Seminar Hall',
        year: '2023'
      }
    ],
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
        caption: 'ETF Lecture Hall Complex & Shaded Corridor',
        year: '2024'
      }
    ],
    is_active: true
  },
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        caption: 'OGD Multipurpose Auditorium Main Hall',
        year: '2024'
      }
    ],
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        caption: 'Sonuga Conference Hall Facade',
        year: '2023'
      }
    ],
    is_active: true
  },

  // === FACULTIES & SECRETARIATS ===
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        caption: 'SMS Deanery Administrative Wing',
        year: '2024'
      }
    ],
    is_active: true
  },
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
        caption: 'Faculty of Arts Shaded Lawn Walkway',
        year: '2023'
      }
    ],
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
        caption: 'Faculty of Education Building Entrance',
        year: '2023'
      }
    ],
    is_active: true
  },
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
        caption: 'Faculty of Law Pillar Entrance',
        year: '2024'
      }
    ],
    is_active: true
  },
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        caption: 'Faculty of Science Main Lecture Block',
        year: '2023'
      }
    ],
    is_active: true
  },

  // === LIBRARIES & LABS ===
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
        caption: 'Main Library Building Front Facade',
        year: '2024'
      },
      {
        url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
        caption: 'Central Reference Room & Reading Desks',
        year: '2022'
      }
    ],
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
        caption: 'Sopolu Archives Historical Collections Room',
        year: '2023'
      }
    ],
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
        caption: 'Law Library Reading Hall & Statutory Stacks',
        year: '2024'
      }
    ],
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
        caption: 'Central Laboratory Benches & Instrumentation',
        year: '2024'
      }
    ],
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
        caption: 'CBT Centre Computer Testing Rows',
        year: '2024'
      }
    ],
    is_active: true
  },

  // === ADMINISTRATION & LANDMARKS ===
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
        caption: 'Senate Building Tower & Main Roundabout',
        year: '2024'
      },
      {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        caption: 'Senate Administrative Plaza & Car Park',
        year: '2021'
      }
    ],
    is_active: true
  },
  {
    id: 'loc-access-bank',
    name: 'Commercial Banking Quad & Access Bank',
    code: 'BANK-QUAD',
    category: 'amenity',
    description: 'Key university navigation landmark housing Access Bank (OOU Branch), automated teller machines, student shops, and business kiosks.',
    faculty: 'Campus Services',
    department: 'Commercial & Financial Hub',
    latitude: 6.92010,
    longitude: 3.87220,
    capacity: 200,
    orientation_tips: 'Key navigational pivot: walkway from PS gate leads directly to Access Bank. Opposite Sam Ewang building. Starting point for the footbridge path to LLT1 and LLT2.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&w=1200&q=80',
        caption: 'Access Bank Branch & Commercial Footpath',
        year: '2024'
      },
      {
        url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
        caption: 'ATM Gallery & Student Services Area',
        year: '2022'
      }
    ],
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
        caption: 'University Health Centre Clinic Entrance',
        year: '2024'
      }
    ],
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
        caption: 'SUG Secretariat & Union Meeting Lawn',
        year: '2023'
      }
    ],
    is_active: true
  },
  {
    id: 'loc-shuttle-hub',
    name: 'Main Campus Shuttle Hub & Commercial Quad',
    code: 'SHUTTLE-HUB',
    category: 'amenity',
    description: 'Central transit interchange with town shuttles to Ago-Iwoye market, mini campus, and student residences.',
    faculty: 'Campus Services',
    department: 'Transit & Services',
    latitude: 6.91950,
    longitude: 3.87220,
    capacity: 200,
    orientation_tips: 'Adjacent to Senate roundabout. Official point for town and mini-campus shuttles.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Campus Bus Stop & Shuttle Loading Bay',
        year: '2024'
      }
    ],
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
      .upsert(profile)
      .select()
      .single();

    if (error || !data) {
      return profile as StudentProfile;
    }

    return data as StudentProfile;
  } catch {
    return profile as StudentProfile;
  }
}

export async function logAttendance(log: Omit<AttendanceLog, 'id' | 'attended_at'>): Promise<AttendanceLog | null> {
  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .insert([log])
      .select()
      .single();

    if (error) {
      const fallbackLog: AttendanceLog = {
        ...log,
        id: `att_${Date.now()}`,
        attended_at: new Date().toISOString(),
      };
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('cohart_attendance_fallback') || '[]');
        stored.unshift(fallbackLog);
        localStorage.setItem('cohart_attendance_fallback', JSON.stringify(stored));
      }
      return fallbackLog;
    }

    return data as AttendanceLog;
  } catch {
    return null;
  }
}

export async function fetchAttendanceLogs(userId: string): Promise<AttendanceLog[]> {
  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('user_id', userId)
      .order('attended_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem('cohart_attendance_fallback') || '[]');
      }
      return [];
    }

    return data as AttendanceLog[];
  } catch {
    return [];
  }
}

export async function saveExplanation(explanation: Omit<SavedExplanation, 'id' | 'created_at'>): Promise<SavedExplanation | null> {
  try {
    const { data, error } = await supabase
      .from('saved_explanations')
      .insert([explanation])
      .select()
      .single();

    if (error) {
      const fallback: SavedExplanation = {
        ...explanation,
        id: `exp_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('cohart_saved_explanations') || '[]');
        stored.unshift(fallback);
        localStorage.setItem('cohart_saved_explanations', JSON.stringify(stored));
      }
      return fallback;
    }

    return data as SavedExplanation;
  } catch {
    return null;
  }
}
