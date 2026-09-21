export interface OOUCourse {
  code: string;
  title: string;
  units: number;
  semester: 1 | 2;
  level: string; // '100L' | '200L' | '300L' | '400L' | '500L' | '600L'
  description?: string;
}

export interface OOUDepartment {
  id: string;
  name: string;
  facultyId: string;
  facultyName: string;
  campus: string; // 'Ago-Iwoye Main (PS)' | 'Sagamu Health Sciences' | 'Ibogun Engineering' | 'Ayetoro Agriculture'
  levels: string[];
  coreCourses: OOUCourse[];
}

export interface OOUFaculty {
  id: string;
  name: string;
  shortCode: string;
  campus: string;
  departments: string[];
}

export const OOU_FACULTIES: OOUFaculty[] = [
  {
    id: 'fac_sms',
    name: 'Faculty of Administration & Management Sciences',
    shortCode: 'SMS',
    campus: 'Ago-Iwoye Main (PS)',
    departments: ['Economics', 'Accounting', 'Banking & Finance', 'Business Administration', 'Public Administration', 'Mass Communication', 'Transport Management'],
  },
  {
    id: 'fac_law',
    name: 'Faculty of Law',
    shortCode: 'LAW',
    campus: 'Ago-Iwoye Main (PS)',
    departments: ['Public Law', 'Private & Commercial Law', 'Jurisprudence & International Law', 'Business Law'],
  },
  {
    id: 'fac_arts',
    name: 'Faculty of Arts',
    shortCode: 'ARTS',
    campus: 'Ago-Iwoye Main (PS)',
    departments: ['English & Literary Studies', 'History & Diplomatic Studies', 'Philosophy', 'Religious Studies', 'Linguistics & Nigerian Languages', 'Performing Arts'],
  },
  {
    id: 'fac_sci',
    name: 'Faculty of Science',
    shortCode: 'SCI',
    campus: 'Ago-Iwoye Main (PS)',
    departments: ['Computer Science', 'Microbiology', 'Biochemistry', 'Mathematics', 'Physics', 'Industrial Chemistry', 'Geology', 'Plant Science', 'Zoology & Environmental Biology'],
  },
  {
    id: 'fac_soc',
    name: 'Faculty of Social Sciences',
    shortCode: 'SOC',
    campus: 'Ago-Iwoye Main (PS)',
    departments: ['Political Science', 'Sociology', 'Psychology', 'Geography & Regional Planning'],
  },
  {
    id: 'fac_edu',
    name: 'Faculty of Education',
    shortCode: 'EDU',
    campus: 'Ago-Iwoye Main (PS)',
    departments: ['Educational Management', 'Guidance & Counseling', 'Science & Technology Education', 'Arts & Social Science Education', 'Human Kinetics & Health Education'],
  },
  {
    id: 'fac_bms',
    name: 'Faculty of Basic Medical Sciences',
    shortCode: 'BMS',
    campus: 'Sagamu Health Sciences',
    departments: ['Human Anatomy', 'Medical Physiology', 'Medical Laboratory Science', 'Pharmacology'],
  },
  {
    id: 'fac_clin',
    name: 'Faculty of Clinical Sciences (OACHS)',
    shortCode: 'CLIN',
    campus: 'Sagamu Health Sciences',
    departments: ['Medicine & Surgery (MBBS)', 'Nursing Science', 'Community Medicine'],
  },
  {
    id: 'fac_pharm',
    name: 'Faculty of Pharmacy',
    shortCode: 'PHARM',
    campus: 'Sagamu Health Sciences',
    departments: ['Pharmacy (B.Pharm)', 'Clinical Pharmacy', 'Pharmaceutical Chemistry', 'Pharmaceutics'],
  },
  {
    id: 'fac_eng',
    name: 'Faculty of Engineering & Environmental Technology',
    shortCode: 'ENG',
    campus: 'Ibogun Engineering Campus',
    departments: ['Computer Engineering', 'Electrical & Electronics Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Agricultural & Bio-Resources Engineering', 'Architecture', 'Urban & Regional Planning'],
  },
  {
    id: 'fac_agric',
    name: 'Faculty of Agricultural Sciences',
    shortCode: 'AGRIC',
    campus: 'Ayetoro Campus',
    departments: ['Agricultural Economics & Farm Management', 'Animal Production', 'Crop Production', 'Fisheries & Aquaculture', 'Forestry & Wildlife'],
  },
];

