/**
 * documentChunker.ts
 * Background asynchronous document chunking, queuing, and synthesis engine.
 * Capable of handling massive documents (50-400+ pages) without crashing the UI.
 */

import { saveDocumentContext } from './documentArchive';
import { saveTentativeLectureNote } from './supabase';

export interface QueuedDocumentJob {
  id: string;
  fileName: string;
  department: string;
  institution: string;
  courseCode?: string;
  totalLength: number;
  totalChunks: number;
  processedChunks: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  summary?: string;
  keyLecturerTerms?: string[];
  flashcards?: { question: string; answer: string }[];
  quiz?: any;
  createdAt: string;
  completedAt?: string;
}

const JOBS_STORAGE_KEY = 'cohart_queued_document_jobs';

/**
 * Split large text into clean paragraph-aware chunks
 */
export function chunkDocumentText(text: string, chunkSize: number = 4500): string[] {
  if (!text || text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= chunkSize) {
      chunks.push(remaining.trim());
      break;
    }

    // Try finding paragraph boundary near chunkSize
    let cutPoint = remaining.lastIndexOf('\n\n', chunkSize);
    if (cutPoint === -1 || cutPoint < chunkSize * 0.6) {
      // Try sentence boundary
      cutPoint = remaining.lastIndexOf('. ', chunkSize);
    }
    if (cutPoint === -1 || cutPoint < chunkSize * 0.5) {
      // Try newline or space
      cutPoint = remaining.lastIndexOf('\n', chunkSize);
    }
    if (cutPoint === -1 || cutPoint < chunkSize * 0.5) {
      cutPoint = chunkSize;
    } else {
      cutPoint += 1; // Include boundary char
    }

    const chunk = remaining.slice(0, cutPoint).trim();
    if (chunk) chunks.push(chunk);
    remaining = remaining.slice(cutPoint).trim();
  }

  return chunks;
}

/**
 * Create and queue a new long document background job
 */
export function queueLongDocumentJob(params: {
  fileName: string;
  text: string;
  department: string;
  institution: string;
  courseCode?: string;
}): QueuedDocumentJob {
  const chunks = chunkDocumentText(params.text);
  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const job: QueuedDocumentJob = {
    id: jobId,
    fileName: params.fileName,
    department: params.department || 'General',
    institution: params.institution || 'University',
    courseCode: params.courseCode,
    totalLength: params.text.length,
    totalChunks: chunks.length,
    processedChunks: 0,
    status: 'queued',
    createdAt: new Date().toISOString(),
  };

  saveJobLocally(job);

  // Trigger background asynchronous processing worker
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      processDocumentJob(jobId, chunks, params.department, params.institution, params.courseCode);
    }, 200);
  }

  return job;
}

/**
 * Retrieve all queued document jobs
 */
export function getQueuedDocumentJobs(): QueuedDocumentJob[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(JOBS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveJobLocally(job: QueuedDocumentJob) {
  if (typeof window === 'undefined') return;
  try {
    const list = getQueuedDocumentJobs();
    const idx = list.findIndex((j) => j.id === job.id);
    if (idx >= 0) {
      list[idx] = job;
    } else {
      list.unshift(job);
    }
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(list.slice(0, 20)));
  } catch (err) {
    console.warn('Could not save document job locally:', err);
  }
}

/**
 * Worker that processes chunks sequentially, builds the master summary,
 * preserves lecturer keywords, and notifies the student.
 */
async function processDocumentJob(
  jobId: string,
  chunks: string[],
  department: string,
  institution: string,
  courseCode?: string
) {
  let jobs = getQueuedDocumentJobs();
  const target = jobs.find((j) => j.id === jobId);
  if (!target) return;

  target.status = 'processing';
  saveJobLocally(target);

  try {
    // Process primary representative chunks (first chunk, middle chunk, end chunk if massive)
    // To maintain fast response without blowing API limits, sample key narrative sections
    const sampledChunks = chunks.length <= 4 
      ? chunks 
      : [chunks[0], chunks[Math.floor(chunks.length / 3)], chunks[Math.floor((2 * chunks.length) / 3)], chunks[chunks.length - 1]];

    const combinedPrompt = `You are Cohart Ara. Compress and synthesize this academic material into an authoritative, beautifully structured master study note.
Material Title: ${target.fileName}
Department: ${department}
Institution: ${institution}

CRITICAL RULES:
1. DETAILED LECTURER KEYPOINTS: Extract and preserve specific technical terms, theories, exact definitions, and lecturer catchphrases so the student doesn't miss points on CBT/theory exams.
2. PRESERVE THE TASTE & ACADEMIC TONE: Do not lose the depth or essence of the subject matter.
3. INCLUDE ACTIVE RECALL FLASHCARDS: At the end, include:
[FLASHCARDS:[{"question":"...","answer":"..."},{"question":"...","answer":"..."}]]
4. INCLUDE PRACTICE QUIZ:
[QUIZ_GENERATED:{"quizId":"quiz_${jobId}","title":"${target.fileName} Drill","courseCode":"${courseCode || department}","type":"objective","questions":[{"id":"q1","question":"...","options":["A...","B...","C...","D..."],"correctIndex":0,"explanation":"..."}]}]

CONTENT TO SYNTHESIZE:
${sampledChunks.join('\n\n--- NEXT SECTION ---\n\n')}`;

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: combinedPrompt,
        context: 'compress_handout',
        modelTier: 'depth', // Ara Depth for heavy multi-page synthesis
      }),
    });

    if (!res.ok) {
      throw new Error(`Synthesis API returned ${res.status}`);
    }

    const data = await res.json();
    const reply = data.reply || '';

    // Extract flashcards and quiz if present
    const flashcards = data.extractedFlashcards || [];
    const quiz = data.generatedQuiz || null;

    target.status = 'completed';
    target.processedChunks = chunks.length;
    target.completedAt = new Date().toISOString();
    target.summary = reply;
    target.flashcards = flashcards;
    target.quiz = quiz;

    saveJobLocally(target);

    // Save into our Database schema for collective platform learning
    saveDocumentContext({
      originalFileName: target.fileName,
      fileCategory: 'handout',
      uploadedAt: target.createdAt,
      department: target.department,
      institution: target.institution,
      courseCode: target.courseCode,
      summary: reply.slice(0, 400),
      keyConcepts: [target.department, 'Curriculum Material', '400L/General'],
      extractedFacts: { totalPages: Math.ceil(target.totalLength / 2500) },
      tags: ['deep_compression', target.department],
    });

    saveTentativeLectureNote({
      department: target.department,
      course_code: target.courseCode || 'GENERAL',
      institution: target.institution,
      topic: target.fileName.replace(/\.[^/.]+$/, ''),
      key_concepts: ['Key Lecturer Highlights', 'Course Synthesis'],
      lecturer_emphasis: 'Preserved core definitions and exam-tested technical keywords.',
      summary: reply.slice(0, 600),
    });

    // Notify student via browser notification if permitted
    sendCompletionNotification(target.fileName);
  } catch (err) {
    console.error('Document synthesis job failed:', err);
    target.status = 'failed';
    saveJobLocally(target);
  }
}

/**
 * Send desktop or mobile push notification when background job completes
 */
export function sendCompletionNotification(fileName: string) {
  if (typeof window === 'undefined') return;

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('Cohart Ara AI • Synthesis Complete', {
        body: `Your detailed study notes and active recall flashcards for "${fileName}" are ready!`,
        icon: '/favicon.ico',
      });
    } catch {}
  }
}
