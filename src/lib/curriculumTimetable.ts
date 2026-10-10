import { TimetableItem, AttendanceLog } from './types';

export interface CurriculumCourse {
  code: string;
  title: string;
  units: number;
  level: string;
  semester: 1 | 2;
  faculty: string;
  category: 'core' | 'required' | 'gst' | 'elective';
}

export interface AttendanceCourseSummary {
  courseCode: string;
  courseTitle: string;
  attendedCount: number;
  expectedSessions: number;
  attendanceRate: number; // 0 - 100
  isExamEligible: boolean; // >= 75% standard
  missingSessions: number;
  projectedCaScore: number; // out of 30
}

export interface StudentAttendanceBrief {
  totalAttended: number;
  totalExpected: number;
  overallAttendanceRate: number; // 0 - 100
  examReadinessStatus: 'Cleared (First-Class Track)' | 'Good Standing' | 'Borderline Alert' | 'Deficit Warning';
  projectedCaScore: number; // out of 30
  projectedExamScore: number; // out of 70
  projectedTotalScore: number; // out of 100
  projectedGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  courses: AttendanceCourseSummary[];
  attendanceAdvice: string;
}

// Landmark venues per Nigerian University
export const UNIVERSITY_VENUES: Record<string, { halls: string[]; labs: string[]; auditoriums: string[] }> = {
  OOU: {
    halls: ['SMS Lecture Theatre (SLR 1)', 'Law Lecture Theatre 1 (LLT 1)', 'Law Lecture Theatre 2 (LLT 2)', 'Law Lecture Theatre 3 (LLT 3 - Motion Ground)', 'Economics Hall (ECO-H1)'],
    labs: ['ETF Complex Science Lab', 'ICT Centre CBT Lab', 'Faculty of Science Lab 2'],
    auditoriums: ['Otunba Gbenga Daniel (OGD) Hall', 'Mass Communication Hall', 'New Motion Arena'],
  },
  UNILAG: {
    halls: ['Julius Berger Lecture Theatre', 'Faculty of Social Sciences (FSS) LT', 'Law Annexe Hall 3', 'Engineering Lecture Theatre (ELT)', 'Distance Learning Institute (DLI) LT'],
    labs: ['Science Complex Chemistry Lab', 'CITS Computer Laboratory', 'Faculty of Engineering Central Workshop'],
    auditoriums: ['Jelili Omotola (Multipurpose) Hall', 'Afe Babalola Auditorium', 'Main Auditorium (UNILAG Lagoon Front)'],
  },
  UI: {
    halls: ['Large Lecture Theatre (LLT Faculty of Science)', 'CBN Lecture Theatre', 'Faculty of Arts Lecture Room 32', 'Faculty of Social Sciences LT', 'Faculty of Education Large Hall'],
    labs: ['Kenneth Dike Computing Centre', 'Chemistry Central Research Lab', 'Zoology Practical Lab'],
    auditoriums: ['Trenchard Hall', 'International Conference Centre (ICC)', 'Gamaliel Onosode Auditorium'],
  },
  OAU: {
    halls: ['Spider Building Lecture Hall', 'Biological Sciences (BOOC) Hall', 'Yellow House Lecture Room', 'White House LT', 'Chemical Engineering LT', 'FSS Lecture Theatre'],
    labs: ['Computer Buildings Lab A', 'Physics Practical Laboratories', 'Natural History Museum Science Lab'],
    auditoriums: ['Oduduwa Hall', 'Motion Ground Open Pavilion', 'Amphi-Theatre OAU'],
  },
  LASU: {
    halls: ['3-in-1 Lecture Theatre', 'MBA Complex Hall 1', 'Faculty of Science Lecture Theatre', 'Faculty of Arts LT', 'Faculty of Law Lecture Room B'],
    labs: ['LASU ICT Centre CBT Hall', 'Biological Sciences Laboratory', 'Engineering Workshop Ojo'],
    auditoriums: ['Buba Marwa Auditorium', 'FSS Central Auditorium', 'University Library Complex'],
  },
  FUTA: {
    halls: ['ETF Lecture Theatre', 'Obanla 2-in-1 Hall', 'School of Engineering & Engineering Tech (SEET) LT', 'School of Sciences (SOS) Lecture Theatre', 'School of Earth & Mineral Sciences LT'],
    labs: ['Computer Resource Centre (CRC)', 'Mechanical Engineering CAD Lab', 'School of Agriculture Farm Lab'],
    auditoriums: ['Hilltop Auditorium', 'Obakekere Multipurpose Hall', 'FUTA North Gate Arena'],
  },
  ABU: {
    halls: ['Ribadu Lecture Hall', 'Social Science Lecture Theatre', 'Faculty of Science LT Samaru', 'Faculty of Arts Room 14', 'Engineering Complex Hall C'],
    labs: ['Iya Abubakar Computer Centre', 'Agricultural Research Institute Lab', 'Civil Engineering Hydraulics Lab'],
    auditoriums: ['Assembly Hall ABU Samaru', 'Kashim Ibrahim Library Auditorium', 'Gymnasium Sports Hall'],
  },
  BUK: {
    halls: ['Twin Lecture Theatre (New Campus)', 'Faculty of Computer Science & IT LT', 'SMS Lecture Complex New Campus', 'Faculty of Law LT', 'Faculty of Arts Old Campus'],
    labs: ['Centre for Information Technology (CIT) Lab', 'Physical Sciences Lab', 'Biological Sciences Lab'],
    auditoriums: ['Convocation Arena New Campus', 'Attahiru Jega Auditorium', 'Old Campus Theatre'],
  },
  UNN: {
    halls: ['Carver Building Lecture Hall', 'Faculty of Social Sciences Large LT', 'Faculty of Arts Room 1', 'Engineering Lecture Theatre Nsukka', 'Faculty of Physical Sciences LT'],
    labs: ['Nnamdi Azikiwe Computing Centre', 'Science Practical Complex', 'Pharmaceutical Sciences Lab'],
    auditoriums: ['Princess Alexandra Auditorium (PAA)', 'Nnamdi Azikiwe Library Amphitheatre', 'Margret Ekpo Refectory Hall'],
  },
  DEFAULT: {
    halls: ['Campus Central Lecture Theatre (CLT 1)', 'Faculty Lecture Room A', 'Faculty Lecture Room B', 'Departmental Seminar Hall', 'Management Sciences Complex'],
    labs: ['Central ICT Computing Laboratory', 'Faculty Practical Science Lab', 'E-Learning CBT Center'],
    auditoriums: ['University Main Auditorium', 'ETF Multi-Purpose Hall', 'Senate Building Amphitheatre'],
  },
};