export const OOU_DEPARTMENTS_CATALOG: Record<string, OOUDepartment> = {
  Economics: {
    id: 'dept_eco',
    name: 'Economics',
    facultyId: 'fac_sms',
    facultyName: 'Administration & Management Sciences',
    campus: 'Ago-Iwoye Main (PS)',
    levels: ['100L', '200L', '300L', '400L'],
    coreCourses: [
      { code: 'ECO 101', title: 'Principles of Economics I (Micro)', units: 3, semester: 1, level: '100L' },
      { code: 'ECO 102', title: 'Principles of Economics II (Macro)', units: 3, semester: 2, level: '100L' },
      { code: 'ECO 201', title: 'Microeconomic Theory I (Consumer & Firm Behavior)', units: 3, semester: 1, level: '200L' },
      { code: 'ECO 203', title: 'Macroeconomic Theory I (National Income Determination)', units: 3, semester: 1, level: '200L' },
      { code: 'ECO 205', title: 'Mathematics for Economists I', units: 3, semester: 1, level: '200L' },
      { code: 'ECO 202', title: 'Microeconomic Theory II (Oligopoly & General Equilibrium)', units: 3, semester: 2, level: '200L' },
      { code: 'ECO 301', title: 'Advanced Microeconomics', units: 3, semester: 1, level: '300L' },
      { code: 'ECO 303', title: 'Introductory Econometrics I', units: 3, semester: 1, level: '300L' },
      { code: 'ECO 401', title: 'Advanced Macroeconomic Analysis', units: 3, semester: 1, level: '400L' },
      { code: 'ECO 405', title: 'Public Sector Economics & Policy', units: 3, semester: 1, level: '400L' },
    ],
  },
  Accounting: {
    id: 'dept_acc',
    name: 'Accounting',
    facultyId: 'fac_sms',
    facultyName: 'Administration & Management Sciences',
    campus: 'Ago-Iwoye Main (PS)',
    levels: ['100L', '200L', '300L', '400L'],
    coreCourses: [
      { code: 'ACC 101', title: 'Principles of Financial Accounting I', units: 3, semester: 1, level: '100L' },
      { code: 'ACC 201', title: 'Financial Accounting I (Partnership & Incomplete Records)', units: 3, semester: 1, level: '200L' },
      { code: 'ACC 205', title: 'Cost Accounting Fundamentals', units: 3, semester: 1, level: '200L' },
      { code: 'ACC 301', title: 'Intermediate Financial Accounting I', units: 3, semester: 1, level: '300L' },
      { code: 'ACC 303', title: 'Management Accounting I', units: 3, semester: 1, level: '300L' },
      { code: 'ACC 401', title: 'Auditing & Investigation Principles', units: 3, semester: 1, level: '400L' },
      { code: 'ACC 403', title: 'Taxation Law & Practice in Nigeria', units: 3, semester: 1, level: '400L' },
    ],
  },
  'Computer Science': {
    id: 'dept_csc',
    name: 'Computer Science',
    facultyId: 'fac_sci',
    facultyName: 'Science',
    campus: 'Ago-Iwoye Main (PS)',
    levels: ['100L', '200L', '300L', '400L'],
    coreCourses: [
      { code: 'CSC 101', title: 'Introduction to Computer Science & Computing', units: 3, semester: 1, level: '100L' },
      { code: 'CSC 201', title: 'Computer Programming I (Structured & Object-Oriented)', units: 3, semester: 1, level: '200L' },
      { code: 'CSC 205', title: 'Operating Systems Principles & Architecture', units: 3, semester: 1, level: '200L' },
      { code: 'CSC 301', title: 'Data Structures & Algorithms', units: 3, semester: 1, level: '300L' },
      { code: 'CSC 305', title: 'Database Design & Management Systems (DBMS)', units: 3, semester: 1, level: '300L' },
      { code: 'CSC 401', title: 'Artificial Intelligence & Machine Learning', units: 3, semester: 1, level: '400L' },
      { code: 'CSC 403', title: 'Software Engineering Methodologies', units: 3, semester: 1, level: '400L' },
    ],
  },
  Law: {
    id: 'dept_law',
    name: 'Law',
    facultyId: 'fac_law',
    facultyName: 'Law',
    campus: 'Ago-Iwoye Main (PS)',
    levels: ['100L', '200L', '300L', '400L', '500L'],
    coreCourses: [
      { code: 'PUL 101', title: 'Legal Method I & Nigerian Legal System', units: 4, semester: 1, level: '100L' },
      { code: 'PUL 201', title: 'Constitutional Law I (Rule of Law & Separation of Powers)', units: 4, semester: 1, level: '200L' },
      { code: 'PRL 201', title: 'Law of Contract I (Formation, Consideration & Legality)', units: 4, semester: 1, level: '200L' },
      { code: 'PUL 301', title: 'Criminal Law I (General Principles of Criminal Liability)', units: 4, semester: 1, level: '300L' },
      { code: 'PRL 301', title: 'Commercial Law I (Agency, Sale of Goods, Hire Purchase)', units: 4, semester: 1, level: '300L' },
      { code: 'PRL 401', title: 'Land Law I (Customary Land Tenure & Land Use Act)', units: 4, semester: 1, level: '400L' },
      { code: 'JIL 501', title: 'Jurisprudence & Legal Theory', units: 4, semester: 1, level: '500L' },
      { code: 'PUL 501', title: 'Company Law & Corporate Governance', units: 4, semester: 1, level: '500L' },
    ],
  },
  'Medicine & Surgery (MBBS)': {
    id: 'dept_mbbs',
    name: 'Medicine & Surgery (MBBS)',
    facultyId: 'fac_clin',
    facultyName: 'Clinical Sciences (OACHS)',
    campus: 'Sagamu Health Sciences',
    levels: ['100L', '200L', '300L', '400L', '500L', '600L'],
    coreCourses: [
      { code: 'CHM 101', title: 'General Physical & Inorganic Chemistry for Pre-Med', units: 3, semester: 1, level: '100L' },
      { code: 'ANA 201', title: 'Gross Anatomy I (Upper & Lower Extremities)', units: 4, semester: 1, level: '200L' },
      { code: 'PHS 201', title: 'Human Physiology I (Cardiovascular & Respiration)', units: 4, semester: 1, level: '200L' },
      { code: 'BCH 201', title: 'Medical Biochemistry I (Enzymology & Metabolism)', units: 3, semester: 1, level: '200L' },
      { code: 'PAT 301', title: 'General Pathology & Morbid Anatomy', units: 4, semester: 1, level: '300L' },
      { code: 'PHA 301', title: 'Systemic Pharmacology & Toxicology', units: 4, semester: 1, level: '300L' },
      { code: 'MED 401', title: 'Clinical Clerkship: Internal Medicine I', units: 6, semester: 1, level: '400L' },
      { code: 'SUR 501', title: 'General Surgery & Sub-Specialties', units: 6, semester: 1, level: '500L' },
      { code: 'OBS 601', title: 'Obstetrics & Gynaecology Comprehensive Rotation', units: 6, semester: 1, level: '600L' },
    ],
  },
  Biochemistry: {
    id: 'dept_bch',
    name: 'Biochemistry',
    facultyId: 'fac_sci',
    facultyName: 'Science',
    campus: 'Ago-Iwoye Main (PS)',
    levels: ['100L', '200L', '300L', '400L'],
    coreCourses: [
      { code: 'CHM 101', title: 'General Chemistry I', units: 3, semester: 1, level: '100L' },
      { code: 'BCH 201', title: 'General Biochemistry I (Biomolecules & Proteins)', units: 3, semester: 1, level: '200L' },
      { code: 'BCH 203', title: 'Chemistry of Carbohydrates & Lipids', units: 2, semester: 1, level: '200L' },
      { code: 'BCH 301', title: 'Enzymology & Kinetics', units: 3, semester: 1, level: '300L' },
      { code: 'BCH 303', title: 'Bioenergetics & Metabolic Pathways', units: 3, semester: 1, level: '300L' },
      { code: 'BCH 401', title: 'Advanced Molecular Biology & Genetic Engineering', units: 3, semester: 1, level: '400L' },
    ],
  },
  Microbiology: {
    id: 'dept_mcb',
    name: 'Microbiology',
    facultyId: 'fac_sci',
    facultyName: 'Science',
    campus: 'Ago-Iwoye Main (PS)',
    levels: ['100L', '200L', '300L', '400L'],
    coreCourses: [
      { code: 'BIO 101', title: 'General Biology I (Cell Biology & Diversity)', units: 3, semester: 1, level: '100L' },
      { code: 'MCB 201', title: 'General Microbiology I', units: 3, semester: 1, level: '200L' },
      { code: 'MCB 301', title: 'Bacteriology & Mycology', units: 3, semester: 1, level: '300L' },
      { code: 'MCB 303', title: 'Immunology & Immunochemistry', units: 3, semester: 1, level: '300L' },
      { code: 'MCB 401', title: 'Pathogenic & Medical Microbiology', units: 3, semester: 1, level: '400L' },
    ],
  },
  'Mass Communication': {
    id: 'dept_mas',
    name: 'Mass Communication',
    facultyId: 'fac_sms',
    facultyName: 'Administration & Management Sciences',
    campus: 'Ago-Iwoye Main (PS)',
    levels: ['100L', '200L', '300L', '400L'],
    coreCourses: [
      { code: 'MAS 101', title: 'Introduction to Mass Communication & Media History', units: 3, semester: 1, level: '100L' },
      { code: 'MAS 201', title: 'News Writing & Reporting I', units: 3, semester: 1, level: '200L' },
      { code: 'MAS 203', title: 'Media Law & Ethics in Nigeria', units: 3, semester: 1, level: '200L' },
      { code: 'MAS 301', title: 'Broadcast Production & Programming', units: 3, semester: 1, level: '300L' },
      { code: 'MAS 401', title: 'Public Relations & Advertising Strategy', units: 3, semester: 1, level: '400L' },
    ],
  },
  'Political Science': {
    id: 'dept_pol',
    name: 'Political Science',
    facultyId: 'fac_soc',
    facultyName: 'Social Sciences',
    campus: 'Ago-Iwoye Main (PS)',
    levels: ['100L', '200L', '300L', '400L'],
    coreCourses: [
      { code: 'POL 101', title: 'Introduction to Political Science', units: 3, semester: 1, level: '100L' },
      { code: 'POL 201', title: 'Nigerian Constitutional Development & Government', units: 3, semester: 1, level: '200L' },
      { code: 'POL 301', title: 'Political Thought & Ideologies (Western & African)', units: 3, semester: 1, level: '300L' },
      { code: 'POL 401', title: 'International Relations & Global Geopolitics', units: 3, semester: 1, level: '400L' },
    ],
  },
  'Mechanical Engineering': {
    id: 'dept_mee',
    name: 'Mechanical Engineering',
    facultyId: 'fac_eng',
    facultyName: 'Engineering & Environmental Technology',
    campus: 'Ibogun Engineering Campus',
    levels: ['100L', '200L', '300L', '400L', '500L'],
    coreCourses: [
      { code: 'ENG 101', title: 'Engineering Mathematics I', units: 3, semester: 1, level: '100L' },
      { code: 'MEE 201', title: 'Engineering Mechanics (Statics & Dynamics)', units: 3, semester: 1, level: '200L' },
      { code: 'MEE 301', title: 'Thermodynamics & Heat Transfer I', units: 3, semester: 1, level: '300L' },
      { code: 'MEE 401', title: 'Fluid Mechanics & Turbomachinery', units: 3, semester: 1, level: '400L' },
      { code: 'MEE 501', title: 'Automotive Engineering & Machine Design', units: 3, semester: 1, level: '500L' },
    ],
  },
  'Pharmacy (B.Pharm)': {
    id: 'dept_pharm',
    name: 'Pharmacy (B.Pharm)',
    facultyId: 'fac_pharm',
    facultyName: 'Pharmacy',
    campus: 'Sagamu Health Sciences',
    levels: ['100L', '200L', '300L', '400L', '500L'],
    coreCourses: [
      { code: 'PCH 201', title: 'Pharmaceutical Organic Chemistry I', units: 3, semester: 1, level: '200L' },
      { code: 'PCT 301', title: 'Pharmaceutics & Dosage Form Technology', units: 4, semester: 1, level: '300L' },
      { code: 'PCL 401', title: 'Clinical Pharmacokinetics & Therapeutics', units: 4, semester: 1, level: '400L' },
      { code: 'PCG 501', title: 'Pharmacognosy & Traditional Medicine Formulations', units: 3, semester: 1, level: '500L' },
    ],
  },
};

