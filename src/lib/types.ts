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
  category: 'Federal' | 'State';
  city?: string;
}

export const SUPPORTED_INSTITUTIONS: Institution[] = [
  // Federal Universities
  { id: 'OOU', name: 'Olabisi Onabanjo University', shortName: 'OOU', hasMap: true, locationState: 'Ogun State', category: 'State', city: 'Ago-Iwoye' },
  { id: 'UNILAG', name: 'University of Lagos', shortName: 'UNILAG', hasMap: false, locationState: 'Lagos State', category: 'Federal', city: 'Akoka' },
  { id: 'UI', name: 'University of Ibadan', shortName: 'UI', hasMap: false, locationState: 'Oyo State', category: 'Federal', city: 'Ibadan' },
  { id: 'OAU', name: 'Obafemi Awolowo University', shortName: 'OAU', hasMap: false, locationState: 'Osun State', category: 'Federal', city: 'Ile-Ife' },
  { id: 'FUTA', name: 'Federal University of Technology, Akure', shortName: 'FUTA', hasMap: false, locationState: 'Ondo State', category: 'Federal', city: 'Akure' },
  { id: 'UNILORIN', name: 'University of Ilorin', shortName: 'UNILORIN', hasMap: false, locationState: 'Kwara State', category: 'Federal', city: 'Ilorin' },
  { id: 'UNIBEN', name: 'University of Benin', shortName: 'UNIBEN', hasMap: false, locationState: 'Edo State', category: 'Federal', city: 'Benin City' },
  { id: 'UNN', name: 'University of Nigeria, Nsukka', shortName: 'UNN', hasMap: false, locationState: 'Enugu State', category: 'Federal', city: 'Nsukka' },
  { id: 'ABU', name: 'Ahmadu Bello University', shortName: 'ABU', hasMap: false, locationState: 'Kaduna State', category: 'Federal', city: 'Zaria' },
  { id: 'BUK', name: 'Bayero University, Kano', shortName: 'BUK', hasMap: false, locationState: 'Kano State', category: 'Federal', city: 'Kano' },
  { id: 'UNIABUJA', name: 'University of Abuja', shortName: 'UNIABUJA', hasMap: false, locationState: 'Federal Capital Territory', category: 'Federal', city: 'Gwagwalada' },
  { id: 'UNIPORT', name: 'University of Port Harcourt', shortName: 'UNIPORT', hasMap: false, locationState: 'Rivers State', category: 'Federal', city: 'Port Harcourt' },
  { id: 'UNICAL', name: 'University of Calabar', shortName: 'UNICAL', hasMap: false, locationState: 'Cross River State', category: 'Federal', city: 'Calabar' },
  { id: 'UNIJOS', name: 'University of Jos', shortName: 'UNIJOS', hasMap: false, locationState: 'Plateau State', category: 'Federal', city: 'Jos' },
  { id: 'UNIMAID', name: 'University of Maiduguri', shortName: 'UNIMAID', hasMap: false, locationState: 'Borno State', category: 'Federal', city: 'Maiduguri' },
  { id: 'UNIUYO', name: 'University of Uyo', shortName: 'UNIUYO', hasMap: false, locationState: 'Akwa Ibom State', category: 'Federal', city: 'Uyo' },
  { id: 'UNIZIK', name: 'Nnamdi Azikiwe University', shortName: 'UNIZIK', hasMap: false, locationState: 'Anambra State', category: 'Federal', city: 'Awka' },
  { id: 'UDUS', name: 'Usmanu Danfodiyo University, Sokoto', shortName: 'UDUS', hasMap: false, locationState: 'Sokoto State', category: 'Federal', city: 'Sokoto' },
  { id: 'FUTO', name: 'Federal University of Technology, Owerri', shortName: 'FUTO', hasMap: false, locationState: 'Imo State', category: 'Federal', city: 'Owerri' },
  { id: 'FUTMINNA', name: 'Federal University of Technology, Minna', shortName: 'FUTMINNA', hasMap: false, locationState: 'Niger State', category: 'Federal', city: 'Minna' },
  { id: 'FUNAAB', name: 'Federal University of Agriculture, Abeokuta', shortName: 'FUNAAB', hasMap: false, locationState: 'Ogun State', category: 'Federal', city: 'Abeokuta' },
  { id: 'MOUAU', name: 'Michael Okpara University of Agriculture', shortName: 'MOUAU', hasMap: false, locationState: 'Abia State', category: 'Federal', city: 'Umudike' },
  { id: 'ATBU', name: 'Abubakar Tafawa Balewa University', shortName: 'ATBU', hasMap: false, locationState: 'Bauchi State', category: 'Federal', city: 'Bauchi' },
  { id: 'MAUTECH', name: 'Modibbo Adama University', shortName: 'MAUTECH', hasMap: false, locationState: 'Adamawa State', category: 'Federal', city: 'Yola' },
  { id: 'FUPRE', name: 'Federal University of Petroleum Resources', shortName: 'FUPRE', hasMap: false, locationState: 'Delta State', category: 'Federal', city: 'Effurun' },
  { id: 'NOUN', name: 'National Open University of Nigeria', shortName: 'NOUN', hasMap: false, locationState: 'Federal Capital Territory', category: 'Federal', city: 'Abuja' },
  { id: 'FUOYE', name: 'Federal University, Oye-Ekiti', shortName: 'FUOYE', hasMap: false, locationState: 'Ekiti State', category: 'Federal', city: 'Oye-Ekiti' },
  { id: 'FULOKOJA', name: 'Federal University, Lokoja', shortName: 'FULOKOJA', hasMap: false, locationState: 'Kogi State', category: 'Federal', city: 'Lokoja' },
  { id: 'FULAFIA', name: 'Federal University, Lafia', shortName: 'FULAFIA', hasMap: false, locationState: 'Nasarawa State', category: 'Federal', city: 'Lafia' },
  { id: 'FUD', name: 'Federal University, Dutse', shortName: 'FUD', hasMap: false, locationState: 'Jigawa State', category: 'Federal', city: 'Dutse' },
  { id: 'FUDMA', name: 'Federal University, Dutsin-Ma', shortName: 'FUDMA', hasMap: false, locationState: 'Katsina State', category: 'Federal', city: 'Dutsin-Ma' },
  { id: 'FUKASHERE', name: 'Federal University, Kashere', shortName: 'FUKASHERE', hasMap: false, locationState: 'Gombe State', category: 'Federal', city: 'Kashere' },
  { id: 'AE-FUNAI', name: 'Alex Ekwueme Federal University, Ndufu-Alike', shortName: 'AE-FUNAI', hasMap: false, locationState: 'Ebonyi State', category: 'Federal', city: 'Ikwo' },
  { id: 'FUOTUOKE', name: 'Federal University, Otuoke', shortName: 'FUOTUOKE', hasMap: false, locationState: 'Bayelsa State', category: 'Federal', city: 'Otuoke' },
  { id: 'FUWUKARI', name: 'Federal University, Wukari', shortName: 'FUWUKARI', hasMap: false, locationState: 'Taraba State', category: 'Federal', city: 'Wukari' },
  { id: 'FUBK', name: 'Federal University, Birnin Kebbi', shortName: 'FUBK', hasMap: false, locationState: 'Kebbi State', category: 'Federal', city: 'Birnin Kebbi' },
  { id: 'FUGUS', name: 'Federal University, Gusau', shortName: 'FUGUS', hasMap: false, locationState: 'Zamfara State', category: 'Federal', city: 'Gusau' },
  { id: 'FUGASHUA', name: 'Federal University, Gashua', shortName: 'FUGASHUA', hasMap: false, locationState: 'Yobe State', category: 'Federal', city: 'Gashua' },
  { id: 'FUAM', name: 'Joseph Sarwuan Tarka University', shortName: 'FUAM', hasMap: false, locationState: 'Benue State', category: 'Federal', city: 'Makurdi' },
  { id: 'NDA', name: 'Nigerian Defence Academy', shortName: 'NDA', hasMap: false, locationState: 'Kaduna State', category: 'Federal', city: 'Kaduna' },
  { id: 'POLAC', name: 'Nigeria Police Academy', shortName: 'POLAC', hasMap: false, locationState: 'Kano State', category: 'Federal', city: 'Wudil' },
  { id: 'AFIT', name: 'Air Force Institute of Technology', shortName: 'AFIT', hasMap: false, locationState: 'Kaduna State', category: 'Federal', city: 'Kaduna' },
  { id: 'NAUB', name: 'Nigerian Army University, Biu', shortName: 'NAUB', hasMap: false, locationState: 'Borno State', category: 'Federal', city: 'Biu' },
  { id: 'NMU', name: 'Nigerian Maritime University', shortName: 'NMU', hasMap: false, locationState: 'Delta State', category: 'Federal', city: 'Okerenkoko' },
  { id: 'FUHSO', name: 'Federal University of Health Sciences, Otukpo', shortName: 'FUHSO', hasMap: false, locationState: 'Benue State', category: 'Federal', city: 'Otukpo' },
  { id: 'FUHSI', name: 'Federal University of Health Sciences, Ila-Orangun', shortName: 'FUHSI', hasMap: false, locationState: 'Osun State', category: 'Federal', city: 'Ila-Orangun' },
  { id: 'FUHSA', name: 'Federal University of Health Sciences, Azare', shortName: 'FUHSA', hasMap: false, locationState: 'Bauchi State', category: 'Federal', city: 'Azare' },
  { id: 'KDUMS', name: 'David Umahi Federal University of Health Sciences', shortName: 'KDUMS', hasMap: false, locationState: 'Ebonyi State', category: 'Federal', city: 'Uburu' },

  // State Universities
  { id: 'LASU', name: 'Lagos State University', shortName: 'LASU', hasMap: false, locationState: 'Lagos State', category: 'State', city: 'Ojo' },
  { id: 'LASUSTECH', name: 'Lagos State University of Science and Technology', shortName: 'LASUSTECH', hasMap: false, locationState: 'Lagos State', category: 'State', city: 'Ikorodu' },
  { id: 'LASUED', name: 'Lagos State University of Education', shortName: 'LASUED', hasMap: false, locationState: 'Lagos State', category: 'State', city: 'Oto/Ijanikin' },
  { id: 'TASUED', name: 'Tai Solarin University of Education', shortName: 'TASUED', hasMap: false, locationState: 'Ogun State', category: 'State', city: 'Ijagun' },
  { id: 'EKSU', name: 'Ekiti State University', shortName: 'EKSU', hasMap: false, locationState: 'Ekiti State', category: 'State', city: 'Ado-Ekiti' },
  { id: 'BOUESTI', name: 'Bamidele Olumilua University of Education, Science and Tech', shortName: 'BOUESTI', hasMap: false, locationState: 'Ekiti State', category: 'State', city: 'Ikere-Ekiti' },
  { id: 'AAUA', name: 'Adekunle Ajasin University', shortName: 'AAUA', hasMap: false, locationState: 'Ondo State', category: 'State', city: 'Akungba-Akoko' },
  { id: 'OAUSTECH', name: 'Olusegun Agagu University of Science and Technology', shortName: 'OAUSTECH', hasMap: false, locationState: 'Ondo State', category: 'State', city: 'Okitipupa' },
  { id: 'UNIMED', name: 'University of Medical Sciences, Ondo', shortName: 'UNIMED', hasMap: false, locationState: 'Ondo State', category: 'State', city: 'Ondo' },
  { id: 'LAUTECH', name: 'Ladoke Akintola University of Technology', shortName: 'LAUTECH', hasMap: false, locationState: 'Oyo State', category: 'State', city: 'Ogbomoso' },
  { id: 'EAUED', name: 'Emmanuel Alayande University of Education', shortName: 'EAUED', hasMap: false, locationState: 'Oyo State', category: 'State', city: 'Oyo' },
  { id: 'UNIOSUN', name: 'Osun State University', shortName: 'UNIOSUN', hasMap: false, locationState: 'Osun State', category: 'State', city: 'Osogbo' },
  { id: 'KWASU', name: 'Kwara State University', shortName: 'KWASU', hasMap: false, locationState: 'Kwara State', category: 'State', city: 'Malete' },
  { id: 'AAU', name: 'Ambrose Alli University', shortName: 'AAU', hasMap: false, locationState: 'Edo State', category: 'State', city: 'Ekpoma' },
  { id: 'DELSU', name: 'Delta State University', shortName: 'DELSU', hasMap: false, locationState: 'Delta State', category: 'State', city: 'Abraka' },
  { id: 'DSUST', name: 'Delta State University of Science and Technology', shortName: 'DSUST', hasMap: false, locationState: 'Delta State', category: 'State', city: 'Ozoro' },
  { id: 'DOU', name: 'Dennis Osadebay University', shortName: 'DOU', hasMap: false, locationState: 'Delta State', category: 'State', city: 'Asaba' },
  { id: 'UNIDEL', name: 'University of Delta', shortName: 'UNIDEL', hasMap: false, locationState: 'Delta State', category: 'State', city: 'Agbor' },
  { id: 'RSU', name: 'Rivers State University', shortName: 'RSU', hasMap: false, locationState: 'Rivers State', category: 'State', city: 'Port Harcourt' },
  { id: 'IAUE', name: 'Ignatius Ajuru University of Education', shortName: 'IAUE', hasMap: false, locationState: 'Rivers State', category: 'State', city: 'Port Harcourt' },
  { id: 'NDU', name: 'Niger Delta University', shortName: 'NDU', hasMap: false, locationState: 'Bayelsa State', category: 'State', city: 'Wilberforce Island' },
  { id: 'BMU', name: 'Bayelsa Medical University', shortName: 'BMU', hasMap: false, locationState: 'Bayelsa State', category: 'State', city: 'Yenagoa' },
  { id: 'AKSU', name: 'Akwa Ibom State University', shortName: 'AKSU', hasMap: false, locationState: 'Akwa Ibom State', category: 'State', city: 'Ikot Akpaden' },
  { id: 'UNICROSS', name: 'Cross River University of Technology', shortName: 'UNICROSS', hasMap: false, locationState: 'Cross River State', category: 'State', city: 'Calabar' },
  { id: 'ABSU', name: 'Abia State University', shortName: 'ABSU', hasMap: false, locationState: 'Abia State', category: 'State', city: 'Uturu' },
  { id: 'COOU', name: 'Chukwuemeka Odumegwu Ojukwu University', shortName: 'COOU', hasMap: false, locationState: 'Anambra State', category: 'State', city: 'Uli' },
  { id: 'ESUT', name: 'Enugu State University of Science and Technology', shortName: 'ESUT', hasMap: false, locationState: 'Enugu State', category: 'State', city: 'Enugu' },
  { id: 'SUMAS', name: 'State University of Medical and Applied Sciences', shortName: 'SUMAS', hasMap: false, locationState: 'Enugu State', category: 'State', city: 'Igbo-Eno' },
  { id: 'IMSU', name: 'Imo State University', shortName: 'IMSU', hasMap: false, locationState: 'Imo State', category: 'State', city: 'Owerri' },
  { id: 'EBSU', name: 'Ebonyi State University', shortName: 'EBSU', hasMap: false, locationState: 'Ebonyi State', category: 'State', city: 'Abakaliki' },
  { id: 'BSU', name: 'Benue State University', shortName: 'BSU', hasMap: false, locationState: 'Benue State', category: 'State', city: 'Makurdi' },
  { id: 'PAAU', name: 'Prince Abubakar Audu University', shortName: 'PAAU', hasMap: false, locationState: 'Kogi State', category: 'State', city: 'Anyigba' },
  { id: 'CUSTECH', name: 'Confluence University of Science and Technology', shortName: 'CUSTECH', hasMap: false, locationState: 'Kogi State', category: 'State', city: 'Osara' },
  { id: 'KSUK', name: 'Kogi State University, Kabba', shortName: 'KSUK', hasMap: false, locationState: 'Kogi State', category: 'State', city: 'Kabba' },
  { id: 'NSUK', name: 'Nasarawa State University', shortName: 'NSUK', hasMap: false, locationState: 'Nasarawa State', category: 'State', city: 'Keffi' },
  { id: 'PLASU', name: 'Plateau State University', shortName: 'PLASU', hasMap: false, locationState: 'Plateau State', category: 'State', city: 'Bokkos' },
  { id: 'IBBU', name: 'Ibrahim Badamasi Babangida University', shortName: 'IBBU', hasMap: false, locationState: 'Niger State', category: 'State', city: 'Lapai' },
  { id: 'KASU', name: 'Kaduna State University', shortName: 'KASU', hasMap: false, locationState: 'Kaduna State', category: 'State', city: 'Kaduna' },
  { id: 'ADUSTECH', name: 'Aliko Dangote University of Science and Technology', shortName: 'ADUSTECH', hasMap: false, locationState: 'Kano State', category: 'State', city: 'Wudil' },
  { id: 'YMSUK', name: 'Yusuf Maitama Sule University', shortName: 'YMSUK', hasMap: false, locationState: 'Kano State', category: 'State', city: 'Kano' },
  { id: 'SRUE', name: "Sa'adatu Rimi University of Education", shortName: 'SRUE', hasMap: false, locationState: 'Kano State', category: 'State', city: 'Kumbotso' },
  { id: 'UMYU', name: 'Umaru Musa Yar’Adua University', shortName: 'UMYU', hasMap: false, locationState: 'Katsina State', category: 'State', city: 'Katsina' },
  { id: 'SLU', name: 'Sule Lamido University', shortName: 'SLU', hasMap: false, locationState: 'Jigawa State', category: 'State', city: 'Kafin Hausa' },
  { id: 'SSU', name: 'Sokoto State University', shortName: 'SSU', hasMap: false, locationState: 'Sokoto State', category: 'State', city: 'Sokoto' },
  { id: 'SSUES', name: 'Shehu Shagari University of Education', shortName: 'SSUES', hasMap: false, locationState: 'Sokoto State', category: 'State', city: 'Sokoto' },
  { id: 'KSUSTA', name: 'Kebbi State University of Science and Technology', shortName: 'KSUSTA', hasMap: false, locationState: 'Kebbi State', category: 'State', city: 'Aliero' },
  { id: 'ZAMSU', name: 'Zamfara State University', shortName: 'ZAMSU', hasMap: false, locationState: 'Zamfara State', category: 'State', city: 'Talata Mafara' },
  { id: 'BASUG', name: 'Bauchi State University', shortName: 'BASUG', hasMap: false, locationState: 'Bauchi State', category: 'State', city: 'Gadau' },
  { id: 'GSU', name: 'Gombe State University', shortName: 'GSU', hasMap: false, locationState: 'Gombe State', category: 'State', city: 'Gombe' },
  { id: 'ADSU', name: 'Adamawa State University', shortName: 'ADSU', hasMap: false, locationState: 'Adamawa State', category: 'State', city: 'Mubi' },
  { id: 'TSU', name: 'Taraba State University', shortName: 'TSU', hasMap: false, locationState: 'Taraba State', category: 'State', city: 'Jalingo' },
  { id: 'YSU', name: 'Yobe State University', shortName: 'YSU', hasMap: false, locationState: 'Yobe State', category: 'State', city: 'Damaturu' },
  { id: 'BOSU', name: 'Borno State University', shortName: 'BOSU', hasMap: false, locationState: 'Borno State', category: 'State', city: 'Maiduguri' },
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

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // for objective style: e.g. ["A. ...", "B. ...", "C. ...", "D. ..."]
  correctIndex: number;
  explanation: string; // short, simple English explanation of why the correct option is right and others are wrong
  theorySampleAnswer?: string; // for theory questions
  courseContext?: string;
  isAssisted?: boolean; // marked if user consulted mini AI
}

export interface QuizData {
  id: string;
  title: string;
  courseCode: string;
  institution?: string;
  type: 'objective' | 'theory';
  questions: QuizQuestion[];
  createdAt: string;
  createdBy?: string;
}

export interface QuizAttemptResult {
  quizId: string;
  courseCode: string;
  title: string;
  totalQuestions: number;
  score: number;
  assistedCount: number;
  missedQuestionIds: string[];
  missedQuestionsSummary: {
    question: string;
    chosenAnswer: string;
    correctAnswer: string;
    explanation: string;
  }[];
  timeTakenSeconds: number;
  completedAt: string;
}

