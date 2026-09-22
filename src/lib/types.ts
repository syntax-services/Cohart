export type LocationCategory =
  | 'lecture_hall'
  | 'faculty'
  | 'library'
  | 'admin'
  | 'lab'
  | 'amenity';

export interface LocationImage {
  url: string;
  caption: string;
  year?: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  category: LocationCategory;
  description: string;
  faculty: string;
  department?: string;
  latitude: number;
  longitude: number;
  capacity?: number;
  orientation_tips: string;
  images?: LocationImage[];
  is_active?: boolean;
}

export type LearningStyle =
  | 'visual_analogies'
  | 'socratic_inquiry'
  | 'concise_bullet'
  | 'deep_first_principles';

export interface StudentProfile {
  id: string;
  email: string;
  full_name: string;
  matric_number: string;
  institution: string;
  faculty: string;
  department: string;
  level: string; // '100L' | '200L' | '300L' | '400L' | '500L'
  cognitive_traits: string[];
  learning_style: LearningStyle;
  reading_speed_wpm: number;
  referral_code: string;
  wallet_balance: number;
  is_verified_coordinator: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceLog {
  id: string;
  user_id: string;
  course_code: string;
  venue: string;
  status: 'present' | 'late' | 'excused';
  attended_at: string;
  notes?: string;
}

export interface TimetableItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  lecturer: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  time: string;
  venueName: string;
  locationId: string;
  department: string;
  level: string;
  isLiveNow?: boolean;
}

export interface SavedExplanation {
  id: string;
  user_id?: string;
  course_code: string;
  selected_text: string;
  ai_explanation: string;
  context_topic?: string;
  created_at?: string;
}

export interface ActiveRecallPrompt {
  id: string;
  paragraphIndex: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ReaderChapter {
  id: string;
  courseCode: string;
  title: string;
  subtitle: string;
  readTimeMinutes: number;
  paragraphs: string[];
  checkpoints: ActiveRecallPrompt[];
}

export interface LectureItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  lecturer: string;
  time: string;
  venueName: string;
  locationId: string;
  department: string;
  level: string;
  isLiveNow?: boolean;
}

export interface QuickNote {
  id: string;
  title: string;
  course: string;
  content: string;
  lastEdited: string;
}

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  hasMap: boolean;
  locationState: string;
}

export const SUPPORTED_INSTITUTIONS: Institution[] = [
  { id: 'OOU', name: 'Olabisi Onabanjo University', shortName: 'OOU', hasMap: true, locationState: 'Ogun State' },
  { id: 'UNILAG', name: 'University of Lagos', shortName: 'UNILAG', hasMap: false, locationState: 'Lagos State' },
  { id: 'UI', name: 'University of Ibadan', shortName: 'UI', hasMap: false, locationState: 'Oyo State' },
  { id: 'LASU', name: 'Lagos State University', shortName: 'LASU', hasMap: false, locationState: 'Lagos State' },
  { id: 'OAU', name: 'Obafemi Awolowo University', shortName: 'OAU', hasMap: false, locationState: 'Osun State' },
  { id: 'FUTA', name: 'Federal University of Technology Akure', shortName: 'FUTA', hasMap: false, locationState: 'Ondo State' },
];

export interface CohartVoiceOption {
  id: string;
  label: string;
  gender: 'Female' | 'Male';
  persona: string;
  generation: 'aura-2' | 'aura';
  sampleText: string;
  audioUrl: string;
}