// All available OOU Department names as an array
export const ALL_OOU_DEPARTMENTS: string[] = [
  'Economics',
  'Accounting',
  'Computer Science',
  'Law',
  'Medicine & Surgery (MBBS)',
  'Biochemistry',
  'Microbiology',
  'Mass Communication',
  'Political Science',
  'Mechanical Engineering',
  'Pharmacy (B.Pharm)',
  'Banking & Finance',
  'Business Administration',
  'Public Administration',
  'Nursing Science',
  'Civil Engineering',
  'Electrical & Electronics Engineering',
  'Agricultural Economics',
  'Sociology',
  'English & Literary Studies',
  'History & Diplomatic Studies',
  'Philosophy',
  'Mathematics',
  'Physics',
  'Human Anatomy',
  'Medical Physiology',
];

export function getCoursesForDepartmentAndLevel(deptName: string, level: string): OOUCourse[] {
  const dept = OOU_DEPARTMENTS_CATALOG[deptName];
  if (!dept) {
    // Fallback general OOU courses
    return [
      { code: 'GNS 101', title: 'Use of English & Communication Skills', units: 2, semester: 1, level },
      { code: 'GNS 201', title: 'Nigerian Peoples, Culture & Heritage', units: 2, semester: 1, level },
    ];
  }
  const filtered = dept.coreCourses.filter((c) => c.level === level);
  if (filtered.length === 0) {
    return dept.coreCourses.slice(0, 3);
  }
  return filtered;
}
