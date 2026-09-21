import { createClient } from '@supabase/supabase-js';
import { Location, StudentProfile, AttendanceLog, SavedExplanation } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fnqnxdmdyevzavsbfelv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucW54ZG1keWV2emF2c2JmZWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MTI3NDUsImV4cCI6MjEwNTQ4ODc0NX0.BdJAhqwdSiPbGHCb5d3KbwNHalTlbO1jaqWTgXvVz6A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: 'usr_guest_scholar',
  email: '',
  full_name: '',
  matric_number: '',
  institution: 'Olabisi Onabanjo University (OOU)',
  faculty: '',
  department: '',
  level: '',
  cognitive_traits: [
    'Analogies & Real-World Models',
  ],
  learning_style: 'visual_analogies',
  reading_speed_wpm: 220,
  referral_code: '',
  wallet_balance: 0,
  is_verified_coordinator: false,
};

export const DEFAULT_OOU_LOCATIONS: Location[] = [
  {
    "id": "loc-llt1",
    "name": "Faculty of Art (LLT-I)",
    "code": "LLT-1",
    "category": "lecture_hall",
    "description": "Major tiered lecture auditorium at Faculty of Arts / Humanities, heavily utilized for large joint lectures and General Studies (GNS).",
    "faculty": "Faculty of Arts",
    "department": "Humanities & General Studies",
    "latitude": 6.918412,
    "longitude": 3.870547,
    "capacity": 750,
    "orientation_tips": "Located at the Arts Quad near the central covered walkway. Landmark: Faculty of Arts main wing.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        "caption": "LLT 1 Main Exterior Entrance & Tiered Steps",
        "year": "2024"
      },
      {
        "url": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
        "caption": "Auditorium Hall Interior & Tiered Benches",
        "year": "2022"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-llt2",
    "name": "LLT 2 OOU",
    "code": "LLT-2",
    "category": "lecture_hall",
    "description": "Law Lecture Theatre 2, sister auditorium along the Law and Education axis.",
    "faculty": "Faculty of Law / Education",
    "department": "Law & Social Sciences",
    "latitude": 6.918387,
    "longitude": 3.869578,
    "capacity": 650,
    "orientation_tips": "Situated directly adjacent to LLT 1 and Faculty of Education blocks.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
        "caption": "LLT 2 Quadrangle Walkway",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-llt3",
    "name": "LLT 3 OOU",
    "code": "LLT-3",
    "category": "lecture_hall",
    "description": "Major tiered lecture auditorium located right beside New Motion (Motion Ground) and the ICAN building.",
    "faculty": "Central Campus",
    "department": "General Studies & Administration",
    "latitude": 6.915263,
    "longitude": 3.873516,
    "capacity": 900,
    "orientation_tips": "Directly opposite New Motion commercial hub and ICAN building on the southern campus belt.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
        "caption": "LLT 3 Motion Ground Exterior Entrance",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-new-motion",
    "name": "New Motion (Motion Ground)",
    "code": "NEW-MOTION",
    "category": "amenity",
    "description": "Vibrant student commercial hub featuring food stalls, printing kiosks, stationery vendors, and shuttle stops.",
    "faculty": "Commercial Core",
    "department": "Student Commerce",
    "latitude": 6.915488,
    "longitude": 3.874547,
    "capacity": 500,
    "orientation_tips": "Located at the Motion Ground junction opposite LLT3 and the Health Centre.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
        "caption": "New Motion Student Hub & Commercial Kiosks",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-ican",
    "name": "ICAN Building",
    "code": "ICAN-BLDG",
    "category": "lecture_hall",
    "description": "Modern professional learning centre and lecture complex sponsored by ICAN.",
    "faculty": "Faculty of Administration and Management",
    "department": "Accounting & Finance",
    "latitude": 6.915287,
    "longitude": 3.872797,
    "capacity": 450,
    "orientation_tips": "Next to Faculty of Administration and Management, directly west of LLT3.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
        "caption": "ICAN Building Front Entrance",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-admin-mgmt",
    "name": "Faculty of Administration and Management",
    "code": "ADMIN-MGMT",
    "category": "faculty",
    "description": "Faculty deanery and departmental offices for Business Admin, Accounting, and Public Administration.",
    "faculty": "Faculty of Administration and Management",
    "department": "Management Studies",
    "latitude": 6.915713,
    "longitude": 3.872578,
    "capacity": 400,
    "orientation_tips": "Along the southern faculty row, adjacent to the ICAN building.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
        "caption": "Faculty of Administration Complex",
        "year": "2023"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-old-moot",
    "name": "Old University Moot Court",
    "code": "OLD-MOOT",
    "category": "lecture_hall",
    "description": "Historical moot court and tiered law hall used for student legal trials and lectures.",
    "faculty": "Faculty of Law",
    "department": "Law",
    "latitude": 6.916438,
    "longitude": 3.872703,
    "capacity": 300,
    "orientation_tips": "North of ICAN building along the southern legal pathway.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
        "caption": "Old Moot Court Bench",
        "year": "2023"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-law-main",
    "name": "Faculty of Law (Main Complex)",
    "code": "LAW-MAIN",
    "category": "faculty",
    "description": "Main administrative deanery and faculty complex for Nigerian Jurisprudence and Commercial Law.",
    "faculty": "Faculty of Law",
    "department": "Law",
    "latitude": 6.916663,
    "longitude": 3.870297,
    "capacity": 500,
    "orientation_tips": "Western law avenue, adjacent to the New Moot Court Building.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
        "caption": "Faculty of Law Main Entrance",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-new-moot",
    "name": "New Moot Court Building (Faculty of Law)",
    "code": "NEW-MOOT",
    "category": "faculty",
    "description": "State-of-the-art modern judicial mock courtroom and law auditorium.",
    "faculty": "Faculty of Law",
    "department": "Law",
    "latitude": 6.916813,
    "longitude": 3.870234,
    "capacity": 350,
    "orientation_tips": "Right next to the Faculty of Law main entrance.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
        "caption": "New Moot Court Exterior",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-health-ctr",
    "name": "OOU Health Centre",
    "code": "HEALTH-CTR",
    "category": "amenity",
    "description": "Primary 24/7 university medical clinic, pharmacy, and emergency treatment ward.",
    "faculty": "Student Welfare",
    "department": "Medical Services",
    "latitude": 6.917363,
    "longitude": 3.874109,
    "capacity": 150,
    "orientation_tips": "Accessible along the road leading from New Motion towards the central campus.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        "caption": "Health Centre Clinic Entrance",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-edu-comp",
    "name": "Faculty of Education",
    "code": "EDU-COMP",
    "category": "faculty",
    "description": "Educational foundations, science education, and pedagogical lecture halls.",
    "faculty": "Faculty of Education",
    "department": "Education Foundations",
    "latitude": 6.918113,
    "longitude": 3.868453,
    "capacity": 600,
    "orientation_tips": "Western loop road next to LLT 2.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
        "caption": "Faculty of Education Complex",
        "year": "2023"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-ict-ctr",
    "name": "ICT Centre (CBT Testing)",
    "code": "ICT-CTR",
    "category": "lab",
    "description": "Central facility for computer-based testing, student portal registrations, and exams.",
    "faculty": "Information Technology",
    "department": "ICT Directorate",
    "latitude": 6.923187,
    "longitude": 3.869453,
    "capacity": 700,
    "orientation_tips": "Central campus near Admin Block I and Senate axis.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
        "caption": "ICT Testing Hall",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-sport-ctr",
    "name": "OOU Sport Centre & Pavilion",
    "code": "SPORT-CTR",
    "category": "amenity",
    "description": "Northern campus sports complex featuring football stadium, running track, volleyball, and basketball courts.",
    "faculty": "Sports Directorate",
    "department": "Sports & Recreation",
    "latitude": 6.927763,
    "longitude": 3.871328,
    "capacity": 2500,
    "orientation_tips": "Northern campus edge. Landmark for university games and athletics.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
        "caption": "Sports Complex Field & Pavilion",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-basketball",
    "name": "Basketball Court",
    "code": "B-BALL",
    "category": "amenity",
    "description": "Standard outdoor basketball court at the OOU Sport Centre.",
    "faculty": "Sports Directorate",
    "department": "Sports",
    "latitude": 6.927463,
    "longitude": 3.870328,
    "capacity": 300,
    "orientation_tips": "Immediately west of the Sports Pavilion.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
        "caption": "Basketball Court",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-volleyball",
    "name": "Volleyball Court",
    "code": "V-BALL",
    "category": "amenity",
    "description": "Outdoor volleyball courts adjacent to the main stadium pavilion.",
    "faculty": "Sports Directorate",
    "department": "Sports",
    "latitude": 6.927513,
    "longitude": 3.870828,
    "capacity": 250,
    "orientation_tips": "Between the basketball court and the main pavilion.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80",
        "caption": "Volleyball Court",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-odukale-lib",
    "name": "Sir Hassan Odukale Library",
    "code": "ODUKALE-LIB",
    "category": "library",
    "description": "Historic university library and study centre.",
    "faculty": "Library Core",
    "department": "Library Services",
    "latitude": 6.916638,
    "longitude": 3.873266,
    "capacity": 400,
    "orientation_tips": "Located along the southern avenue north of New Motion.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
        "caption": "Library Front View",
        "year": "2023"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-soc-sci-econ",
    "name": "Department Building (Economics & Social Sciences Block)",
    "code": "ECO-SMS",
    "category": "faculty",
    "description": "Main departmental home for 200L Economics, Political Science, and Sociology lectures.",
    "faculty": "Faculty of Social & Management Sciences",
    "department": "Economics",
    "latitude": 6.918538,
    "longitude": 3.872109,
    "capacity": 650,
    "orientation_tips": "Central Social Sciences avenue directly adjacent to the Rasheed Raji Building.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",
        "caption": "Economics Department Block",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-geography",
    "name": "Department of Geography",
    "code": "GEOG-DEPT",
    "category": "faculty",
    "description": "Geospatial labs and lecture halls for Geography & Regional Planning.",
    "faculty": "Faculty of Social & Management Sciences",
    "department": "Geography",
    "latitude": 6.918938,
    "longitude": 3.871891,
    "capacity": 350,
    "orientation_tips": "North of the Economics block on the Social Sciences loop.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
        "caption": "Geography Department Entrance",
        "year": "2023"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-mass-comm",
    "name": "Mass Communication Department",
    "code": "MASS-COMM",
    "category": "faculty",
    "description": "Broadcast studios, print lab, and media lecture rooms.",
    "faculty": "Faculty of Social Sciences",
    "department": "Mass Communication",
    "latitude": 6.921813,
    "longitude": 3.871891,
    "capacity": 400,
    "orientation_tips": "Adjacent to Central Facility and OOU Park transit terminal.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        "caption": "Mass Communication Studios",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-oou-park",
    "name": "OOU Park (Ago-Iwoye Shuttle Park)",
    "code": "OOU-PARK",
    "category": "amenity",
    "description": "Central campus transport terminal for shuttle cabs, kekes, and town transit.",
    "faculty": "Transit Directorate",
    "department": "Transportation",
    "latitude": 6.922488,
    "longitude": 3.873297,
    "capacity": 600,
    "orientation_tips": "Main campus bus & cab stop near the Security Unit.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80",
        "caption": "Shuttle Park Loading Bay",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-security-unit",
    "name": "OOU Security Unit (Headquarters)",
    "code": "SECURITY-HQ",
    "category": "admin",
    "description": "Campus security headquarters, emergency reporting, and safety operations.",
    "faculty": "University Administration",
    "department": "Security Directorate",
    "latitude": 6.922238,
    "longitude": 3.872891,
    "capacity": 100,
    "orientation_tips": "Adjacent to OOU Park on the eastern campus ring road.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        "caption": "Security Headquarters",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-admin-bursary",
    "name": "Admin Block I & Bursary Unit",
    "code": "ADMIN-BURSARY",
    "category": "admin",
    "description": "University financial bursary, student fee verification, and central administrative offices.",
    "faculty": "University Administration",
    "department": "Bursary",
    "latitude": 6.923812,
    "longitude": 3.870891,
    "capacity": 350,
    "orientation_tips": "Central admin core north of the Senate roundabout.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        "caption": "Admin Block I Front Entrance",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-odutola-bldg",
    "name": "Adeola Odutola Building",
    "code": "ODUTOLA-BLDG",
    "category": "lecture_hall",
    "description": "Major lecture auditorium and classroom complex for Science and combined disciplines.",
    "faculty": "Faculty of Science",
    "department": "Science",
    "latitude": 6.925713,
    "longitude": 3.869234,
    "capacity": 600,
    "orientation_tips": "Northwestern science corridor south of Mathematical Sciences.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80",
        "caption": "Adeola Odutola Building",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-math-sci",
    "name": "Department of Mathematical Sciences",
    "code": "MATH-SCI",
    "category": "faculty",
    "description": "Mathematics, Computer Science, and Statistics lecture halls and computing labs.",
    "faculty": "Faculty of Science",
    "department": "Mathematics",
    "latitude": 6.927113,
    "longitude": 3.869234,
    "capacity": 450,
    "orientation_tips": "Northwestern corner of campus beside the sports grounds.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        "caption": "Mathematical Sciences Block",
        "year": "2023"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-gns-unit",
    "name": "G.N.S Unit",
    "code": "GNS-UNIT",
    "category": "admin",
    "description": "General Nigerian Studies central coordination registry and exam hall.",
    "faculty": "Central Academic Core",
    "department": "GNS",
    "latitude": 6.924238,
    "longitude": 3.868047,
    "capacity": 200,
    "orientation_tips": "West of Admin Block I along the academic corridor.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
        "caption": "GNS Registry Unit",
        "year": "2023"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-ogd-law",
    "name": "Otunba Gbenga Daniel Building (Faculty of Law)",
    "code": "OGD-LAW",
    "category": "lecture_hall",
    "description": "Expansive law lecture auditorium and conference centre.",
    "faculty": "Faculty of Law",
    "department": "Law",
    "latitude": 6.921838,
    "longitude": 3.867922,
    "capacity": 800,
    "orientation_tips": "Mid-campus western perimeter road.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
        "caption": "OGD Law Auditorium",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-central-facility",
    "name": "OOU Central Facility (Quiet Study)",
    "code": "CENTRAL-FAC",
    "category": "library",
    "description": "Modern quiet study facility, reading halls, and academic annex.",
    "faculty": "University Academic Core",
    "department": "Library & Study",
    "latitude": 6.921063,
    "longitude": 3.869312,
    "capacity": 500,
    "orientation_tips": "Heart of campus on the central walkway.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
        "caption": "Central Facility Study Hall",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-oou-fm",
    "name": "OOU FM (92.1 FM)",
    "code": "OOU-FM",
    "category": "amenity",
    "description": "Official campus radio broadcasting station, audio studios, and transmission tower.",
    "faculty": "Mass Communication & Media",
    "department": "Broadcasting",
    "latitude": 6.916963,
    "longitude": 3.868484,
    "capacity": 80,
    "orientation_tips": "Adjacent to the Performing Arts Theatre on the arts loop.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
        "caption": "OOU 92.1 FM Studio",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-perf-arts",
    "name": "Performing Arts Theatre",
    "code": "PERF-ARTS",
    "category": "lecture_hall",
    "description": "Dedicated theatrical stage, drama auditorium, and cultural performance hall.",
    "faculty": "Faculty of Arts",
    "department": "Performing Arts",
    "latitude": 6.923427,
    "longitude": 3.868748,
    "capacity": 450,
    "orientation_tips": "Adjacent to the Arts Complex and OOU FM studios.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80",
        "caption": "Performing Arts Stage & Auditorium",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-arts-main",
    "name": "Faculty of Art (Main Building)",
    "code": "ARTS-MAIN",
    "category": "faculty",
    "description": "Deanery and administrative offices for English, History, and Philosophy.",
    "faculty": "Faculty of Arts",
    "department": "Humanities",
    "latitude": 6.915838,
    "longitude": 3.867641,
    "capacity": 350,
    "orientation_tips": "Southwestern arts enclave.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
        "caption": "Arts Main Building",
        "year": "2023"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-science-comp",
    "name": "Faculty of Science Complex",
    "code": "SCI-COMP",
    "category": "faculty",
    "description": "Comprehensive laboratory suites and lecture rooms for Physics, Chemistry, and Zoology.",
    "faculty": "Faculty of Science",
    "department": "Pure & Applied Sciences",
    "latitude": 6.924763,
    "longitude": 3.867859,
    "capacity": 700,
    "orientation_tips": "Northwest academic quadrant along the science avenue.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
        "caption": "Faculty of Science Laboratories",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-transport-cts",
    "name": "Center for Transport Studies",
    "code": "TRANS-CTS",
    "category": "lecture_hall",
    "description": "Specialized logistics and urban transit research and lecture hall.",
    "faculty": "Faculty of Social Sciences",
    "department": "Transport Studies",
    "latitude": 6.919537,
    "longitude": 3.870641,
    "capacity": 250,
    "orientation_tips": "Located along the central faculty avenue.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
        "caption": "Center for Transport Studies",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-chapel",
    "name": "OOU Chapel (Chapel of Abundant Life)",
    "code": "OOU-CHAPEL",
    "category": "amenity",
    "description": "University Christian fellowship auditorium and worship center.",
    "faculty": "Student Welfare",
    "department": "Religious Affairs",
    "latitude": 6.929163,
    "longitude": 3.877328,
    "capacity": 1200,
    "orientation_tips": "Northeastern spiritual zone along the perimeter road.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1548625361-195feeed1599?auto=format&fit=crop&w=1200&q=80",
        "caption": "Campus Chapel Auditorium",
        "year": "2024"
      }
    ],
    "is_active": true
  },
  {
    "id": "loc-mosque",
    "name": "OOU Central Mosque",
    "code": "OOU-MOSQUE",
    "category": "amenity",
    "description": "University Islamic prayer hall, ablution pavilions, and Muslim Students Society (MSSN) secretariat.",
    "faculty": "Student Welfare",
    "department": "Religious Affairs",
    "latitude": 6.929013,
    "longitude": 3.878516,
    "capacity": 1000,
    "orientation_tips": "Northeastern religious zone adjacent to the Chapel.",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80",
        "caption": "Campus Mosque Minaret & Plaza",
        "year": "2024"
      }
    ],
    "is_active": true
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(id?: string | null): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