export const COHART_VOICES: CohartVoiceOption[] = [
  // Aura-2 Flagship Enterprise Conversational Voice Models
  {
    id: 'aura-2-thalia-en',
    label: 'Cohart Nova (Clear Tutor)',
    gender: 'Female',
    persona: 'Warm, engaging, articulates lecture concepts clearly',
    generation: 'aura-2',
    sampleText: 'Hello scholar! I am Cohart Nova, your lead academic tutor. Let us break down your course materials together with clear analogies and step-by-step logic.',
    audioUrl: '/audio/voices/aura-2-thalia-en.mp3',
  },
  {
    id: 'aura-2-orion-en',
    label: 'Cohart Atlas (Professorial)',
    gender: 'Male',
    persona: 'Calm, authoritative, articulate lecture style',
    generation: 'aura-2',
    sampleText: 'Welcome. I am Cohart Atlas, your professorial guide. We will analyze your lectures rigorously, focusing on first principles and central senate exam concepts.',
    audioUrl: '/audio/voices/aura-2-orion-en.mp3',
  },
  {
    id: 'aura-2-luna-en',
    label: 'Cohart Aura (Gentle Mentor)',
    gender: 'Female',
    persona: 'Encouraging, conversational, patient pacing',
    generation: 'aura-2',
    sampleText: 'Hi there! I am Cohart Aura, your study mentor. Take a deep breath; we will master every complex topic gently, at whatever pace feels comfortable for you.',
    audioUrl: '/audio/voices/aura-2-luna-en.mp3',
  },
  {
    id: 'aura-2-zeus-en',
    label: 'Cohart Pulse (Crisp Leader)',
    gender: 'Male',
    persona: 'Dynamic, confident, energetic exam coach',
    generation: 'aura-2',
    sampleText: 'Hey champion, Cohart Pulse in the building! Get focused, lock in on past questions, and let us crush your upcoming semester exams with top grades.',
    audioUrl: '/audio/voices/aura-2-zeus-en.mp3',
  },
  {
    id: 'aura-2-asteria-en',
    label: 'Cohart Sage (Balanced Reader)',
    gender: 'Female',
    persona: 'Natural, poised, balanced academic reader',
    generation: 'aura-2',
    sampleText: 'Greetings. I am Cohart Sage. I deliver balanced, structured overviews of your syllabus, ensuring every lecture detail is clear and readily accessible.',
    audioUrl: '/audio/voices/aura-2-asteria-en.mp3',
  },
  {
    id: 'aura-2-apollo-en',
    label: 'Cohart Peer (Study Mate)',
    gender: 'Male',
    persona: 'Approachable, warm discussion partner',
    generation: 'aura-2',
    sampleText: 'What is up study partner! Cohart Orion here. Think of me as your course mate who actually paid attention in class. Let us compare notes and prepare together.',
    audioUrl: '/audio/voices/aura-2-apollo-en.mp3',
  },
  {
    id: 'aura-2-athena-en',
    label: 'Cohart Logic (Concise Guide)',
    gender: 'Female',
    persona: 'Structured, direct, concise explanations',
    generation: 'aura-2',
    sampleText: 'Salutations. I am Cohart Wisdom. Expect direct, concise, and logically organized bullet points with zero fluff. Let us review the essentials right away.',
    audioUrl: '/audio/voices/aura-2-athena-en.mp3',
  },
  {
    id: 'aura-2-hermes-en',
    label: 'Cohart Swift (Rapid Review)',
    gender: 'Male',
    persona: 'Quick, sharp, articulate review partner',
    generation: 'aura-2',
    sampleText: 'Quick check-in! I am Cohart Swift. When you have ten minutes before a test at the lecture hall, I deliver high-speed rapid fire revision drills.',
    audioUrl: '/audio/voices/aura-2-hermes-en.mp3',
  },

  // Aura Legacy Models
  {
    id: 'aura-asteria-en',
    label: 'Cohart Classic (Asteria)',
    gender: 'Female',
    persona: 'Original conversational voice',
    generation: 'aura',
    sampleText: 'Hello, I am Cohart Classic. Reliable, clear, and steady for all your daily campus coursework.',
    audioUrl: '/audio/voices/aura-asteria-en.mp3',
  },
  {
    id: 'aura-orion-en',
    label: 'Cohart Classic (Orion)',
    gender: 'Male',
    persona: 'Original deep resonant voice',
    generation: 'aura',
    sampleText: 'Greetings scholar. I am Cohart Classic Resonant. Ready to guide you through your textbooks.',
    audioUrl: '/audio/voices/aura-orion-en.mp3',
  },
];

export const DEFAULT_COHART_VOICE = 'aura-2-thalia-en';
export const DEFAULT_VOICE_RATE = 1.0;