// General Studies (GST / GNS) under NUC CCMAS (applicable to all Nigerian universities)
export const NUC_CCMAS_GST_COURSES: Record<string, CurriculumCourse[]> = {
  '100L': [
    { code: 'GST 111', title: 'Communication in English', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
    { code: 'GST 112', title: 'Nigerian Peoples and Culture', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
    { code: 'GST 113', title: 'Basic Digital Skills & Information Literacy', units: 2, level: '100L', semester: 2, faculty: 'General Studies', category: 'gst' },
  ],
  '200L': [
    { code: 'GST 212', title: 'Philosophy, Logic and Human Values', units: 2, level: '200L', semester: 1, faculty: 'General Studies', category: 'gst' },
    { code: 'GST 222', title: 'Peace Studies and Conflict Resolution', units: 2, level: '200L', semester: 2, faculty: 'General Studies', category: 'gst' },
  ],
  '300L': [
    { code: 'GST 311', title: 'Entrepreneurship and Innovation', units: 2, level: '300L', semester: 1, faculty: 'General Studies', category: 'gst' },
  ],
  '400L': [
    { code: 'GST 411', title: 'Venture Creation and Business Development', units: 2, level: '400L', semester: 1, faculty: 'General Studies', category: 'gst' },
  ],
};

// Departmental Curriculum Database for Common Disciplines across 100L-400L
export const NUC_DEPARTMENT_CURRICULA: Record<string, Record<string, CurriculumCourse[]>> = {
  'Computer Science': {
    '100L': [
      { code: 'COS 101', title: 'Introduction to Computing Sciences', units: 3, level: '100L', semester: 1, faculty: 'Computing', category: 'core' },
      { code: 'MTH 101', title: 'Elementary Mathematics I (Algebra & Trigonometry)', units: 3, level: '100L', semester: 1, faculty: 'Science', category: 'required' },
      { code: 'PHY 101', title: 'General Physics I (Mechanics & Properties of Matter)', units: 3, level: '100L', semester: 1, faculty: 'Science', category: 'required' },
      { code: 'GST 111', title: 'Communication in English', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'GST 112', title: 'Nigerian Peoples and Culture', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'PHY 107', title: 'General Physics Laboratory I', units: 1, level: '100L', semester: 1, faculty: 'Science', category: 'required' },
    ],
    '200L': [
      { code: 'CSC 201', title: 'Computer Programming I (Structured & Python)', units: 3, level: '200L', semester: 1, faculty: 'Computing', category: 'core' },
      { code: 'CSC 203', title: 'Foundations of Sequential Program Design', units: 3, level: '200L', semester: 1, faculty: 'Computing', category: 'core' },
      { code: 'CSC 205', title: 'Discrete Mathematical Structures', units: 2, level: '200L', semester: 1, faculty: 'Computing', category: 'core' },
      { code: 'GST 212', title: 'Philosophy, Logic and Human Values', units: 2, level: '200L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'MTH 201', title: 'Mathematical Analysis I', units: 3, level: '200L', semester: 1, faculty: 'Science', category: 'required' },
      { code: 'STA 201', title: 'Probability and Statistics for Computing', units: 2, level: '200L', semester: 1, faculty: 'Science', category: 'required' },
    ],
    '300L': [
      { code: 'CSC 301', title: 'Data Structures and Algorithms', units: 3, level: '300L', semester: 1, faculty: 'Computing', category: 'core' },
      { code: 'CSC 303', title: 'Operating Systems & Concurrency', units: 3, level: '300L', semester: 1, faculty: 'Computing', category: 'core' },
      { code: 'CSC 305', title: 'Database Systems Design & SQL', units: 3, level: '300L', semester: 1, faculty: 'Computing', category: 'core' },
      { code: 'CSC 307', title: 'Computer Networks and Data Communication', units: 3, level: '300L', semester: 1, faculty: 'Computing', category: 'core' },
      { code: 'GST 311', title: 'Entrepreneurship and Innovation', units: 2, level: '300L', semester: 1, faculty: 'General Studies', category: 'gst' },
    ],
    '400L': [
      { code: 'CSC 401', title: 'Software Engineering Principles', units: 3, level: '400L', semester: 1, faculty: 'Computing', category: 'core' },
      { code: 'CSC 403', title: 'Artificial Intelligence & Machine Learning', units: 3, level: '400L', semester: 1, faculty: 'Computing', category: 'core' },
      { code: 'CSC 405', title: 'Compiler Construction and Automata Theory', units: 3, level: '400L', semester: 1, faculty: 'Computing', category: 'core' },
      { code: 'CSC 499', title: 'Final Year Capstone Research Project', units: 6, level: '400L', semester: 1, faculty: 'Computing', category: 'core' },
    ],
  },
  'Economics': {
    '100L': [
      { code: 'ECO 101', title: 'Principles of Economics I (Microeconomics)', units: 3, level: '100L', semester: 1, faculty: 'Social Sciences', category: 'core' },
      { code: 'MTH 105', title: 'Mathematics for Social Sciences I', units: 3, level: '100L', semester: 1, faculty: 'Science', category: 'required' },
      { code: 'POL 101', title: 'Introduction to Political Science', units: 2, level: '100L', semester: 1, faculty: 'Social Sciences', category: 'elective' },
      { code: 'GST 111', title: 'Communication in English', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'GST 112', title: 'Nigerian Peoples and Culture', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'SOC 101', title: 'Introduction to Sociology', units: 2, level: '100L', semester: 1, faculty: 'Social Sciences', category: 'elective' },
    ],
    '200L': [
      { code: 'ECO 201', title: 'Principles of Microeconomics II', units: 3, level: '200L', semester: 1, faculty: 'Social Sciences', category: 'core' },
      { code: 'ECO 203', title: 'Applied Statistics for Economists', units: 3, level: '200L', semester: 1, faculty: 'Social Sciences', category: 'core' },
      { code: 'ECO 205', title: 'Mathematics for Economists I', units: 3, level: '200L', semester: 1, faculty: 'Social Sciences', category: 'core' },
      { code: 'ACC 201', title: 'Introduction to Financial Accounting', units: 2, level: '200L', semester: 1, faculty: 'Social Sciences', category: 'required' },
      { code: 'GST 212', title: 'Philosophy, Logic and Human Values', units: 2, level: '200L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'ECO 209', title: 'Structure of the Nigerian Economy', units: 2, level: '200L', semester: 1, faculty: 'Social Sciences', category: 'core' },
    ],
    '300L': [
      { code: 'ECO 301', title: 'Intermediate Microeconomic Theory', units: 3, level: '300L', semester: 1, faculty: 'Social Sciences', category: 'core' },
      { code: 'ECO 303', title: 'Intermediate Macroeconomic Theory', units: 3, level: '300L', semester: 1, faculty: 'Social Sciences', category: 'core' },
      { code: 'ECO 305', title: 'Introductory Econometrics', units: 3, level: '300L', semester: 1, faculty: 'Social Sciences', category: 'core' },
      { code: 'ECO 307', title: 'Public Sector Economics', units: 2, level: '300L', semester: 1, faculty: 'Social Sciences', category: 'core' },
      { code: 'GST 311', title: 'Entrepreneurship and Innovation', units: 2, level: '300L', semester: 1, faculty: 'General Studies', category: 'gst' },
    ],
    '400L': [
      { code: 'ECO 401', title: 'Advanced Microeconomics', units: 3, level: '400L', semester: 1, faculty: 'Social Sciences', category: 'core' },
      { code: 'ECO 403', title: 'Advanced Macroeconomics', units: 3, level: '400L', semester: 1, faculty: 'Social Sciences', category: 'core' },
      { code: 'ECO 405', title: 'Applied Econometrics & Forecasting', units: 3, level: '400L', semester: 1, faculty: 'Social Sciences', category: 'core' },
      { code: 'ECO 499', title: 'Research Project', units: 6, level: '400L', semester: 1, faculty: 'Social Sciences', category: 'core' },
    ],
  },
  'Law': {
    '100L': [
      { code: 'LAW 101', title: 'Legal Method I', units: 4, level: '100L', semester: 1, faculty: 'Law', category: 'core' },
      { code: 'GST 111', title: 'Communication in English', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'GST 112', title: 'Nigerian Peoples and Culture', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'POL 101', title: 'Introduction to Political Science', units: 3, level: '100L', semester: 1, faculty: 'Social Sciences', category: 'required' },
      { code: 'SOC 101', title: 'Introduction to Sociology', units: 3, level: '100L', semester: 1, faculty: 'Social Sciences', category: 'elective' },
    ],
    '200L': [
      { code: 'PUL 201', title: 'Constitutional Law I', units: 4, level: '200L', semester: 1, faculty: 'Law', category: 'core' },
      { code: 'CIL 201', title: 'Law of Contract I', units: 4, level: '200L', semester: 1, faculty: 'Law', category: 'core' },
      { code: 'PUL 203', title: 'Nigerian Legal System I', units: 4, level: '200L', semester: 1, faculty: 'Law', category: 'core' },
      { code: 'GST 212', title: 'Philosophy, Logic and Human Values', units: 2, level: '200L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'CIL 205', title: 'Labour Law I', units: 3, level: '200L', semester: 1, faculty: 'Law', category: 'elective' },
    ],
    '300L': [
      { code: 'PUL 301', title: 'Criminal Law I', units: 4, level: '300L', semester: 1, faculty: 'Law', category: 'core' },
      { code: 'CIL 301', title: 'Law of Torts I', units: 4, level: '300L', semester: 1, faculty: 'Law', category: 'core' },
      { code: 'CIL 303', title: 'Commercial Law I', units: 4, level: '300L', semester: 1, faculty: 'Law', category: 'core' },
      { code: 'GST 311', title: 'Entrepreneurship and Innovation', units: 2, level: '300L', semester: 1, faculty: 'General Studies', category: 'gst' },
    ],
    '400L': [
      { code: 'PUL 401', title: 'Land Law I (Property Law)', units: 4, level: '400L', semester: 1, faculty: 'Law', category: 'core' },
      { code: 'CIL 401', title: 'Equity and Trusts I', units: 4, level: '400L', semester: 1, faculty: 'Law', category: 'core' },
      { code: 'PUL 403', title: 'Law of Evidence I', units: 4, level: '400L', semester: 1, faculty: 'Law', category: 'core' },
      { code: 'JIL 401', title: 'Jurisprudence & Legal Theory I', units: 3, level: '400L', semester: 1, faculty: 'Law', category: 'core' },
    ],
  },
  'Accounting': {
    '100L': [
      { code: 'ACC 101', title: 'Introduction to Financial Accounting I', units: 3, level: '100L', semester: 1, faculty: 'Administration', category: 'core' },
      { code: 'BUS 101', title: 'Introduction to Business Administration', units: 3, level: '100L', semester: 1, faculty: 'Administration', category: 'core' },
      { code: 'ECO 101', title: 'Principles of Economics I', units: 3, level: '100L', semester: 1, faculty: 'Social Sciences', category: 'required' },
      { code: 'GST 111', title: 'Communication in English', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'GST 112', title: 'Nigerian Peoples and Culture', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
    ],
    '200L': [
      { code: 'ACC 201', title: 'Financial Accounting I', units: 3, level: '200L', semester: 1, faculty: 'Administration', category: 'core' },
      { code: 'ACC 203', title: 'Cost Accounting I', units: 3, level: '200L', semester: 1, faculty: 'Administration', category: 'core' },
      { code: 'BFN 201', title: 'Principles of Finance', units: 3, level: '200L', semester: 1, faculty: 'Administration', category: 'required' },
      { code: 'GST 212', title: 'Philosophy, Logic and Human Values', units: 2, level: '200L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'BUS 205', title: 'Business Statistics', units: 3, level: '200L', semester: 1, faculty: 'Administration', category: 'required' },
    ],
    '300L': [
      { code: 'ACC 301', title: 'Advanced Financial Accounting I', units: 3, level: '300L', semester: 1, faculty: 'Administration', category: 'core' },
      { code: 'ACC 303', title: 'Management Accounting I', units: 3, level: '300L', semester: 1, faculty: 'Administration', category: 'core' },
      { code: 'ACC 305', title: 'Auditing and Assurance I', units: 3, level: '300L', semester: 1, faculty: 'Administration', category: 'core' },
      { code: 'ACC 307', title: 'Taxation and Fiscal Policy I', units: 3, level: '300L', semester: 1, faculty: 'Administration', category: 'core' },
      { code: 'GST 311', title: 'Entrepreneurship and Innovation', units: 2, level: '300L', semester: 1, faculty: 'General Studies', category: 'gst' },
    ],
    '400L': [
      { code: 'ACC 401', title: 'Public Sector Accounting & Reporting', units: 3, level: '400L', semester: 1, faculty: 'Administration', category: 'core' },
      { code: 'ACC 403', title: 'International Accounting Standards', units: 3, level: '400L', semester: 1, faculty: 'Administration', category: 'core' },
      { code: 'ACC 405', title: 'Forensic Accounting & Fraud Examination', units: 3, level: '400L', semester: 1, faculty: 'Administration', category: 'core' },
      { code: 'ACC 499', title: 'Accounting Capstone Project', units: 6, level: '400L', semester: 1, faculty: 'Administration', category: 'core' },
    ],
  },
  'Mass Communication': {
    '100L': [
      { code: 'MAC 101', title: 'Introduction to Mass Communication', units: 3, level: '100L', semester: 1, faculty: 'Media Studies', category: 'core' },
      { code: 'MAC 103', title: 'African Communication Systems', units: 2, level: '100L', semester: 1, faculty: 'Media Studies', category: 'core' },
      { code: 'GST 111', title: 'Communication in English', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'GST 112', title: 'Nigerian Peoples and Culture', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'POL 101', title: 'Introduction to Political Science', units: 2, level: '100L', semester: 1, faculty: 'Social Sciences', category: 'elective' },
    ],
    '200L': [
      { code: 'MAC 201', title: 'News Writing and Reporting I', units: 3, level: '200L', semester: 1, faculty: 'Media Studies', category: 'core' },
      { code: 'MAC 203', title: 'Broadcast Production Techniques I', units: 3, level: '200L', semester: 1, faculty: 'Media Studies', category: 'core' },
      { code: 'MAC 205', title: 'Media Law and Ethics in Nigeria', units: 2, level: '200L', semester: 1, faculty: 'Media Studies', category: 'core' },
      { code: 'GST 212', title: 'Philosophy, Logic and Human Values', units: 2, level: '200L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'MAC 209', title: 'Photojournalism and Visual Storytelling', units: 2, level: '200L', semester: 1, faculty: 'Media Studies', category: 'core' },
    ],
    '300L': [
      { code: 'MAC 301', title: 'Investigative & Interpretative Journalism', units: 3, level: '300L', semester: 1, faculty: 'Media Studies', category: 'core' },
      { code: 'MAC 303', title: 'Public Relations Principles & Strategy', units: 3, level: '300L', semester: 1, faculty: 'Media Studies', category: 'core' },
      { code: 'MAC 305', title: 'Advertising Campaign Planning', units: 3, level: '300L', semester: 1, faculty: 'Media Studies', category: 'core' },
      { code: 'GST 311', title: 'Entrepreneurship and Innovation', units: 2, level: '300L', semester: 1, faculty: 'General Studies', category: 'gst' },
    ],
    '400L': [
      { code: 'MAC 401', title: 'International Communication & Diplomacy', units: 3, level: '400L', semester: 1, faculty: 'Media Studies', category: 'core' },
      { code: 'MAC 403', title: 'Media Management and Entrepreneurship', units: 3, level: '400L', semester: 1, faculty: 'Media Studies', category: 'core' },
      { code: 'MAC 499', title: 'Final Research Project & Media Portfolio', units: 6, level: '400L', semester: 1, faculty: 'Media Studies', category: 'core' },
    ],
  },
  'Mechanical Engineering': {
    '100L': [
      { code: 'ENG 101', title: 'Engineering Mathematics I', units: 3, level: '100L', semester: 1, faculty: 'Engineering', category: 'core' },
      { code: 'PHY 101', title: 'General Physics I', units: 3, level: '100L', semester: 1, faculty: 'Science', category: 'required' },
      { code: 'CHM 101', title: 'General Chemistry I', units: 3, level: '100L', semester: 1, faculty: 'Science', category: 'required' },
      { code: 'GST 111', title: 'Communication in English', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'GST 112', title: 'Nigerian Peoples and Culture', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
    ],
    '200L': [
      { code: 'MEG 201', title: 'Engineering Thermodynamics I', units: 3, level: '200L', semester: 1, faculty: 'Engineering', category: 'core' },
      { code: 'MEG 203', title: 'Engineering Mechanics (Statics & Dynamics)', units: 3, level: '200L', semester: 1, faculty: 'Engineering', category: 'core' },
      { code: 'ENG 201', title: 'Advanced Engineering Mathematics I', units: 3, level: '200L', semester: 1, faculty: 'Engineering', category: 'core' },
      { code: 'MEG 205', title: 'Engineering Drawing & CAD', units: 2, level: '200L', semester: 1, faculty: 'Engineering', category: 'core' },
      { code: 'GST 212', title: 'Philosophy, Logic and Human Values', units: 2, level: '200L', semester: 1, faculty: 'General Studies', category: 'gst' },
    ],
    '300L': [
      { code: 'MEG 301', title: 'Fluid Mechanics I', units: 3, level: '300L', semester: 1, faculty: 'Engineering', category: 'core' },
      { code: 'MEG 303', title: 'Mechanics of Machines I', units: 3, level: '300L', semester: 1, faculty: 'Engineering', category: 'core' },
      { code: 'MEG 305', title: 'Strength of Materials II', units: 3, level: '300L', semester: 1, faculty: 'Engineering', category: 'core' },
      { code: 'GST 311', title: 'Entrepreneurship and Innovation', units: 2, level: '300L', semester: 1, faculty: 'General Studies', category: 'gst' },
    ],
    '400L': [
      { code: 'MEG 401', title: 'Heat and Mass Transfer', units: 3, level: '400L', semester: 1, faculty: 'Engineering', category: 'core' },
      { code: 'MEG 403', title: 'Mechanical Engineering Design', units: 3, level: '400L', semester: 1, faculty: 'Engineering', category: 'core' },
      { code: 'MEG 405', title: 'Control Systems Engineering', units: 3, level: '400L', semester: 1, faculty: 'Engineering', category: 'core' },
    ],
  },
  'Biochemistry': {
    '100L': [
      { code: 'CHM 101', title: 'General Chemistry I (Physical & Inorganic)', units: 3, level: '100L', semester: 1, faculty: 'Science', category: 'required' },
      { code: 'BIO 101', title: 'General Biology I (Cell Biology & Genetics)', units: 3, level: '100L', semester: 1, faculty: 'Science', category: 'required' },
      { code: 'PHY 101', title: 'General Physics I', units: 3, level: '100L', semester: 1, faculty: 'Science', category: 'required' },
      { code: 'GST 111', title: 'Communication in English', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
      { code: 'GST 112', title: 'Nigerian Peoples and Culture', units: 2, level: '100L', semester: 1, faculty: 'General Studies', category: 'gst' },
    ],
    '200L': [
      { code: 'BCH 201', title: 'General Biochemistry I (Biomolecules)', units: 3, level: '200L', semester: 1, faculty: 'Basic Medical', category: 'core' },
      { code: 'CHM 201', title: 'Organic Chemistry I (Functional Groups & Reactions)', units: 3, level: '200L', semester: 1, faculty: 'Science', category: 'required' },
      { code: 'MCB 201', title: 'General Microbiology I', units: 2, level: '200L', semester: 1, faculty: 'Science', category: 'required' },
      { code: 'BCH 203', title: 'Biochemical Experimental Techniques', units: 2, level: '200L', semester: 1, faculty: 'Basic Medical', category: 'core' },
      { code: 'GST 212', title: 'Philosophy, Logic and Human Values', units: 2, level: '200L', semester: 1, faculty: 'General Studies', category: 'gst' },
    ],
    '300L': [
      { code: 'BCH 301', title: 'Enzymology and Enzyme Kinetics', units: 3, level: '300L', semester: 1, faculty: 'Basic Medical', category: 'core' },
      { code: 'BCH 303', title: 'Metabolism of Carbohydrates & Lipids', units: 3, level: '300L', semester: 1, faculty: 'Basic Medical', category: 'core' },
      { code: 'BCH 305', title: 'Bioenergetics and Biological Oxidations', units: 2, level: '300L', semester: 1, faculty: 'Basic Medical', category: 'core' },
      { code: 'GST 311', title: 'Entrepreneurship and Innovation', units: 2, level: '300L', semester: 1, faculty: 'General Studies', category: 'gst' },
    ],
    '400L': [
      { code: 'BCH 401', title: 'Molecular Biology & Recombinant DNA', units: 3, level: '400L', semester: 1, faculty: 'Basic Medical', category: 'core' },
      { code: 'BCH 403', title: 'Biochemical Pharmacology & Toxicology', units: 3, level: '400L', semester: 1, faculty: 'Basic Medical', category: 'core' },
      { code: 'BCH 499', title: 'Research Project in Biochemistry', units: 6, level: '400L', semester: 1, faculty: 'Basic Medical', category: 'core' },
    ],
  },
};

// Realistic Lecturer Rosters for simulation
const LECTURER_ROSTER = [
  'Prof. A. B. Adeleke',
  'Dr. K. O. Balogun',
  'Dr. Mrs. N. E. Okonjo',
  'Dr. S. A. Danladi',
  'Prof. E. C. Eze',
  'Dr. F. A. Falana',
  'Mrs. T. M. Olutayo',
  'Dr. I. U. Mohammed',
  'Prof. C. K. Alabi',
  'Dr. O. J. Adelekan',
];

// Helper to resolve venue list based on institution name
export function getUniversityVenues(institution: string = 'OOU') {
  const norm = institution.toUpperCase();
  for (const [key, val] of Object.entries(UNIVERSITY_VENUES)) {
    if (norm.includes(key)) return val;
  }
  return UNIVERSITY_VENUES.DEFAULT;
}

// Generate Assumed Timetable for any student
export function generateAssumedTimetable(
  institution: string = 'OOU',
  department: string = 'Economics',
  level: string = '200L'
): TimetableItem[] {
  // If OOU Economics 200L, return canonical verified timetable
  const isOou = !institution || institution.toUpperCase().includes('OOU') || institution.toLowerCase().includes('olabisi');
  const isEconomics = department.toLowerCase().includes('econ');
  const is200L = level.includes('200');

  if (isOou && isEconomics && is200L) {
    return [
      {
        id: 'tt_oou_1',
        courseCode: 'ECO 201',
        courseTitle: 'Principles of Microeconomics II',
        lecturer: 'Dr. K. Balogun',
        day: 'Monday',
        time: '08:00 - 10:00',
        venueName: 'SMS Lecture Theatre (SLR 1)',
        locationId: 'loc-sms-lt1',
        department: 'Economics',
        level: '200L',
        isLiveNow: true,
      },
      {
        id: 'tt_oou_2',
        courseCode: 'ECO 203',
        courseTitle: 'Applied Statistics for Economists',
        lecturer: 'Prof. A. Adeleke',
        day: 'Monday',
        time: '11:00 - 13:00',
        venueName: 'ETF Complex Hall A',
        locationId: 'loc-etf-hall',
        department: 'Economics',
        level: '200L',
      },
      {
        id: 'tt_oou_3',
        courseCode: 'ACC 205',
        courseTitle: 'Management Accounting Principles',
        lecturer: 'Mrs. Olutayo',
        day: 'Tuesday',
        time: '09:00 - 11:00',
        venueName: 'Economics Departmental Hall (ECO-H1)',
        locationId: 'loc-eco-h1',
        department: 'Economics',
        level: '200L',
      },
      {
        id: 'tt_oou_4',
        courseCode: 'GNS 201',
        courseTitle: 'General Studies: Nigerian Culture & Society',
        lecturer: 'Dr. Falana',
        day: 'Wednesday',
        time: '10:00 - 12:00',
        venueName: 'Otunba Gbenga Daniel (OGD) Hall',
        locationId: 'loc-ogd-lt',
        department: 'General Studies',
        level: '200L',
      },
      {
        id: 'tt_oou_5',
        courseCode: 'ECO 207',
        courseTitle: 'Mathematics for Economists',
        lecturer: 'Dr. S. O. Ogundele',
        day: 'Thursday',
        time: '12:00 - 14:00',
        venueName: 'SMS Lecture Theatre (SLR 1)',
        locationId: 'loc-sms-lt1',
        department: 'Economics',
        level: '200L',
      },
      {
        id: 'tt_oou_6',
        courseCode: 'ECO 209',
        courseTitle: 'Structure of the Nigerian Economy',
        lecturer: 'Dr. M. A. Adelekan',
        day: 'Friday',
        time: '09:00 - 11:00',
        venueName: 'Law Lecture Theatre 1 (LLT 1)',
        locationId: 'loc-llt-1',
        department: 'Economics',
        level: '200L',
      },
    ];
  }

  // Find curriculum for student's department or fuzzy match
  const normalizedDept = Object.keys(NUC_DEPARTMENT_CURRICULA).find((k) =>
    department.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(department.toLowerCase())
  ) || 'Computer Science';

  const normalizedLevel = ['100L', '200L', '300L', '400L'].find((l) => level.includes(l.replace('L', ''))) || '200L';

  const deptCourses = NUC_DEPARTMENT_CURRICULA[normalizedDept]?.[normalizedLevel] ||
    NUC_DEPARTMENT_CURRICULA['Computer Science']['200L'];

  const venues = getUniversityVenues(institution);

  // Standard lecture schedule slots (Nigerian University timetable grid)
  const scheduleSlots: Array<{ day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'; time: string }> = [
    { day: 'Monday', time: '08:00 - 10:00' },
    { day: 'Monday', time: '11:00 - 13:00' },
    { day: 'Tuesday', time: '09:00 - 11:00' },
    { day: 'Wednesday', time: '10:00 - 12:00' },
    { day: 'Thursday', time: '12:00 - 14:00' },
    { day: 'Friday', time: '09:00 - 11:00' }, // Leaves Friday 13:00 - 14:00 clear for Juma'ah
  ];

  return deptCourses.slice(0, 6).map((course, idx) => {
    const slot = scheduleSlots[idx % scheduleSlots.length];
    const venueList = course.category === 'gst' ? venues.auditoriums : (course.title.toLowerCase().includes('lab') ? venues.labs : venues.halls);
    const venueName = venueList[idx % venueList.length] || venues.halls[0];
    const lecturer = LECTURER_ROSTER[idx % LECTURER_ROSTER.length];

    return {
      id: `tt_${institution.toLowerCase()}_${course.code.replace(/\s+/g, '_').toLowerCase()}`,
      courseCode: course.code,
      courseTitle: course.title,
      lecturer,
      day: slot.day,
      time: slot.time,
      venueName,
      locationId: `loc-${course.code.toLowerCase().replace(/\s+/g, '-')}`,
      department: normalizedDept,
      level: normalizedLevel,
      isLiveNow: idx === 0,
    };
  });
}

// Compute comprehensive attendance brief & projected exam/CA scores
export function computeStudentAttendanceBrief(
  logs: AttendanceLog[],
  timetable: TimetableItem[]
): StudentAttendanceBrief {
  // Assume a standard 12-week semester benchmark
  const WEEKS_IN_SEMESTER = 12;
  const EXPECTED_PER_COURSE = WEEKS_IN_SEMESTER; // 1 session per week scheduled

  const courseMap: Record<string, { count: number; title: string }> = {};

  // Initialize all courses from timetable
  timetable.forEach((item) => {
    if (!courseMap[item.courseCode]) {
      courseMap[item.courseCode] = { count: 0, title: item.courseTitle };
    }
  });

  // Count attendance logs
  logs.forEach((log) => {
    if (courseMap[log.course_code]) {
      courseMap[log.course_code].count += 1;
    } else {
      courseMap[log.course_code] = { count: 1, title: log.course_code };
    }
  });

  const courseKeys = Object.keys(courseMap);
  const totalCourses = Math.max(courseKeys.length, 1);
  const totalExpected = totalCourses * EXPECTED_PER_COURSE;
  let totalAttended = 0;

  const courses: AttendanceCourseSummary[] = courseKeys.map((code) => {
    const info = courseMap[code];
    const attendedCount = info.count;
    totalAttended += attendedCount;

    // Rate based on 12 expected semester lectures
    const attendanceRate = Math.min(100, Math.round((attendedCount / EXPECTED_PER_COURSE) * 100));
    const isExamEligible = attendanceRate >= 75; // NUC 75% rule
    const missingSessions = Math.max(0, Math.ceil(EXPECTED_PER_COURSE * 0.75) - attendedCount);

    // Continuous Assessment (CA) is out of 30 marks in Nigerian universities:
    // Attendance makes up 10 marks of CA, Active Participation 20 marks
    const attendanceMark = (attendanceRate / 100) * 10;
    const baseParticipationMark = Math.min(18, 10 + (attendedCount * 0.8));
    const projectedCaScore = Math.min(30, Math.round(attendanceMark + baseParticipationMark));

    return {
      courseCode: code,
      courseTitle: info.title,
      attendedCount,
      expectedSessions: EXPECTED_PER_COURSE,
      attendanceRate,
      isExamEligible,
      missingSessions,
      projectedCaScore,
    };
  });

  const overallAttendanceRate = Math.min(100, Math.round((totalAttended / totalExpected) * 100));

  // Projected CA score (average of all courses, max 30)
  const avgCaScore = courses.length > 0
    ? Math.round(courses.reduce((acc, c) => acc + c.projectedCaScore, 0) / courses.length)
    : 15;

  // Projected Exam Score (out of 70):
  // High attendance strongly correlates with exam retention and familiarity with lecturer question style
  const examFactor = 0.5 + (overallAttendanceRate / 200); // 0.5 to 1.0 multiplier
  const projectedExamScore = Math.min(70, Math.round(62 * examFactor)); // typical good student benchmark

  const projectedTotalScore = Math.min(100, avgCaScore + projectedExamScore);

  let projectedGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (projectedTotalScore >= 70) projectedGrade = 'A';
  else if (projectedTotalScore >= 60) projectedGrade = 'B';
  else if (projectedTotalScore >= 50) projectedGrade = 'C';
  else if (projectedTotalScore >= 45) projectedGrade = 'D';

  let examReadinessStatus: StudentAttendanceBrief['examReadinessStatus'] = 'Deficit Warning';
  if (overallAttendanceRate >= 75) examReadinessStatus = 'Cleared (First-Class Track)';
  else if (overallAttendanceRate >= 60) examReadinessStatus = 'Good Standing';
  else if (overallAttendanceRate >= 40) examReadinessStatus = 'Borderline Alert';

  let attendanceAdvice = '';
  if (overallAttendanceRate >= 75) {
    attendanceAdvice = `Phenomenal discipline! You have satisfied the statutory NUC 75% attendance threshold. Your projected CA mark is ${avgCaScore}/30 and projected total score is ${projectedTotalScore}% (${projectedGrade}). Keep your revision tight.`;
  } else if (overallAttendanceRate >= 50) {
    attendanceAdvice = `Steady trajectory (${overallAttendanceRate}% attendance). You need approximately 2 to 3 more consecutive class check-ins across your core courses to guarantee full exam clearance and push your projected grade into solid 'A' territory.`;
  } else {
    attendanceAdvice = `Attendance Alert: You currently have ${totalAttended} lecture check-ins (${overallAttendanceRate}%). To avoid being barred by the Faculty Board of Examiners under the 75% rule, ensure you log every upcoming lecture this week!`;
  }

  return {
    totalAttended,
    totalExpected,
    overallAttendanceRate,
    examReadinessStatus,
    projectedCaScore: avgCaScore,
    projectedExamScore,
    projectedTotalScore,
    projectedGrade,
    courses,
    attendanceAdvice,
  };
}

export const TIMETABLE_DATA = generateAssumedTimetable('OOU', 'Economics', '200L');