export async function logAttendance(log: Omit<AttendanceLog, 'id' | 'attended_at'>): Promise<AttendanceLog | null> {
  const fallbackLog: AttendanceLog = {
    ...log,
    id: `att_${Date.now()}`,
    attended_at: new Date().toISOString(),
  };

  try {
    const payload = {
      ...log,
      user_id: isValidUUID(log.user_id) ? log.user_id : null,
    };

    const { data, error } = await supabase
      .from('attendance_logs')
      .insert([payload])
      .select()
      .single();

    if (error || !data) {
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('cohart_attendance_fallback') || '[]');
        stored.unshift(fallbackLog);
        localStorage.setItem('cohart_attendance_fallback', JSON.stringify(stored));
      }
      return fallbackLog;
    }

    // Also mirror to local storage for instant offline read
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('cohart_attendance_fallback') || '[]');
      stored.unshift(data as AttendanceLog);
      localStorage.setItem('cohart_attendance_fallback', JSON.stringify(stored));
    }

    return data as AttendanceLog;
  } catch {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('cohart_attendance_fallback') || '[]');
      stored.unshift(fallbackLog);
      localStorage.setItem('cohart_attendance_fallback', JSON.stringify(stored));
    }
    return fallbackLog;
  }
}

export async function fetchAttendanceLogs(userId: string): Promise<AttendanceLog[]> {
  try {
    if (isValidUUID(userId)) {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('user_id', userId)
        .order('attended_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as AttendanceLog[];
      }
    }

    if (typeof window !== 'undefined') {
      const local = JSON.parse(localStorage.getItem('cohart_attendance_fallback') || '[]');
      if (local.length > 0) return local;
    }

    return [];
  } catch {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('cohart_attendance_fallback') || '[]');
    }
    return [];
  }
}

