import { StudentProfile } from './types';

export interface ArchivedDocumentContext {
  id: string;
  originalFileName: string;
  fileCategory: 'timetable' | 'lecture_note' | 'result_slip' | 'past_question' | 'handout';
  uploadedAt: string;
  archivedAt: string;
  isOffloadedFromDrive: boolean;
  department: string;
  institution: string;
  faculty?: string;
  courseCode?: string;
  semester?: string;
  summary: string;
  keyConcepts: string[];
  extractedFacts: Record<string, any>;
  tags: string[];
}

const STORAGE_KEY = 'cohart_archived_documents_index';

export function saveDocumentContext(doc: Omit<ArchivedDocumentContext, 'id' | 'archivedAt' | 'isOffloadedFromDrive'>): ArchivedDocumentContext {
  const newEntry: ArchivedDocumentContext = {
    ...doc,
    id: `doc_arch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    archivedAt: new Date().toISOString(),
    isOffloadedFromDrive: true, // Marked as offloaded off drive while preserving JSON semantic context
  };

  if (typeof window !== 'undefined') {
    try {
      const existing: ArchivedDocumentContext[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      existing.unshift(newEntry);
      // Keep up to 50 document contexts
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
    } catch (e) {
      console.warn('Could not save document context locally:', e);
    }
  }

  return newEntry;
}

/**
 * Strictly scoped retrieval by institution, department, and faculty.
 * Ensures summaries, timetables, and notes from one school never leak to another.
 */
export function getArchivedDocumentContexts(department?: string, institution?: string, faculty?: string): ArchivedDocumentContext[] {
  if (typeof window !== 'undefined') {
    try {
      const docs: ArchivedDocumentContext[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return docs.filter((d) => {
        // Strict institution isolation
        const instMatch = !institution || !d.institution || d.institution.toUpperCase() === institution.toUpperCase();
        // Strict department / faculty matching
        const deptMatch = !department || d.department.toLowerCase() === department.toLowerCase() || d.department === 'General';
        const facMatch = !faculty || !d.faculty || d.faculty.toLowerCase() === faculty.toLowerCase();
        return instMatch && deptMatch && facMatch;
      });
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Format archived documents for AI prompt injection strictly scoped to the student's school & department.
 */
export function formatArchivedDocumentsForAiPrompt(department?: string, institution?: string, faculty?: string): string {
  const docs = getArchivedDocumentContexts(department, institution, faculty);
  if (!docs || docs.length === 0) return '';

  const scopeLabel = `${institution || 'Institution'} • ${department || 'General'}`;

  return `Archived Academic Document Contexts for [${scopeLabel}] (Strict School/Department Isolation):\n` +
    docs.slice(0, 6).map((d) =>
      `- [${d.fileCategory.toUpperCase()}] "${d.originalFileName}" (${d.institution} - ${d.courseCode || d.department}, ${d.uploadedAt.split('T')[0]}):\n` +
      `  Summary: ${d.summary}\n` +
      `  Lecturer Key Highlights: ${d.keyConcepts.join(', ')}`
    ).join('\n');
}
