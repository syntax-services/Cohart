/**
 * Ogun State Higher Institutions Comprehensive Academic & Geospatial Catalog
 * Developed for Ogun State Tech/Innovate Summit Hackathon Edition (Vs)
 * Covers all Federal, State, and accredited Private tertiary institutions in Ogun State,
 * their respective campuses, faculties, departments, courses, and geospatial coordinates.
 */

export interface OgunCampus {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  isMainCampus: boolean;
  faculties: string[];
  transitTips: string;
}

export interface OgunDepartment {
  name: string;
  faculty: string;
  degree: string;
  levelRange: string[]; // e.g. ['100L', '200L', '300L', '400L', '500L']
  courses: {
    [level: string]: Array<{
      code: string;
      title: string;
      units: number;
      semester: 1 | 2;
    }>;
  };
}

export interface OgunInstitution {
  id: string;
  name: string;
  shortName: string;
  category: 'Federal' | 'State' | 'Private';
  type: 'University' | 'Polytechnic' | 'College of Education' | 'Monotechnic';
  campuses: OgunCampus[];
  departments: OgunDepartment[];
  aiCampusKnowledge: {
    overview: string;
    gateTransit: string;
    examCentres: string[];
    landmarks: string[];
  };
}

export const OGUN_INSTITUTIONS: OgunInstitution[] = [
  // =========================================================================
  // 1. OLABISI ONABANJO UNIVERSITY (OOU)
  // =========================================================================
  {
    id: 'OOU',
    name: 'Olabisi Onabanjo University',
    shortName: 'OOU',
    category: 'State',
    type: 'University',
    campuses: [
      {
        id: 'oou_main',
        name: 'Main Campus (Permanent Site - PS)',
        city: 'Ago-Iwoye',
        latitude: 6.9205,
        longitude: 3.8714,
        isMainCampus: true,
        faculties: [
          'Faculty of Arts',
          'Faculty of Law',
          'Faculty of Social Sciences',
          'Faculty of Science',
          'Faculty of Education',
          'Faculty of Administration and Management Sciences',
        ],
        transitTips:
          'Buses and kekes from Ago Garage drop students at School Park inside PS. From School Park, take internal Maruwa (tricycles) to Motion Ground, LLT, or SMS. Private and unregistered student motorcycles (okada) are strictly banned inside campus.',
      },
      {
        id: 'oou_sagamu',
        name: 'Sagamu Campus (Obafemi Awolowo College of Health Sciences - OACHS)',
        city: 'Sagamu',
        latitude: 6.8372,
        longitude: 3.6398,
        isMainCampus: false,
        faculties: [
          'Faculty of Basic Medical Sciences',
          'Faculty of Clinical Sciences',
        ],
        transitTips:
          'Located near OOUTH (Olabisi Onabanjo University Teaching Hospital), Sagamu. Accessible from Sagamu expressway or town centre via local cab/keke.',
      },
      {
        id: 'oou_ayetoro',
        name: 'Ayetoro Campus (College of Agricultural Sciences)',
        city: 'Ayetoro (Yewa)',
        latitude: 7.2341,
        longitude: 3.0332,
        isMainCampus: false,
        faculties: ['College of Agricultural Sciences'],
        transitTips:
          'Located on Ayetoro Road. Accessible from Abeokuta via Rounder garage or direct Yewa transit buses.',
      },
      {
        id: 'oou_ibogun',
        name: 'Ibogun Campus (College of Engineering and Technology)',
        city: 'Ibogun (Ifo)',
        latitude: 6.8833,
        longitude: 3.2333,
        isMainCampus: false,
        faculties: ['College of Engineering and Technology'],
        transitTips:
          'Located in Ibogun near Ifo. Accessible via Ifo junction or Abeokuta-Lagos rail/road corridor.',
      },
    ],
    departments: [
      {
        name: 'Economics',
        faculty: 'Faculty of Social Sciences',
        degree: 'B.Sc. Economics',
        levelRange: ['100L', '200L', '300L', '400L'],
        courses: {
          '100L': [
            { code: 'ECO 101', title: 'Principles of Economics I (Micro)', units: 3, semester: 1 },
            { code: 'ECO 102', title: 'Principles of Economics II (Macro)', units: 3, semester: 2 },
            { code: 'GST 101', title: 'Use of English & Communication Skills', units: 2, semester: 1 },
            { code: 'MTS 101', title: 'Introductory Mathematics for Social Sciences', units: 3, semester: 1 },
            { code: 'POL 101', title: 'Introduction to Political Science', units: 3, semester: 1 },
            { code: 'SOC 101', title: 'Introduction to Sociology', units: 3, semester: 1 },
          ],
          '200L': [
            { code: 'ECO 201', title: 'Microeconomic Theory I', units: 3, semester: 1 },
            { code: 'ECO 202', title: 'Macroeconomic Theory I', units: 3, semester: 2 },
            { code: 'ECO 203', title: 'Mathematics for Economists I', units: 3, semester: 1 },
            { code: 'ECO 205', title: 'Structure of the Nigerian Economy', units: 2, semester: 1 },
            { code: 'ACC 201', title: 'Financial Accounting I', units: 3, semester: 1 },
            { code: 'GST 212', title: 'Philosophy, Logic and Human Values', units: 2, semester: 1 },
          ],
          '300L': [
            { code: 'ECO 301', title: 'Microeconomic Theory II (Advanced)', units: 3, semester: 1 },
            { code: 'ECO 303', title: 'Introductory Econometrics I', units: 3, semester: 1 },
            { code: 'ECO 305', title: 'Public Finance & Fiscal Policy', units: 3, semester: 1 },
            { code: 'ECO 307', title: 'Money and Banking Systems', units: 3, semester: 1 },
            { code: 'ECO 309', title: 'History of Economic Thought', units: 2, semester: 1 },
          ],
          '400L': [
            { code: 'ECO 401', title: 'Advanced Microeconomics', units: 3, semester: 1 },
            { code: 'ECO 403', title: 'Advanced Econometrics & Time Series', units: 3, semester: 1 },
            { code: 'ECO 405', title: 'Economic Development & Planning', units: 3, semester: 1 },
            { code: 'ECO 407', title: 'International Trade & Finance', units: 3, semester: 1 },
            { code: 'ECO 499', title: 'Final Year Original Research Project', units: 6, semester: 2 },
          ],
        },
      },
      {
        name: 'Computer Science',
        faculty: 'Faculty of Science',
        degree: 'B.Sc. Computer Science',
        levelRange: ['100L', '200L', '300L', '400L'],
        courses: {
          '100L': [
            { code: 'CSC 101', title: 'Introduction to Computer Science & Computing', units: 3, semester: 1 },
            { code: 'MTH 101', title: 'Elementary Mathematics I (Algebra & Trigonometry)', units: 3, semester: 1 },
            { code: 'PHY 101', title: 'General Physics I (Mechanics & Thermal)', units: 3, semester: 1 },
            { code: 'CHM 101', title: 'General Chemistry I', units: 3, semester: 1 },
            { code: 'GST 101', title: 'Use of English', units: 2, semester: 1 },
          ],
          '200L': [
            { code: 'CSC 201', title: 'Computer Programming I (Python & C)', units: 3, semester: 1 },
            { code: 'CSC 203', title: 'Discrete Mathematical Structures', units: 3, semester: 1 },
            { code: 'CSC 205', title: 'Computer Hardware Architecture & Logic', units: 3, semester: 1 },
            { code: 'MTH 201', title: 'Mathematical Methods I', units: 3, semester: 1 },
            { code: 'GST 212', title: 'Philosophy and Logic', units: 2, semester: 1 },
          ],
          '300L': [
            { code: 'CSC 301', title: 'Structured Programming & Data Structures', units: 3, semester: 1 },
            { code: 'CSC 303', title: 'Object-Oriented Programming (Java/C++)', units: 3, semester: 1 },
            { code: 'CSC 305', title: 'Database Design & Management Systems', units: 3, semester: 1 },
            { code: 'CSC 307', title: 'Operating Systems & Concurrency', units: 3, semester: 1 },
            { code: 'CSC 399', title: 'Industrial Training (SIWES)', units: 6, semester: 2 },
          ],
          '400L': [
            { code: 'CSC 401', title: 'Software Engineering & Agile Methodologies', units: 3, semester: 1 },
            { code: 'CSC 403', title: 'Artificial Intelligence & Neural Systems', units: 3, semester: 1 },
            { code: 'CSC 405', title: 'Computer Networks & Distributed Systems', units: 3, semester: 1 },
            { code: 'CSC 407', title: 'Compiler Construction & Automata', units: 3, semester: 1 },
            { code: 'CSC 499', title: 'Final Year Capstone Project', units: 6, semester: 2 },
          ],
        },
      },
      {
        name: 'Accounting',
        faculty: 'Faculty of Administration and Management Sciences',
        degree: 'B.Sc. Accounting',
        levelRange: ['100L', '200L', '300L', '400L'],
        courses: {
          '100L': [
            { code: 'ACC 101', title: 'Principles of Accounting I', units: 3, semester: 1 },
            { code: 'BUS 101', title: 'Introduction to Business Administration', units: 3, semester: 1 },
            { code: 'ECO 101', title: 'Introductory Microeconomics', units: 3, semester: 1 },
            { code: 'GST 101', title: 'Communication in English', units: 2, semester: 1 },
            { code: 'MTS 101', title: 'Mathematics for Business', units: 3, semester: 1 },
          ],
          '200L': [
            { code: 'ACC 201', title: 'Financial Accounting I', units: 3, semester: 1 },
            { code: 'ACC 203', title: 'Cost Accounting Fundamentals', units: 3, semester: 1 },
            { code: 'BUS 201', title: 'Business Law (Commercial Law)', units: 3, semester: 1 },
            { code: 'FIN 201', title: 'Introduction to Financial Management', units: 3, semester: 1 },
          ],
          '300L': [
            { code: 'ACC 301', title: 'Intermediate Financial Accounting I', units: 3, semester: 1 },
            { code: 'ACC 303', title: 'Management Accounting & Control', units: 3, semester: 1 },
            { code: 'ACC 305', title: 'Auditing Principles and Field Practice', units: 3, semester: 1 },
            { code: 'ACC 307', title: 'Nigerian Taxation Law & Practice', units: 3, semester: 1 },
          ],
          '400L': [
            { code: 'ACC 401', title: 'Advanced Financial Accounting (IFRS)', units: 3, semester: 1 },
            { code: 'ACC 403', title: 'Public Sector Accounting & Reporting', units: 3, semester: 1 },
            { code: 'ACC 405', title: 'Auditing and Forensic Investigations', units: 3, semester: 1 },
            { code: 'ACC 499', title: 'Original Research Project', units: 6, semester: 2 },
          ],
        },
      },
      {
        name: 'Law',
        faculty: 'Faculty of Law',
        degree: 'LL.B. Law',
        levelRange: ['100L', '200L', '300L', '400L', '500L'],
        courses: {
          '100L': [
            { code: 'PUL 101', title: 'Legal Methods I', units: 3, semester: 1 },
            { code: 'PUL 102', title: 'Nigerian Legal System I', units: 3, semester: 1 },
            { code: 'GST 101', title: 'Use of English', units: 2, semester: 1 },
            { code: 'POL 101', title: 'Introduction to Political Science', units: 3, semester: 1 },
          ],
          '200L': [
            { code: 'PUL 201', title: 'Constitutional Law I', units: 4, semester: 1 },
            { code: 'PVL 201', title: 'Law of Contract I', units: 4, semester: 1 },
            { code: 'PUL 203', title: 'Nigerian Legal System II', units: 3, semester: 1 },
            { code: 'PVL 203', title: 'Labour Law I', units: 3, semester: 1 },
          ],
          '300L': [
            { code: 'PUL 301', title: 'Criminal Law I', units: 4, semester: 1 },
            { code: 'PVL 301', title: 'Law of Torts I', units: 4, semester: 1 },
            { code: 'CIL 301', title: 'Commercial Law I (Sale of Goods & Agency)', units: 4, semester: 1 },
          ],
          '400L': [
            { code: 'PVL 401', title: 'Land Law I', units: 4, semester: 1 },
            { code: 'PVL 403', title: 'Equity and Trusts I', units: 4, semester: 1 },
            { code: 'CIL 401', title: 'Law of Evidence I', units: 4, semester: 1 },
          ],
          '500L': [
            { code: 'JUR 501', title: 'Jurisprudence and Legal Theory I', units: 4, semester: 1 },
            { code: 'CIL 501', title: 'Company Law & Practice I', units: 4, semester: 1 },
            { code: 'PUL 501', title: 'International Law I', units: 3, semester: 1 },
            { code: 'LAW 599', title: 'Long Essay / Dissertation', units: 6, semester: 2 },
          ],
        },
      },
      {
        name: 'Mass Communication',
        faculty: 'Faculty of Social Sciences',
        degree: 'B.Sc. Mass Communication',
        levelRange: ['100L', '200L', '300L', '400L'],
        courses: {
          '100L': [
            { code: 'MAC 101', title: 'Introduction to Mass Communication', units: 3, semester: 1 },
            { code: 'MAC 103', title: 'History of Nigerian Media', units: 2, semester: 1 },
            { code: 'GST 101', title: 'Use of English', units: 2, semester: 1 },
            { code: 'POL 101', title: 'Introduction to Political Science', units: 3, semester: 1 },
          ],
          '200L': [
            { code: 'MAC 201', title: 'News Writing and Reporting', units: 3, semester: 1 },
            { code: 'MAC 203', title: 'Principles of Public Relations', units: 3, semester: 1 },
            { code: 'MAC 205', title: 'Broadcast Media Production', units: 3, semester: 1 },
          ],
          '300L': [
            { code: 'MAC 301', title: 'Investigative & Interpretative Journalism', units: 3, semester: 1 },
            { code: 'MAC 303', title: 'Mass Communication Theories', units: 3, semester: 1 },
            { code: 'MAC 305', title: 'Media Law and Ethics', units: 3, semester: 1 },
          ],
          '400L': [
            { code: 'MAC 401', title: 'International Communication & World Media', units: 3, semester: 1 },
            { code: 'MAC 403', title: 'Media Management and Entrepreneurship', units: 3, semester: 1 },
            { code: 'MAC 499', title: 'Research Project', units: 6, semester: 2 },
          ],
        },
      },
      {
        name: 'Medicine & Surgery',
        faculty: 'Faculty of Clinical Sciences',
        degree: 'MB;BS',
        levelRange: ['100L', '200L', '300L', '400L', '500L', '600L'],
        courses: {
          '100L': [
            { code: 'CHM 101', title: 'General Chemistry', units: 3, semester: 1 },
            { code: 'PHY 101', title: 'General Physics', units: 3, semester: 1 },
            { code: 'BIO 101', title: 'General Biology', units: 3, semester: 1 },
            { code: 'GST 101', title: 'Use of English', units: 2, semester: 1 },
          ],
          '200L': [
            { code: 'ANA 201', title: 'Gross Anatomy I (Upper & Lower Limb)', units: 4, semester: 1 },
            { code: 'PHS 201', title: 'Medical Physiology I (Blood & Cardiovascular)', units: 4, semester: 1 },
            { code: 'BCH 201', title: 'Medical Biochemistry I', units: 4, semester: 1 },
          ],
          '300L': [
            { code: 'ANA 301', title: 'Neuroanatomy & Head and Neck', units: 4, semester: 1 },
            { code: 'PHS 301', title: 'Physiology II (Respiratory & Renal)', units: 4, semester: 1 },
            { code: 'BCH 301', title: 'Clinical Biochemistry & Molecular Biology', units: 4, semester: 1 },
          ],
          '400L': [
            { code: 'PAT 401', title: 'General Pathology & Histopathology', units: 4, semester: 1 },
            { code: 'PHA 401', title: 'Basic & Clinical Pharmacology', units: 4, semester: 1 },
            { code: 'MIC 401', title: 'Medical Microbiology & Parasitology', units: 4, semester: 1 },
          ],
          '500L': [
            { code: 'OBG 501', title: 'Obstetrics and Gynaecology', units: 6, semester: 1 },
            { code: 'PED 501', title: 'Paediatrics & Child Health', units: 6, semester: 1 },
          ],
          '600L': [
            { code: 'MED 601', title: 'Internal Medicine Posting', units: 8, semester: 1 },
            { code: 'SUR 601', title: 'General Surgery & Orthopaedics', units: 8, semester: 1 },
          ],
        },
      },
    ],
    aiCampusKnowledge: {
      overview:
        'Olabisi Onabanjo University operates four campuses across Ogun State. The administrative headquarters is the Main Campus (Permanent Site, PS) in Ago-Iwoye. Health sciences are housed in Sagamu, agriculture in Ayetoro, and engineering in Ibogun.',
      gateTransit:
        'At Ago-Iwoye PS, commercial vehicles stop at the Main Gate / School Park. Students proceed inside campus via registered internal Maruwa (tricycles) running to Motion Ground, LLT complexes, and SMS auditoriums.',
      examCentres: [
        'ICT Centre CBT Hall (Ago-Iwoye PS)',
        'ETF Computer Science Laboratory (PS)',
        'SLR 1 Lecture Theatre (SMS Complex)',
        'LLT 1 & LLT 2 Law/Arts Lecture Theatres',
      ],
      landmarks: [
        'Otunba Gbenga Daniel (OGD) Convocation Hall',
        'Senate Building (White Administration Spire)',
        'New Motion Ground Food & Hub Axis',
        'Faculty of Arts Tiered Quadrangle (LLT 1)',
        'University Central Library',
      ],
    },
  },

  // =========================================================================
  // 2. FEDERAL UNIVERSITY OF AGRICULTURE, ABEOKUTA (FUNAAB)
  // =========================================================================
  {
    id: 'FUNAAB',
    name: 'Federal University of Agriculture, Abeokuta',
    shortName: 'FUNAAB',
    category: 'Federal',
    type: 'University',
    campuses: [
      {
        id: 'funaab_main',
        name: 'Main Campus',
        city: 'Alabata Road, Abeokuta',
        latitude: 7.2285,
        longitude: 3.4445,
        isMainCampus: true,
        faculties: [
          'COLAMRUD (Agricultural Management & Rural Development)',
          'COLANIM (Animal Science & Livestock Production)',
          'COLENG (Engineering)',
          'COLFHEC (Food Science & Human Ecology)',
          'COLPHYS (Physical Sciences)',
          'COLPLANT (Plant Science & Crop Production)',
          'COLVET (Veterinary Medicine)',
          'COLBIOS (Biological Sciences)',
        ],
        transitTips:
          'From Abeokuta metropolis (Camp junction or Panseke), board dedicated FUNAAB campus buses or student coaster buses straight down Alabata Road to FUNAAB Ceremonial Gate.',
      },
    ],
    departments: [
      {
        name: 'Computer Science',
        faculty: 'College of Physical Sciences (COLPHYS)',
        degree: 'B.Sc. Computer Science',
        levelRange: ['100L', '200L', '300L', '400L'],
        courses: {
          '100L': [
            { code: 'CSC 101', title: 'Introduction to Computer Science', units: 3, semester: 1 },
            { code: 'MTH 101', title: 'Algebra and Trigonometry', units: 3, semester: 1 },
            { code: 'PHS 101', title: 'General Physics I', units: 3, semester: 1 },
            { code: 'CHM 101', title: 'General Chemistry I', units: 3, semester: 1 },
            { code: 'GNS 101', title: 'Use of English', units: 2, semester: 1 },
          ],
          '200L': [
            { code: 'CSC 201', title: 'Computer Programming I (Python/Java)', units: 3, semester: 1 },
            { code: 'CSC 203', title: 'Foundations of Sequential Programming', units: 3, semester: 1 },
            { code: 'MTH 201', title: 'Mathematical Methods I', units: 3, semester: 1 },
            { code: 'GNS 201', title: 'Writing and Literary Appreciation', units: 2, semester: 1 },
          ],
          '300L': [
            { code: 'CSC 301', title: 'Data Structures and Algorithms', units: 3, semester: 1 },
            { code: 'CSC 303', title: 'Database Systems Architecture', units: 3, semester: 1 },
            { code: 'CSC 305', title: 'Operating Systems Principles', units: 3, semester: 1 },
            { code: 'CSC 399', title: 'SIWES Industrial Work Experience', units: 6, semester: 2 },
          ],
          '400L': [
            { code: 'CSC 401', title: 'Software Engineering Principles', units: 3, semester: 1 },
            { code: 'CSC 403', title: 'Artificial Intelligence & Expert Systems', units: 3, semester: 1 },
            { code: 'CSC 405', title: 'Computer Networks and Security', units: 3, semester: 1 },
            { code: 'CSC 499', title: 'Final Year Research Project', units: 6, semester: 2 },
          ],
        },
      },
      {
        name: 'Agricultural Economics',
        faculty: 'COLAMRUD',
        degree: 'B.Agric. Agricultural Economics',
        levelRange: ['100L', '200L', '300L', '400L', '500L'],
        courses: {
          '100L': [
            { code: 'AGR 101', title: 'Introduction to Agriculture', units: 3, semester: 1 },
            { code: 'BIO 101', title: 'General Biology I', units: 3, semester: 1 },
            { code: 'GNS 101', title: 'Use of English', units: 2, semester: 1 },
          ],
          '200L': [
            { code: 'AEC 201', title: 'Principles of Agricultural Economics', units: 3, semester: 1 },
            { code: 'AGP 201', title: 'Farm Practice Practical Year Prep', units: 2, semester: 1 },
          ],
          '300L': [
            { code: 'AEC 301', title: 'Agricultural Production Economics', units: 3, semester: 1 },
            { code: 'AEC 303', title: 'Farm Management Principles', units: 3, semester: 1 },
          ],
          '400L': [
            { code: 'FPE 401', title: 'Farm Practical Year (Full Hands-on Residency)', units: 12, semester: 1 },
          ],
          '500L': [
            { code: 'AEC 501', title: 'Advanced Agricultural Policy & Development', units: 3, semester: 1 },
            { code: 'AEC 599', title: 'Final Project', units: 6, semester: 2 },
          ],
        },
      },
    ],
    aiCampusKnowledge: {
      overview:
        'FUNAAB is Nigeria’s premier federal agriculture university, located on expansive farmland along Alabata Road, Abeokuta. Highly known for its Farm Practical Year (FPY), COLENG engineering workshops, and strict Senate exam standards.',
      gateTransit:
        'Camp Junction in Abeokuta is the central student departure point. Coaster buses run directly to Ceremonial Building and Motion Ground inside campus.',
      examCentres: [
        'Mahmood Yakubu CBT Centre',
        '250-Capacity Computer Laboratory',
        'COLENG Auditorium',
        'JAO 1, 2, 3 Lecture Theatres',
      ],
      landmarks: [
        'Ceremonial Building (Main Administration)',
        'Nimbe Adedipe Central Library',
        'FUNAAB International School & Zoo Park',
        'INCUBS Industrial Farms & Dairy Plant',
      ],
    },
  },

  // =========================================================================
  // 3. TAI SOLARIN UNIVERSITY OF EDUCATION (TASUED)
  // =========================================================================
  {
    id: 'TASUED',
    name: 'Tai Solarin University of Education',
    shortName: 'TASUED',
    category: 'State',
    type: 'University',
    campuses: [
      {
        id: 'tasued_main',
        name: 'Main Campus',
        city: 'Ijagun, Ijebu-Ode',
        latitude: 6.8202,
        longitude: 3.9664,
        isMainCampus: true,
        faculties: [
          'COAEVOT (Applied Education & Vocational Technology)',
          'COHUM (Humanities)',
          'COSPED (Specialized & Professional Education)',
          'COSIT (Science & Information Technology)',
          'COSMAS (Management & Social Sciences)',
        ],
        transitTips:
          'From Ijebu-Ode central garage, board Ijagun cabs/keke directly to TASUED Main Gate. Internal transit is pedestrian-friendly with designated motorcycle shuttles.',
      },
      {
        id: 'tasued_ososa',
        name: 'Ososa Campus',
        city: 'Ososa',
        latitude: 6.7865,
        longitude: 3.8647,
        isMainCampus: false,
        faculties: ['Vocational Education & Agro-Allied Centres'],
        transitTips: 'Accessible along the Sagamu-Benin expressway axis via Ososa junction.',
      },
    ],
    departments: [
      {
        name: 'Computer Science (Education)',
        faculty: 'College of Science & Information Technology (COSIT)',
        degree: 'B.Sc. (Ed) Computer Science',
        levelRange: ['100L', '200L', '300L', '400L'],
        courses: {
          '100L': [
            { code: 'CSC 111', title: 'Introduction to Computer Systems', units: 3, semester: 1 },
            { code: 'EDU 111', title: 'Introduction to Foundations of Education', units: 2, semester: 1 },
            { code: 'GNS 111', title: 'Use of English', units: 2, semester: 1 },
          ],
          '200L': [
            { code: 'CSC 211', title: 'Structured Programming Concepts', units: 3, semester: 1 },
            { code: 'EDU 211', title: 'Curriculum Studies & Educational Tech', units: 2, semester: 1 },
          ],
          '300L': [
            { code: 'CSC 311', title: 'Data Structures and Algorithms', units: 3, semester: 1 },
            { code: 'EDU 311', title: 'Teaching Practice I', units: 3, semester: 1 },
          ],
          '400L': [
            { code: 'CSC 411', title: 'Systems Analysis and Design', units: 3, semester: 1 },
            { code: 'EDU 411', title: 'Teaching Practice II', units: 6, semester: 1 },
            { code: 'CSC 499', title: 'Final Project', units: 6, semester: 2 },
          ],
        },
      },
    ],
    aiCampusKnowledge: {
      overview:
        'TASUED in Ijagun, Ijebu-Ode is Nigeria’s first premier university of education. Every student graduates with a dual honors degree: their academic discipline plus vocational teaching certification.',
      gateTransit:
        'Tricycles from Ijebu-Ode express garage drop at the Ceremonial Gate in Ijagun.',
      examCentres: ['TETFUND CBT Hall', 'Academic Quadrangle LT', 'CEPEP Auditoriums'],
      landmarks: ['Otunba Gbenga Daniel Quadrangle', 'TASUED Central Library', 'Science Laboratory Complex'],
    },
  },

  // =========================================================================
  // 4. MOSHOOD ABIOLA POLYTECHNIC (MAPOLY)
  // =========================================================================
  {
    id: 'MAPOLY',
    name: 'Moshood Abiola Polytechnic',
    shortName: 'MAPOLY',
    category: 'State',
    type: 'Polytechnic',
    campuses: [
      {
        id: 'mapoly_ojere',
        name: 'Ojere Main Campus',
        city: 'Ojere, Abeokuta',
        latitude: 7.1264,
        longitude: 3.3275,
        isMainCampus: true,
        faculties: [
          'School of Business & Management Studies',
          'School of Engineering',
          'School of Environmental Studies',
          'School of Communication & Information Technology',
          'School of Science & Technology',
        ],
        transitTips:
          'From Panseke garage in Abeokuta, board the famous Ojere student taxis directly through Onikolobo down to MAPOLY Main Gate.',
      },
    ],
    departments: [
      {
        name: 'Mass Communication',
        faculty: 'School of Communication & Information Technology',
        degree: 'ND / HND Mass Communication',
        levelRange: ['ND 1', 'ND 2', 'HND 1', 'HND 2'],
        courses: {
          'ND 1': [
            { code: 'MAC 111', title: 'Introduction to Mass Communication', units: 3, semester: 1 },
            { code: 'MAC 113', title: 'English for Mass Communication', units: 2, semester: 1 },
          ],
          'ND 2': [
            { code: 'MAC 211', title: 'Radio/TV Production Practical', units: 3, semester: 1 },
            { code: 'MAC 213', title: 'Newspaper & Magazine Production', units: 3, semester: 1 },
          ],
          'HND 1': [
            { code: 'MAC 311', title: 'Advanced Broadcast Journalism', units: 3, semester: 1 },
          ],
          'HND 2': [
            { code: 'MAC 411', title: 'Media Law and Investigative Reporting', units: 3, semester: 1 },
          ],
        },
      },
      {
        name: 'Accountancy',
        faculty: 'School of Business & Management Studies',
        degree: 'ND / HND Accountancy',
        levelRange: ['ND 1', 'ND 2', 'HND 1', 'HND 2'],
        courses: {
          'ND 1': [
            { code: 'ACC 111', title: 'Principles of Accounts I', units: 3, semester: 1 },
            { code: 'BAM 111', title: 'Introduction to Business I', units: 3, semester: 1 },
          ],
          'ND 2': [
            { code: 'ACC 211', title: 'Financial Accounting I', units: 3, semester: 1 },
          ],
          'HND 1': [
            { code: 'ACC 311', title: 'Advanced Cost Accounting', units: 3, semester: 1 },
          ],
          'HND 2': [
            { code: 'ACC 411', title: 'Auditing and Investigation', units: 3, semester: 1 },
          ],
        },
      },
    ],
    aiCampusKnowledge: {
      overview:
        'MAPOLY in Ojere, Abeokuta is one of the most celebrated polytechnics in West Africa, known for producing top-tier media personalities, accountants, and engineers.',
      gateTransit:
        'Panseke is the major transport transit hub. Taxis run continuously through Onikolobo to Ojere campus.',
      examCentres: ['Otunba Subomi Balogun CBT Hall', 'School of Engineering Auditorium'],
      landmarks: ['Panseke-Ojere corridor', 'School of Business Quad', 'Polytechnic Central Library'],
    },
  },

  // =========================================================================
  // 5. FEDERAL POLYTECHNIC, ILARO (FPI)
  // =========================================================================
  {
    id: 'FPI',
    name: 'Federal Polytechnic, Ilaro',
    shortName: 'Fed Poly Ilaro',
    category: 'Federal',
    type: 'Polytechnic',
    campuses: [
      {
        id: 'fpi_main',
        name: 'Main Campus',
        city: 'Ilaro',
        latitude: 6.8875,
        longitude: 2.9985,
        isMainCampus: true,
        faculties: [
          'School of Applied Science',
          'School of Communication & Information Technology',
          'School of Engineering',
          'School of Environmental Studies',
          'School of Management Studies',
        ],
        transitTips:
          'From Ilaro express garage or roundabout, tricycles and taxis drop students directly at the West or East Gates of the Polytechnic.',
      },
    ],
    departments: [
      {
        name: 'Computer Science',
        faculty: 'School of Applied Science',
        degree: 'ND / HND Computer Science',
        levelRange: ['ND 1', 'ND 2', 'HND 1', 'HND 2'],
        courses: {
          'ND 1': [
            { code: 'COM 111', title: 'Introduction to Computing', units: 3, semester: 1 },
            { code: 'MTH 111', title: 'Logic and Linear Algebra', units: 2, semester: 1 },
          ],
          'ND 2': [
            { code: 'COM 211', title: 'Object Oriented Programming', units: 3, semester: 1 },
          ],
          'HND 1': [
            { code: 'COM 311', title: 'Operating Systems Architecture', units: 3, semester: 1 },
          ],
          'HND 2': [
            { code: 'COM 411', title: 'Artificial Intelligence & Robotics', units: 3, semester: 1 },
          ],
        },
      },
    ],
    aiCampusKnowledge: {
      overview:
        'Fed Poly Ilaro is consistently ranked the best federal polytechnic in Nigeria for discipline, uninterrupted academic calendars, and technical innovation.',
      gateTransit: 'East Gate and West Gate are the two primary entryways from Ilaro township.',
      examCentres: ['FPI Ultra-Modern CBT Complex', 'International Conference Centre'],
      landmarks: ['Twin Auditorium', 'School of Engineering Workshop', 'Polytechnic Library'],
    },
  },

  // =========================================================================
  // 6. BABCOCK UNIVERSITY
  // =========================================================================
  {
    id: 'BABCOCK',
    name: 'Babcock University',
    shortName: 'Babcock',
    category: 'Private',
    type: 'University',
    campuses: [
      {
        id: 'babcock_main',
        name: 'Main Campus',
        city: 'Ilishan-Remo',
        latitude: 6.8925,
        longitude: 3.7198,
        isMainCampus: true,
        faculties: [
          'Benjamin Carson College of Medicine',
          'School of Computing and Engineering Sciences',
          'School of Law and Security Studies',
          'School of Management Sciences',
          'School of Public and Allied Health',
        ],
        transitTips:
          'Located off the Sagamu-Benin expressway at Ilishan-Remo. Entry is gated with strict campus security pass controls.',
      },
      {
        id: 'babcock_iperu',
        name: 'Iperu Campus',
        city: 'Iperu-Remo',
        latitude: 6.908,
        longitude: 3.662,
        isMainCampus: false,
        faculties: ['School of Law and Security Studies Annexe'],
        transitTips: 'Accessible from Iperu town roundabout or Sagamu junction.',
      },
    ],
    departments: [
      {
        name: 'Software Engineering',
        faculty: 'School of Computing and Engineering Sciences',
        degree: 'B.Sc. Software Engineering',
        levelRange: ['100L', '200L', '300L', '400L'],
        courses: {
          '100L': [
            { code: 'SENG 101', title: 'Introduction to Software Engineering', units: 3, semester: 1 },
            { code: 'COSC 101', title: 'Introduction to Problem Solving', units: 3, semester: 1 },
          ],
          '200L': [
            { code: 'SENG 201', title: 'Software Specification and Architecture', units: 3, semester: 1 },
          ],
          '300L': [
            { code: 'SENG 301', title: 'Software Quality Assurance and Testing', units: 3, semester: 1 },
          ],
          '400L': [
            { code: 'SENG 401', title: 'Software Project Management & Capstone', units: 4, semester: 1 },
          ],
        },
      },
    ],
    aiCampusKnowledge: {
      overview:
        'Babcock University in Ilishan-Remo is a pioneer private university in Nigeria, home to the Benjamin Carson College of Medicine and high-impact computing programs.',
      gateTransit: 'Strict identity badge check at Ilishan-Remo security gatehouse.',
      examCentres: ['BUTH Medical Lecture Halls', 'Computing Complex CBT Centre'],
      landmarks: ['Babcock University Teaching Hospital (BUTH)', 'Amphitheatre', 'Pioneer Hall'],
    },
  },

  // =========================================================================
  // 7. COVENANT UNIVERSITY
  // =========================================================================
  {
    id: 'COVENANT',
    name: 'Covenant University',
    shortName: 'Covenant',
    category: 'Private',
    type: 'University',
    campuses: [
      {
        id: 'cu_main',
        name: 'Canaanland Main Campus',
        city: 'Ota',
        latitude: 6.6726,
        longitude: 3.1614,
        isMainCampus: true,
        faculties: [
          'College of Engineering (COE)',
          'College of Science and Technology (CST)',
          'College of Management and Social Sciences (CMSS)',
          'College of Leadership and Development Studies (CLDS)',
        ],
        transitTips:
          'Located inside Canaanland, Km 10 Idiroko Road, Ota. Internal movement is regulated with student shuttle services.',
      },
    ],
    departments: [
      {
        name: 'Computer Engineering',
        faculty: 'College of Engineering (COE)',
        degree: 'B.Eng. Computer Engineering',
        levelRange: ['100L', '200L', '300L', '400L', '500L'],
        courses: {
          '100L': [
            { code: 'CEN 111', title: 'Introduction to Computer Engineering', units: 2, semester: 1 },
            { code: 'MAT 111', title: 'Calculus and Algebra', units: 3, semester: 1 },
          ],
          '200L': [
            { code: 'CEN 211', title: 'Digital Logic and Microprocessors', units: 3, semester: 1 },
          ],
          '300L': [
            { code: 'CEN 311', title: 'Embedded Systems Design', units: 3, semester: 1 },
          ],
          '400L': [
            { code: 'CEN 411', title: 'Advanced Digital Signal Processing', units: 3, semester: 1 },
          ],
          '500L': [
            { code: 'CEN 599', title: 'Engineering Capstone Project', units: 6, semester: 2 },
          ],
        },
      },
    ],
    aiCampusKnowledge: {
      overview:
        'Covenant University in Ota is Africa’s leading private research university, internationally recognized in Times Higher Education rankings for research citation impact.',
      gateTransit: 'Idiroko Road main gate access with biometric scanning.',
      examCentres: ['CST Lecture Complex', 'COE Engineering Workshops', 'CU CBT Center'],
      landmarks: ['Covenant University Centre for Research (CUCRID)', 'University Library', 'Chapel'],
    },
  },

  // =========================================================================
  // 8. BELLS UNIVERSITY OF TECHNOLOGY
  // =========================================================================
  {
    id: 'BELLSTECH',
    name: 'Bells University of Technology',
    shortName: 'Bells Tech',
    category: 'Private',
    type: 'University',
    campuses: [
      {
        id: 'bells_main',
        name: 'Main Campus',
        city: 'Ota',
        latitude: 6.6975,
        longitude: 3.1895,
        isMainCampus: true,
        faculties: [
          'College of Engineering',
          'College of Environmental Sciences',
          'College of Natural and Applied Sciences',
          'College of Management Sciences',
        ],
        transitTips: 'Located along the Idiroko Road corridor in Ota.',
      },
    ],
    departments: [
      {
        name: 'Biomedical Engineering',
        faculty: 'College of Engineering',
        degree: 'B.Eng. Biomedical Engineering',
        levelRange: ['100L', '200L', '300L', '400L', '500L'],
        courses: {
          '100L': [{ code: 'BME 101', title: 'Introduction to Biomedical Tech', units: 2, semester: 1 }],
          '200L': [{ code: 'BME 201', title: 'Biomaterials and Implants', units: 3, semester: 1 }],
        },
      },
    ],
    aiCampusKnowledge: {
      overview: 'Nigeria’s first private university of technology, located in Ota.',
      gateTransit: 'Accessible via Idiroko Expressway in Ota.',
      examCentres: ['COLENG Laboratories', 'BellsTech Multi-Purpose Hall'],
      landmarks: ['Engineering Innovation Hub', 'University Library'],
    },
  },

  // =========================================================================
  // 9. GATEWAY (ICT) POLYTECHNIC, SAAPADE
  // =========================================================================
  {
    id: 'GAPOSA',
    name: 'Gateway (ICT) Polytechnic, Saapade',
    shortName: 'Gateway Poly',
    category: 'State',
    type: 'Polytechnic',
    campuses: [
      {
        id: 'gaposa_main',
        name: 'Saapade Main Campus',
        city: 'Saapade (Remo)',
        latitude: 6.9535,
        longitude: 3.6698,
        isMainCampus: true,
        faculties: [
          'School of Science and Technology',
          'School of Financial Studies',
          'School of Management Studies',
          'School of Engineering',
        ],
        transitTips:
          'Located at Saapade junction along the Lagos-Ibadan expressway. Highly accessible from Sagamu, Ishara, and Ode-Remo.',
      },
    ],
    departments: [
      {
        name: 'Computer Science',
        faculty: 'School of Science and Technology',
        degree: 'ND / HND Computer Science',
        levelRange: ['ND 1', 'ND 2', 'HND 1', 'HND 2'],
        courses: {
          'ND 1': [{ code: 'COM 111', title: 'Computer Hardware & Architecture', units: 3, semester: 1 }],
          'ND 2': [{ code: 'COM 211', title: 'Data Structures and Algorithms', units: 3, semester: 1 }],
        },
      },
    ],
    aiCampusKnowledge: {
      overview:
        'Gateway ICT Polytechnic in Saapade is Ogun State’s specialized digital and technological polytechnic, known for high ICT adoption and modern CBT facilities.',
      gateTransit: 'Saapade Expressway junction drop-off.',
      examCentres: ['Gateway ICT Complex CBT Centre', 'School of Science Labs'],
      landmarks: ['ICT Park', 'Main Administrative Complex'],
    },
  },

  // =========================================================================
  // 10. OGUN STATE COLLEGE OF HEALTH TECHNOLOGY (OSCOHTECH)
  // =========================================================================
  {
    id: 'OSCOHTECH',
    name: 'Ogun State College of Health Technology',
    shortName: 'OSCOHTECH Ilese',
    category: 'State',
    type: 'Monotechnic',
    campuses: [
      {
        id: 'oscohtech_main',
        name: 'Ilese-Ijebu Main Campus',
        city: 'Ilese-Ijebu',
        latitude: 6.8125,
        longitude: 3.9785,
        isMainCampus: true,
        faculties: [
          'School of Community Health',
          'School of Environmental Health',
          'School of Health Information Management',
          'School of Pharmacy & Medical Laboratory Tech',
        ],
        transitTips:
          'Located along the old Ijebu-Ode to Benin road in Ilese. Accessible by cabs and kekes from Ijebu-Ode town.',
      },
    ],
    departments: [
      {
        name: 'Health Information Management',
        faculty: 'School of Health Information Management',
        degree: 'ND / HND Health Information Management',
        levelRange: ['ND 1', 'ND 2', 'HND 1', 'HND 2'],
        courses: {
          'ND 1': [{ code: 'HIM 101', title: 'Medical Terminology & Record Systems', units: 3, semester: 1 }],
        },
      },
    ],
    aiCampusKnowledge: {
      overview: 'Pioneer health technology institution training paramedics, record officers, and community health specialists in Ogun State.',
      gateTransit: 'Ilese junction taxi/keke stop.',
      examCentres: ['OSCOHTECH CBT Lab', 'Health Sciences Hall'],
      landmarks: ['Clinical Skills Simulation Centre', 'College Library'],
    },
  },

  // =========================================================================
  // 11. CRESCENT UNIVERSITY, ABEOKUTA
  // =========================================================================
  {
    id: 'CRESCENT',
    name: 'Crescent University, Abeokuta',
    shortName: 'Crescent',
    category: 'Private',
    type: 'University',
    campuses: [
      {
        id: 'crescent_main',
        name: 'Abeokuta Campus',
        city: 'Abeokuta (Ayetoro Road)',
        latitude: 7.1824,
        longitude: 3.3085,
        isMainCampus: true,
        faculties: [
          'Bola Ajibola College of Law',
          'College of Information and Communication Tech (CICOT)',
          'College of Environmental Sciences',
          'College of Natural and Applied Sciences',
          'College of Arts, Social & Management Sciences',
        ],
        transitTips: 'Located along Ayetoro Road from Lafenwa, Abeokuta.',
      },
    ],
    departments: [
      {
        name: 'Information Technology',
        faculty: 'College of Information and Communication Tech',
        degree: 'B.Sc. Information Technology',
        levelRange: ['100L', '200L', '300L', '400L'],
        courses: {
          '100L': [{ code: 'ICT 101', title: 'Introduction to Internet Technologies', units: 3, semester: 1 }],
        },
      },
    ],
    aiCampusKnowledge: {
      overview: 'Founded by former World Court Judge Prince Bola Ajibola, renowned for moral education and its College of Law.',
      gateTransit: 'Lafenwa-Ayetoro transit corridor.',
      examCentres: ['CICOT CBT Laboratory', 'Law Lecture Auditorium'],
      landmarks: ['Bola Ajibola Law Complex', 'Mosque', 'University Central Library'],
    },
  },

  // =========================================================================
  // 12. MOUNTAIN TOP UNIVERSITY
  // =========================================================================
  {
    id: 'MTU',
    name: 'Mountain Top University',
    shortName: 'Mountain Top',
    category: 'Private',
    type: 'University',
    campuses: [
      {
        id: 'mtu_main',
        name: 'Makogi Oba Main Campus',
        city: 'Makogi Oba (Lagos-Ibadan Expressway)',
        latitude: 6.782,
        longitude: 3.483,
        isMainCampus: true,
        faculties: [
          'College of Basic and Applied Sciences (CBAS)',
          'College of Humanities, Management & Social Sciences (CHMS)',
        ],
        transitTips: 'Accessible off the Lagos-Ibadan expressway near Prayer City.',
      },
    ],
    departments: [
      {
        name: 'Cyber Security',
        faculty: 'College of Basic and Applied Sciences',
        degree: 'B.Sc. Cyber Security',
        levelRange: ['100L', '200L', '300L', '400L'],
        courses: {
          '100L': [{ code: 'CYB 101', title: 'Fundamentals of Cyber Security', units: 3, semester: 1 }],
        },
      },
    ],
    aiCampusKnowledge: {
      overview: 'Private university established by MFM along the Lagos-Ibadan highway corridor in Ogun State.',
      gateTransit: 'Expressway interchange entrance.',
      examCentres: ['CBAS Computer Labs', 'Multipurpose Auditorium'],
      landmarks: ['University Administrative Building', 'CBAS Complex'],
    },
  },

  // =========================================================================
  // 13. CRAWFORD UNIVERSITY
  // =========================================================================
  {
    id: 'CRAWFORD',
    name: 'Crawford University',
    shortName: 'Crawford',
    category: 'Private',
    type: 'University',
    campuses: [
      {
        id: 'crawford_main',
        name: 'Faith City Campus',
        city: 'Igbesa',
        latitude: 6.5412,
        longitude: 3.125,
        isMainCampus: true,
        faculties: [
          'College of Natural & Applied Sciences',
          'College of Business & Social Sciences',
        ],
        transitTips: 'Located in Faith City, Igbesa, accessible through Lusada / Ota route.',
      },
    ],
    departments: [
      {
        name: 'Business Administration',
        faculty: 'College of Business & Social Sciences',
        degree: 'B.Sc. Business Administration',
        levelRange: ['100L', '200L', '300L', '400L'],
        courses: {
          '100L': [{ code: 'BUS 101', title: 'Elements of Management', units: 3, semester: 1 }],
        },
      },
    ],
    aiCampusKnowledge: {
      overview: 'Private Christian university in Igbesa, Ogun State, established by Apostolic Faith Mission.',
      gateTransit: 'Faith City main entrance gate in Igbesa.',
      examCentres: ['Auditorium Complex', 'University CBT Lab'],
      landmarks: ['Faith City Quadrangle', 'Central Library'],
    },
  },

  // =========================================================================
  // 14. ABRAHAM ADESANYA POLYTECHNIC (AAPOLY)
  // =========================================================================
  {
    id: 'AAPOLY',
    name: 'Abraham Adesanya Polytechnic',
    shortName: 'AAPOLY',
    category: 'State',
    type: 'Polytechnic',
    campuses: [
      {
        id: 'aapoly_main',
        name: 'Atikori Campus',
        city: 'Ijebu-Igbo',
        latitude: 6.9712,
        longitude: 3.9985,
        isMainCampus: true,
        faculties: [
          'School of Science and Technology',
          'School of Management Studies',
        ],
        transitTips: 'Accessible from Ijebu-Igbo township centre.',
      },
    ],
    departments: [
      {
        name: 'Business Administration',
        faculty: 'School of Management Studies',
        degree: 'ND / HND Business Administration',
        levelRange: ['ND 1', 'ND 2'],
        courses: {
          'ND 1': [{ code: 'BAM 111', title: 'Introduction to Business', units: 3, semester: 1 }],
        },
      },
    ],
    aiCampusKnowledge: {
      overview: 'State polytechnic in Ijebu-Igbo named after elder statesman Chief Abraham Adesanya.',
      gateTransit: 'Atikori entrance gate.',
      examCentres: ['AAPOLY CBT Hall'],
      landmarks: ['Main Administrative Block', 'Library'],
    },
  },

  // =========================================================================
  // 15. D.S. ADEGBENRO ICT POLYTECHNIC
  // =========================================================================
  {
    id: 'DSAP',
    name: 'D.S. Adegbenro ICT Polytechnic',
    shortName: 'DS Adegbenro Poly',
    category: 'State',
    type: 'Polytechnic',
    campuses: [
      {
        id: 'dsap_main',
        name: 'Itori-Ewekoro Campus',
        city: 'Itori (Ewekoro)',
        latitude: 6.9385,
        longitude: 3.2215,
        isMainCampus: true,
        faculties: [
          'School of Information & Communication Tech',
          'School of Management Sciences',
          'School of Engineering',
        ],
        transitTips: 'Located along the Lagos-Abeokuta expressway at Itori.',
      },
    ],
    departments: [
      {
        name: 'Computer Science',
        faculty: 'School of Information & Communication Tech',
        degree: 'ND / HND Computer Science',
        levelRange: ['ND 1', 'ND 2'],
        courses: {
          'ND 1': [{ code: 'COM 111', title: 'Computing Systems', units: 3, semester: 1 }],
        },
      },
    ],
    aiCampusKnowledge: {
      overview: 'Ogun State ICT polytechnic located in Itori along the Abeokuta-Lagos expressway axis.',
      gateTransit: 'Itori junction drop-off.',
      examCentres: ['ICT Complex CBT Centre'],
      landmarks: ['Main Campus Pavilion', 'Administrative Spire'],
    },
  },

  // =========================================================================
  // 16. TAI SOLARIN COLLEGE OF EDUCATION (TASCE)
  // =========================================================================
  {
    id: 'TASCE',
    name: 'Sikiru Adetona College of Education, Science and Technology (formerly TASCE)',
    shortName: 'TASCE Omu',
    category: 'State',
    type: 'College of Education',
    campuses: [
      {
        id: 'tasce_main',
        name: 'Omu-Ijebu Campus',
        city: 'Omu-Ijebu',
        latitude: 6.758,
        longitude: 3.912,
        isMainCampus: true,
        faculties: [
          'School of Sciences',
          'School of Vocational and Technical Education',
          'School of Arts and Social Sciences',
          'School of Education',
        ],
        transitTips: 'Accessible from Ijebu-Ode or Epe-Ijebu route via Omu-Ijebu.',
      },
    ],
    departments: [
      {
        name: 'Primary Education Studies',
        faculty: 'School of Education',
        degree: 'NCE Primary Education',
        levelRange: ['NCE 1', 'NCE 2', 'NCE 3'],
        courses: {
          'NCE 1': [{ code: 'PES 111', title: 'Primary Education Foundations', units: 2, semester: 1 }],
        },
      },
    ],
    aiCampusKnowledge: {
      overview: 'Historic teacher-training institution in Omu-Ijebu, recently upgraded to a degree-awarding college of education and technology.',
      gateTransit: 'Omu main gate.',
      examCentres: ['College Multipurpose Hall'],
      landmarks: ['Central Quadrangle', 'School of Sciences Complex'],
    },
  },

  // =========================================================================
  // 17. CHRISLAND UNIVERSITY
  // =========================================================================
  {
    id: 'CHRISLAND',
    name: 'Chrisland University',
    shortName: 'Chrisland',
    category: 'Private',
    type: 'University',
    campuses: [
      {
        id: 'chrisland_main',
        name: 'Ajebo Road Campus',
        city: 'Abeokuta',
        latitude: 7.1085,
        longitude: 3.4125,
        isMainCampus: true,
        faculties: [
          'College of Natural & Applied Sciences',
          'College of Management & Social Sciences',
          'College of Basic Medical Sciences',
        ],
        transitTips: 'Located along Ajebo Road, off the Abeokuta-Sagamu interchange corridor.',
      },
    ],
    departments: [
      {
        name: 'Biochemistry',
        faculty: 'College of Natural & Applied Sciences',
        degree: 'B.Sc. Biochemistry',
        levelRange: ['100L', '200L', '300L', '400L'],
        courses: {
          '100L': [{ code: 'BCH 101', title: 'General Biochemistry', units: 3, semester: 1 }],
        },
      },
    ],
    aiCampusKnowledge: {
      overview: 'Private university in Abeokuta known for high academic integrity and modern laboratories.',
      gateTransit: 'Ajebo Road main gate.',
      examCentres: ['Chrisland CBT Hall'],
      landmarks: ['Main Administrative Building', 'Sciences Complex'],
    },
  },
];

/**
 * Get an institution by ID or code or partial name
 */
export function getOgunInstitution(codeOrId: string): OgunInstitution | undefined {
  if (!codeOrId) return undefined;
  const clean = codeOrId.trim().toUpperCase();
  return (
    OGUN_INSTITUTIONS.find((inst) => inst.id.toUpperCase() === clean) ||
    OGUN_INSTITUTIONS.find((inst) => inst.shortName.toUpperCase() === clean) ||
    OGUN_INSTITUTIONS.find((inst) => inst.name.toUpperCase().includes(clean))
  );
}

/**
 * Helper to check if an institution code is OOU
 */
export function isOouCode(codeOrName: string): boolean {
  if (!codeOrName) return false;
  const s = codeOrName.toLowerCase();
  return (
    s === 'oou' ||
    s.includes('onabanjo') ||
    s.includes('ago-iwoye') ||
    s.includes('ago iwoye')
  );
}