export async function saveExplanation(explanation: Omit<SavedExplanation, 'id' | 'created_at'>): Promise<SavedExplanation | null> {
  const fallback: SavedExplanation = {
    ...explanation,
    id: `exp_${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  try {
    const payload = {
      ...explanation,
      user_id: isValidUUID(explanation.user_id) ? explanation.user_id : null,
    };

    const { data, error } = await supabase
      .from('saved_explanations')
      .insert([payload])
      .select()
      .single();

    if (error || !data) {
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('cohart_saved_explanations') || '[]');
        stored.unshift(fallback);
        localStorage.setItem('cohart_saved_explanations', JSON.stringify(stored));
      }
      return fallback;
    }

    // Mirror to local cache
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('cohart_saved_explanations') || '[]');
      stored.unshift(data as SavedExplanation);
      localStorage.setItem('cohart_saved_explanations', JSON.stringify(stored));
    }

    return data as SavedExplanation;
  } catch {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('cohart_saved_explanations') || '[]');
      stored.unshift(fallback);
      localStorage.setItem('cohart_saved_explanations', JSON.stringify(stored));
    }
    return fallback;
  }
}

export async function fetchSavedExplanations(userId?: string): Promise<SavedExplanation[]> {
  try {
    if (userId && isValidUUID(userId)) {
      const { data, error } = await supabase
        .from('saved_explanations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as SavedExplanation[];
      }
    }

    // Check public/anon records from database as well
    const { data: publicData } = await supabase
      .from('saved_explanations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (publicData && publicData.length > 0) {
      return publicData as SavedExplanation[];
    }

    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('cohart_saved_explanations') || '[]');
    }

    return [];
  } catch {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('cohart_saved_explanations') || '[]');
    }
    return [];
  }
}

export async function deleteSavedExplanation(id: string): Promise<boolean> {
  try {
    if (isValidUUID(id)) {
      await supabase.from('saved_explanations').delete().eq('id', id);
    }
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('cohart_saved_explanations') || '[]');
      const filtered = stored.filter((item: SavedExplanation) => item.id !== id);
      localStorage.setItem('cohart_saved_explanations', JSON.stringify(filtered));
    }
    return true;
  } catch {
    return false;
  }
}
