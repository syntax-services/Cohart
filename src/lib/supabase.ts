import { createClient } from '@supabase/supabase-js';
import { Location } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Default verified fallback locations for OOU Ago-Iwoye Main Campus (SMS & Economics)
 * Used immediately if Supabase credentials are not yet set or during offline states.
 */
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

export async function fetchLocations(): Promise<Location[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      return DEFAULT_OOU_LOCATIONS;
    }

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error || !data || data.length === 0) {
      console.warn('Falling back to local OOU locations cache:', error?.message);
      return DEFAULT_OOU_LOCATIONS;
    }

    return data as Location[];
  } catch (err) {
    console.error('Supabase fetch failed, utilizing resilient offline cache', err);
    return DEFAULT_OOU_LOCATIONS;
  }
}
