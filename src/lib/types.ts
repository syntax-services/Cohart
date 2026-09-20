export type LocationCategory =
  | 'lecture_hall'
  | 'faculty'
  | 'library'
  | 'admin'
  | 'lab'
  | 'amenity';

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

