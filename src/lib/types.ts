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

export interface LectureItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  lecturer: string;
  time: string;
  venueName: string;
  locationId: string;
  department: string;
  level: string; // e.g. "200L"
  isLiveNow?: boolean;
}

export interface QuickNote {
  id: string;
  title: string;
  course: string;
  content: string;
  lastEdited: string;
}
