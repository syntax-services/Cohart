export interface SemesterCourseGrade {
  courseCode: string;
  courseTitle?: string;
  units: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  score?: number;
}

export interface SemesterResult {
  semesterId: string; // e.g. '100L_S1', '100L_S2', '200L_S1'
  level: string;      // e.g. '100L'
  semester: 1 | 2;
  courses: SemesterCourseGrade[];
  gpa: number;
  totalUnits: number;
  totalGradePoints: number;
}

export interface CgpaReport {
  cgpa: number; // e.g. 4.12
  degreeClass: 'First Class Honours' | 'Second Class Honours (Upper Division)' | 'Second Class Honours (Lower Division)' | 'Third Class Honours' | 'Pass';
  totalCreditsAttempted: number;
  totalGradePoints: number;
  semesters: SemesterResult[];
  missingSemesters: string[];
  gradeDrivers: {
    boosters: string[]; // High-unit 'A' courses that raised the CGPA
    draggers: string[]; // High-unit 'C' or 'F' courses that pulled it down
  };
  diagnosticSummary: string;
  chunkedStudyPrescription: string[];
  targetGpaForNextSemester?: number;
}

export const NUC_GRADE_POINTS: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

export function getDegreeClass(cgpa: number): CgpaReport['degreeClass'] {
  if (cgpa >= 4.5) return 'First Class Honours';
  if (cgpa >= 3.5) return 'Second Class Honours (Upper Division)';
  if (cgpa >= 2.4) return 'Second Class Honours (Lower Division)';
  if (cgpa >= 1.5) return 'Third Class Honours';
  return 'Pass';
}

export function calculateSemesterGpa(courses: SemesterCourseGrade[]): {
  gpa: number;
  totalUnits: number;
  totalGradePoints: number;
} {
  let totalUnits = 0;
  let totalPoints = 0;

  for (const c of courses) {
    const point = NUC_GRADE_POINTS[c.grade.toUpperCase()] ?? 0;
    const units = Math.max(1, c.units || 1);
    totalUnits += units;
    totalPoints += point * units;
  }

  const gpa = totalUnits > 0 ? Number((totalPoints / totalUnits).toFixed(2)) : 0;
  return { gpa, totalUnits, totalGradePoints: totalPoints };
}

export function calculateCumulativeGpa(semesters: SemesterResult[], expectedLevel: string = '200L'): CgpaReport {
  let grandUnits = 0;
  let grandPoints = 0;
  const boosters: string[] = [];
  const draggers: string[] = [];

  for (const sem of semesters) {
    for (const c of sem.courses) {
      const units = Math.max(1, c.units || 1);
      const point = NUC_GRADE_POINTS[c.grade.toUpperCase()] ?? 0;
      grandUnits += units;
      grandPoints += point * units;

      if ((c.grade === 'A' || c.grade === 'B') && units >= 3) {
        boosters.push(`${c.courseCode} (${units}u - Grade ${c.grade})`);
      } else if ((c.grade === 'C' || c.grade === 'D' || c.grade === 'F') && units >= 3) {
        draggers.push(`${c.courseCode} (${units}u - Grade ${c.grade})`);
      }
    }
  }

  const cgpa = grandUnits > 0 ? Number((grandPoints / grandUnits).toFixed(2)) : 0;
  const degreeClass = getDegreeClass(cgpa);

  // Detect missing semesters up to student's current level
  const standardSemesters: string[] = [];
  const levelNum = parseInt(expectedLevel.replace(/[^0-9]/g, '') || '200', 10);

  if (levelNum >= 100) standardSemesters.push('100L First Semester', '100L Second Semester');
  if (levelNum >= 200) standardSemesters.push('200L First Semester', '200L Second Semester');
  if (levelNum >= 300) standardSemesters.push('300L First Semester', '300L Second Semester');
  if (levelNum >= 400) standardSemesters.push('400L First Semester', '400L Second Semester');

  const recordedSemLabels = semesters.map((s) => `${s.level} ${s.semester === 1 ? 'First' : 'Second'} Semester`);
  const missingSemesters = standardSemesters.filter((s) => !recordedSemLabels.includes(s));

  // Diagnostic summary
  let diagnosticSummary = '';
  if (cgpa >= 4.5) {
    diagnosticSummary = `Outstanding academic performance! Your CGPA of ${cgpa} places you securely in First Class Honours. You have strong mastery across high-unit core courses.`;
  } else if (cgpa >= 3.5) {
    diagnosticSummary = `Solid Second Class Upper standing at ${cgpa} CGPA. You are within striking distance of First Class (${Number((4.5 - cgpa).toFixed(2))} points away). With strategic preparation in upcoming 3-unit courses, crossing the 4.50 benchmark is achievable.`;
  } else if (cgpa >= 2.4) {
    diagnosticSummary = `Currently at ${cgpa} CGPA in Second Class Lower. Your grades show potential, but a few heavy 3-unit and 4-unit courses pulled your average down. Rebuilding this requires targeting B and A grades in upcoming semesters.`;
  } else {
    diagnosticSummary = `Academic Intervention Needed: Current CGPA stands at ${cgpa}. Prioritize clearing carryovers and focusing heavily on foundational General Studies and 100L/200L core units to move into safe territory.`;
  }

  // Actionable, chunked study prescription
  const chunkedStudyPrescription = [
    '20-Minute Focus Sprints: Never read for 4 straight hours without pause. Use high-intensity 20-minute blocks with 5-minute recall breaks.',
    'High-Unit Course Prioritization: Always allocate 60% of your weekly study time to 3-unit and 4-unit departmental courses, as they carry the heaviest weight on your CGPA.',
    'In-Chat Active Recall: Instead of passively re-reading slides, use Cohart AI practice quizzes to test your memory under exam conditions before test week.',
    'Continuous Assessment (CA) Optimization: CA makes up 30-40 marks before the exam. Log your lectures and submit all departmental assignments to lock in at least 25/30 before entering the exam hall.',
  ];

  return {
    cgpa,
    degreeClass,
    totalCreditsAttempted: grandUnits,
    totalGradePoints: grandPoints,
    semesters,
    missingSemesters,
    gradeDrivers: {
      boosters: boosters.slice(0, 3),
      draggers: draggers.slice(0, 3),
    },
    diagnosticSummary,
    chunkedStudyPrescription,
  };
}
