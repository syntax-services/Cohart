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
  category: 'Federal' | 'State' | 'Private';
  city?: string;
}

export const SUPPORTED_INSTITUTIONS: Institution[] = [
  { id: "ATBU", name: "Abubakar Tafawa Balewa University", shortName: "ATBU", hasMap: false, locationState: "Bauchi State", category: "Federal", city: "Bauchi" },
  { id: "AFUED", name: "Adeyemi Federal University of Education", shortName: "AFUED", hasMap: false, locationState: "Ondo State", category: "Federal", city: "Ondo" },
  { id: "ADUN", name: "Admiralty University Ibusa", shortName: "ADUN", hasMap: false, locationState: "Delta State", category: "Federal", city: "Ibusa" },
  { id: "AAAU", name: "African Aviation and Aerospace University", shortName: "AAAU", hasMap: false, locationState: "Federal Capital Territory", category: "Federal", city: "Abuja" },
  { id: "ABU", name: "Ahmadu Bello University", shortName: "ABU", hasMap: false, locationState: "Kaduna State", category: "Federal", city: "Zaria" },
  { id: "AFIT", name: "Air Force Institute of Technology", shortName: "AFIT", hasMap: false, locationState: "Kaduna State", category: "Federal", city: "Kaduna" },
  { id: "AE-FUNAI-2", name: "Alex Ekwueme Federal University Ndufu Alike Ikwo", shortName: "AE-FUNAI", hasMap: false, locationState: "Ebonyi State", category: "Federal", city: "Ikwo" },
  { id: "AE-FUNAI", name: "Alex Ekwueme Federal University, Ndufu-Alike", shortName: "AE-FUNAI", hasMap: false, locationState: "Ebonyi State", category: "Federal", city: "Ikwo" },
  { id: "AIFUE", name: "Alvan Ikoku Federal University of Education", shortName: "AIFUE", hasMap: false, locationState: "Imo State", category: "Federal", city: "Owerri" },
  { id: "BUK-2", name: "Bayero University", shortName: "BUK", hasMap: false, locationState: "Kano State", category: "Federal", city: "Kano" },
  { id: "BUK", name: "Bayero University, Kano", shortName: "BUK", hasMap: false, locationState: "Kano State", category: "Federal", city: "Kano" },
  { id: "KDUMS", name: "David Umahi Federal University of Health Sciences", shortName: "KDUMS", hasMap: false, locationState: "Ebonyi State", category: "Federal", city: "Uburu" },
  { id: "FUNAAB", name: "Federal University of Agriculture, Abeokuta", shortName: "FUNAAB", hasMap: false, locationState: "Ogun State", category: "Federal", city: "Abeokuta" },
  { id: "FUAMB", name: "Federal University of Agriculture, Mubi", shortName: "FUAMB", hasMap: false, locationState: "Adamawa State", category: "Federal", city: "Mubi" },
  { id: "FUAZ", name: "Federal University of Agriculture, Zuru", shortName: "FUAZ", hasMap: false, locationState: "Kebbi State", category: "Federal", city: "Zuru" },
  { id: "FUASK", name: "Federal University of Applied Sciences Kachia", shortName: "FUASK", hasMap: false, locationState: "Kaduna State", category: "Federal", city: "Kachia" },
  { id: "FUEP", name: "Federal University of Education, Pankshin", shortName: "FUEP", hasMap: false, locationState: "Plateau State", category: "Federal", city: "Pankshin" },
  { id: "FUEZ", name: "Federal University of Education, Zaria", shortName: "FUEZ", hasMap: false, locationState: "Kaduna State", category: "Federal", city: "Zaria" },
  { id: "FUHSA", name: "Federal University of Health Sciences, Azare", shortName: "FUHSA", hasMap: false, locationState: "Bauchi State", category: "Federal", city: "Azare" },
  { id: "FUHSI", name: "Federal University of Health Sciences, Ila-Orangun", shortName: "FUHSI", hasMap: false, locationState: "Osun State", category: "Federal", city: "Ila-Orangun" },
  { id: "FUHSO", name: "Federal University of Health Sciences, Otukpo", shortName: "FUHSO", hasMap: false, locationState: "Benue State", category: "Federal", city: "Otukpo" },
  { id: "FUPRE", name: "Federal University of Petroleum Resources", shortName: "FUPRE", hasMap: false, locationState: "Delta State", category: "Federal", city: "Effurun" },
  { id: "FUPRE-2", name: "Federal University of Petroleum Resources Effurun", shortName: "FUPRE", hasMap: false, locationState: "Delta State", category: "Federal", city: "Effurun" },
  { id: "FUTIA", name: "Federal University of Technology Ikot Abasi", shortName: "FUTIA", hasMap: false, locationState: "Akwa Ibom State", category: "Federal", city: "Ikot Abasi" },
  { id: "FUTA", name: "Federal University of Technology, Akure", shortName: "FUTA", hasMap: false, locationState: "Ondo State", category: "Federal", city: "Akure" },
  { id: "FUTMINNA", name: "Federal University of Technology, Minna", shortName: "FUTMINNA", hasMap: false, locationState: "Niger State", category: "Federal", city: "Minna" },
  { id: "FUTO", name: "Federal University of Technology, Owerri", shortName: "FUTO", hasMap: false, locationState: "Imo State", category: "Federal", city: "Owerri" },
  { id: "FUTD", name: "Federal University of Transportation, Daura", shortName: "FUTD", hasMap: false, locationState: "Katsina State", category: "Federal", city: "Daura" },
  { id: "FUBK", name: "Federal University, Birnin Kebbi", shortName: "FUBK", hasMap: false, locationState: "Kebbi State", category: "Federal", city: "Birnin Kebbi" },
  { id: "FUD", name: "Federal University, Dutse", shortName: "FUD", hasMap: false, locationState: "Jigawa State", category: "Federal", city: "Dutse" },
  { id: "FUDMA", name: "Federal University, Dutsin-Ma", shortName: "FUDMA", hasMap: false, locationState: "Katsina State", category: "Federal", city: "Dutsin-Ma" },
  { id: "FUGASHUA", name: "Federal University, Gashua", shortName: "FUGASHUA", hasMap: false, locationState: "Yobe State", category: "Federal", city: "Gashua" },
  { id: "FUGUS", name: "Federal University, Gusau", shortName: "FUGUS", hasMap: false, locationState: "Zamfara State", category: "Federal", city: "Gusau" },
  { id: "FUKASHERE", name: "Federal University, Kashere", shortName: "FUKASHERE", hasMap: false, locationState: "Gombe State", category: "Federal", city: "Kashere" },
  { id: "FULAFIA", name: "Federal University, Lafia", shortName: "FULAFIA", hasMap: false, locationState: "Nasarawa State", category: "Federal", city: "Lafia" },
  { id: "FULOKOJA", name: "Federal University, Lokoja", shortName: "FULOKOJA", hasMap: false, locationState: "Kogi State", category: "Federal", city: "Lokoja" },
  { id: "FUOTUOKE", name: "Federal University, Otuoke", shortName: "FUOTUOKE", hasMap: false, locationState: "Bayelsa State", category: "Federal", city: "Otuoke" },
  { id: "FUOYE", name: "Federal University, Oye-Ekiti", shortName: "FUOYE", hasMap: false, locationState: "Ekiti State", category: "Federal", city: "Oye-Ekiti" },
  { id: "FUWUKARI", name: "Federal University, Wukari", shortName: "FUWUKARI", hasMap: false, locationState: "Taraba State", category: "Federal", city: "Wukari" },
  { id: "FUAM", name: "Joseph Sarwuan Tarka University", shortName: "FUAM", hasMap: false, locationState: "Benue State", category: "Federal", city: "Makurdi" },
  { id: "MOUAU", name: "Michael Okpara University of Agriculture", shortName: "MOUAU", hasMap: false, locationState: "Abia State", category: "Federal", city: "Umudike" },
  { id: "MOUAU-2", name: "Michael Okpara University of Agriculture, Umudike", shortName: "MOUAU", hasMap: false, locationState: "Abia State", category: "Federal", city: "Umudike" },
  { id: "MAUTECH", name: "Modibbo Adama University", shortName: "MAUTECH", hasMap: false, locationState: "Adamawa State", category: "Federal", city: "Yola" },
  { id: "MAU", name: "Modibbo Adama University, Yola", shortName: "MAU", hasMap: false, locationState: "Adamawa State", category: "Federal", city: "Yola" },
  { id: "NOUN", name: "National Open University of Nigeria", shortName: "NOUN", hasMap: false, locationState: "Federal Capital Territory", category: "Federal", city: "Abuja" },
  { id: "AFIT-2", name: "Nigeria Airforce University", shortName: "AFIT", hasMap: false, locationState: "Kaduna State", category: "Federal", city: "Kaduna" },
  { id: "NMU-2", name: "Nigeria Maritime University", shortName: "NMU", hasMap: false, locationState: "Delta State", category: "Federal", city: "Warri" },
  { id: "POLAC", name: "Nigeria Police Academy", shortName: "POLAC", hasMap: false, locationState: "Kano State", category: "Federal", city: "Wudil" },
  { id: "NPA", name: "Nigeria Police Academy, Wudil", shortName: "NPA", hasMap: false, locationState: "Kano State", category: "Federal", city: "Wudil" },
  { id: "NAUB", name: "Nigerian Army University, Biu", shortName: "NAUB", hasMap: false, locationState: "Borno State", category: "Federal", city: "Biu" },
  { id: "NDA", name: "Nigerian Defence Academy", shortName: "NDA", hasMap: false, locationState: "Kaduna State", category: "Federal", city: "Kaduna" },
  { id: "NDA-2", name: "Nigerian Defense Academy", shortName: "NDA", hasMap: false, locationState: "Kaduna State", category: "Federal", city: "Kaduna" },
  { id: "NMU", name: "Nigerian Maritime University", shortName: "NMU", hasMap: false, locationState: "Delta State", category: "Federal", city: "Okerenkoko" },
  { id: "UNIZIK", name: "Nnamdi Azikiwe University", shortName: "UNIZIK", hasMap: false, locationState: "Anambra State", category: "Federal", city: "Awka" },
  { id: "OAU", name: "Obafemi Awolowo University", shortName: "OAU", hasMap: false, locationState: "Osun State", category: "Federal", city: "Ile-Ife" },
  { id: "TASFUED", name: "Tai Solarin Federal University of Education", shortName: "TASFUED", hasMap: false, locationState: "Ogun State", category: "Federal", city: "Ijebu-Ode" },
  { id: "UNIABUJA", name: "University of Abuja", shortName: "UNIABUJA", hasMap: false, locationState: "Federal Capital Territory", category: "Federal", city: "Gwagwalada" },
  { id: "UNIBEN", name: "University of Benin", shortName: "UNIBEN", hasMap: false, locationState: "Edo State", category: "Federal", city: "Benin City" },
  { id: "UNICAL", name: "University of Calabar", shortName: "UNICAL", hasMap: false, locationState: "Cross River State", category: "Federal", city: "Calabar" },
  { id: "UI", name: "University of Ibadan", shortName: "UI", hasMap: false, locationState: "Oyo State", category: "Federal", city: "Ibadan" },
  { id: "UNILORIN", name: "University of Ilorin", shortName: "UNILORIN", hasMap: false, locationState: "Kwara State", category: "Federal", city: "Ilorin" },
  { id: "UNIJOS", name: "University of Jos", shortName: "UNIJOS", hasMap: false, locationState: "Plateau State", category: "Federal", city: "Jos" },
  { id: "UNILAG", name: "University of Lagos", shortName: "UNILAG", hasMap: false, locationState: "Lagos State", category: "Federal", city: "Akoka" },
  { id: "UNIMAID", name: "University of Maiduguri", shortName: "UNIMAID", hasMap: false, locationState: "Borno State", category: "Federal", city: "Maiduguri" },
  { id: "UNN", name: "University of Nigeria, Nsukka", shortName: "UNN", hasMap: false, locationState: "Enugu State", category: "Federal", city: "Nsukka" },
  { id: "UNIPORT", name: "University of Port Harcourt", shortName: "UNIPORT", hasMap: false, locationState: "Rivers State", category: "Federal", city: "Port Harcourt" },
  { id: "UNIUYO", name: "University of Uyo", shortName: "UNIUYO", hasMap: false, locationState: "Akwa Ibom State", category: "Federal", city: "Uyo" },
  { id: "UDUS-2", name: "Usmanu Danfodiyo University", shortName: "UDUS", hasMap: false, locationState: "Sokoto State", category: "Federal", city: "Sokoto" },
  { id: "UDUS", name: "Usmanu Danfodiyo University, Sokoto", shortName: "UDUS", hasMap: false, locationState: "Sokoto State", category: "Federal", city: "Sokoto" },
  { id: "YMSFUEK", name: "Yusuf Maitama Sule Federal University of Education, Kano", shortName: "YMSFUEK", hasMap: false, locationState: "Kano State", category: "Federal", city: "Kano" },
  { id: "AKUM", name: "Abdulkadir Kure University", shortName: "AKUM", hasMap: false, locationState: "Niger State", category: "State", city: "Minna" },
  { id: "ABSU", name: "Abia State University", shortName: "ABSU", hasMap: false, locationState: "Abia State", category: "State", city: "Uturu" },
  { id: "TECH-U", name: "Abiola Ajimobi Technical University", shortName: "TECH-U", hasMap: false, locationState: "Oyo State", category: "State", city: "Ibadan" },
  { id: "ADSU", name: "Adamawa State University", shortName: "ADSU", hasMap: false, locationState: "Adamawa State", category: "State", city: "Mubi" },
  { id: "AAUA", name: "Adekunle Ajasin University", shortName: "AAUA", hasMap: false, locationState: "Ondo State", category: "State", city: "Akungba-Akoko" },
  { id: "AKSU", name: "Akwa Ibom State University", shortName: "AKSU", hasMap: false, locationState: "Akwa Ibom State", category: "State", city: "Ikot Akpaden" },
  { id: "AKSU-2", name: "Akwa Ibom State University (formerly Akwa Ibom State University of Science and Technology)", shortName: "AKSU", hasMap: false, locationState: "Akwa Ibom State", category: "State", city: "Uyo" },
  { id: "ADUSTECH", name: "Aliko Dangote University of Science and Technology", shortName: "ADUSTECH", hasMap: false, locationState: "Kano State", category: "State", city: "Wudil" },
  { id: "AAU", name: "Ambrose Alli University", shortName: "AAU", hasMap: false, locationState: "Edo State", category: "State", city: "Ekpoma" },
  { id: "BOUESTI", name: "Bamidele Olumilua University of Education, Science and Tech", shortName: "BOUESTI", hasMap: false, locationState: "Ekiti State", category: "State", city: "Ikere-Ekiti" },
  { id: "BASUG", name: "Bauchi State University", shortName: "BASUG", hasMap: false, locationState: "Bauchi State", category: "State", city: "Gadau" },
  { id: "BMU", name: "Bayelsa Medical University", shortName: "BMU", hasMap: false, locationState: "Bayelsa State", category: "State", city: "Yenagoa" },
  { id: "BSU", name: "Benue State University", shortName: "BSU", hasMap: false, locationState: "Benue State", category: "State", city: "Makurdi" },
  { id: "BOSU", name: "Borno State University", shortName: "BOSU", hasMap: false, locationState: "Borno State", category: "State", city: "Maiduguri" },
  { id: "COOU", name: "Chukwuemeka Odumegwu Ojukwu University", shortName: "COOU", hasMap: false, locationState: "Anambra State", category: "State", city: "Uli" },
  { id: "ANSU", name: "Chukwuemeka Odumegwu Ojukwu University (formerly Anambra State University)", shortName: "ANSU", hasMap: false, locationState: "Anambra State", category: "State", city: "Uli" },
  { id: "CUSTECH", name: "Confluence University of Science and Technology", shortName: "CUSTECH", hasMap: false, locationState: "Kogi State", category: "State", city: "Osara" },
  { id: "UNICROSS", name: "Cross River University of Technology", shortName: "UNICROSS", hasMap: false, locationState: "Cross River State", category: "State", city: "Calabar" },
  { id: "DELSU", name: "Delta State University", shortName: "DELSU", hasMap: false, locationState: "Delta State", category: "State", city: "Abraka" },
  { id: "DSUST", name: "Delta State University of Science and Technology", shortName: "DSUST", hasMap: false, locationState: "Delta State", category: "State", city: "Ozoro" },
  { id: "DELSU-2", name: "Delta State University, Abraka", shortName: "DELSU", hasMap: false, locationState: "Delta State", category: "State", city: "Abraka" },
  { id: "DOU", name: "Dennis Osadebay University", shortName: "DOU", hasMap: false, locationState: "Delta State", category: "State", city: "Asaba" },
  { id: "EBSU", name: "Ebonyi State University", shortName: "EBSU", hasMap: false, locationState: "Ebonyi State", category: "State", city: "Abakaliki" },
  { id: "EDSU", name: "Edo State University, Uzairue", shortName: "EDSU", hasMap: false, locationState: "Edo State", category: "State", city: "Iyamho" },
  { id: "EKSU", name: "Ekiti State University", shortName: "EKSU", hasMap: false, locationState: "Ekiti State", category: "State", city: "Ado-Ekiti" },
  { id: "EAUED", name: "Emmanuel Alayande University of Education", shortName: "EAUED", hasMap: false, locationState: "Oyo State", category: "State", city: "Oyo" },
  { id: "EAUEDOYO", name: "Emmanuel Ayande University of Education", shortName: "EAUEDOYO", hasMap: false, locationState: "Oyo State", category: "State", city: "Oyo" },
  { id: "ESUT", name: "Enugu State University of Science and Technology", shortName: "ESUT", hasMap: false, locationState: "Enugu State", category: "State", city: "Enugu" },
  { id: "ESUT-2", name: "Enugu State University of Science and Technology (formerly Anambra State University of Technology)", shortName: "ESUT", hasMap: false, locationState: "Enugu State", category: "State", city: "Enugu" },
  { id: "GSU", name: "Gombe State University", shortName: "GSU", hasMap: false, locationState: "Gombe State", category: "State", city: "Gombe" },
  { id: "GSUST", name: "Gombe State University of Science and Technology", shortName: "GSUST", hasMap: false, locationState: "Gombe State", category: "State", city: "Kumo" },
  { id: "IBBU", name: "Ibrahim Badamasi Babangida University", shortName: "IBBU", hasMap: false, locationState: "Niger State", category: "State", city: "Lapai" },
  { id: "IAUE", name: "Ignatius Ajuru University of Education", shortName: "IAUE", hasMap: false, locationState: "Rivers State", category: "State", city: "Port Harcourt" },
  { id: "IMSU", name: "Imo State University", shortName: "IMSU", hasMap: false, locationState: "Imo State", category: "State", city: "Owerri" },
  { id: "KASU", name: "Kaduna State University", shortName: "KASU", hasMap: false, locationState: "Kaduna State", category: "State", city: "Kaduna" },
  { id: "KSUSTA", name: "Kebbi State University of Science and Technology", shortName: "KSUSTA", hasMap: false, locationState: "Kebbi State", category: "State", city: "Aliero" },
  { id: "KOMU", name: "Kingsley Ozumba Mbadiwe University", shortName: "KOMU", hasMap: false, locationState: "Imo State", category: "State", city: "Ideato South" },
  { id: "KSUK", name: "Kogi State University, Kabba", shortName: "KSUK", hasMap: false, locationState: "Kogi State", category: "State", city: "Kabba" },
  { id: "KWASU", name: "Kwara State University", shortName: "KWASU", hasMap: false, locationState: "Kwara State", category: "State", city: "Malete" },
  { id: "LAUTECH", name: "Ladoke Akintola University of Technology", shortName: "LAUTECH", hasMap: false, locationState: "Oyo State", category: "State", city: "Ogbomoso" },
  { id: "LASU", name: "Lagos State University", shortName: "LASU", hasMap: false, locationState: "Lagos State", category: "State", city: "Ojo" },
  { id: "LASUED", name: "Lagos State University of Education", shortName: "LASUED", hasMap: false, locationState: "Lagos State", category: "State", city: "Oto/Ijanikin" },
  { id: "LASUSTECH", name: "Lagos State University of Science and Technology", shortName: "LASUSTECH", hasMap: false, locationState: "Lagos State", category: "State", city: "Ikorodu" },
  { id: "NSUK", name: "Nasarawa State University", shortName: "NSUK", hasMap: false, locationState: "Nasarawa State", category: "State", city: "Keffi" },
  { id: "NDU", name: "Niger Delta University", shortName: "NDU", hasMap: false, locationState: "Bayelsa State", category: "State", city: "Wilberforce Island" },
  { id: "OOU", name: "Olabisi Onabanjo University", shortName: "OOU", hasMap: true, locationState: "Ogun State", category: "State", city: "Ago-Iwoye" },
  { id: "OAUSTECH", name: "Olusegun Agagu University of Science and Technology", shortName: "OAUSTECH", hasMap: false, locationState: "Ondo State", category: "State", city: "Okitipupa" },
  { id: "UNIOSUN", name: "Osun State University", shortName: "UNIOSUN", hasMap: false, locationState: "Osun State", category: "State", city: "Osogbo" },
  { id: "PLASU", name: "Plateau State University", shortName: "PLASU", hasMap: false, locationState: "Plateau State", category: "State", city: "Bokkos" },
  { id: "PAAU", name: "Prince Abubakar Audu University", shortName: "PAAU", hasMap: false, locationState: "Kogi State", category: "State", city: "Anyigba" },
  { id: "RSU", name: "Rivers State University", shortName: "RSU", hasMap: false, locationState: "Rivers State", category: "State", city: "Port Harcourt" },
  { id: "SSUES", name: "Shehu Shagari University of Education", shortName: "SSUES", hasMap: false, locationState: "Sokoto State", category: "State", city: "Sokoto" },
  { id: "SSU", name: "Sokoto State University", shortName: "SSU", hasMap: false, locationState: "Sokoto State", category: "State", city: "Sokoto" },
  { id: "SUMAS", name: "State University of Medical and Applied Sciences", shortName: "SUMAS", hasMap: false, locationState: "Enugu State", category: "State", city: "Igbo-Eno" },
  { id: "SLU", name: "Sule Lamido University", shortName: "SLU", hasMap: false, locationState: "Jigawa State", category: "State", city: "Kafin Hausa" },
  { id: "TASUED", name: "Tai Solarin University of Education", shortName: "TASUED", hasMap: false, locationState: "Ogun State", category: "State", city: "Ijagun" },
  { id: "TSU", name: "Taraba State University", shortName: "TSU", hasMap: false, locationState: "Taraba State", category: "State", city: "Jalingo" },
  { id: "UMYU", name: "Umaru Musa Yar’Adua University", shortName: "UMYU", hasMap: false, locationState: "Katsina State", category: "State", city: "Katsina" },
  { id: "UNICROSS-2", name: "University of Cross River State (formerly Cross River University of Technology)", shortName: "UNICROSS", hasMap: false, locationState: "Cross River State", category: "State", city: "Ekpo-Abasi, Calabar" },
  { id: "UNIDEL", name: "University of Delta", shortName: "UNIDEL", hasMap: false, locationState: "Delta State", category: "State", city: "Agbor" },
  { id: "UNIMED", name: "University of Medical Sciences, Ondo", shortName: "UNIMED", hasMap: false, locationState: "Ondo State", category: "State", city: "Ondo" },
  { id: "YSU", name: "Yobe State University", shortName: "YSU", hasMap: false, locationState: "Yobe State", category: "State", city: "Damaturu" },
  { id: "YMSUK", name: "Yusuf Maitama Sule University", shortName: "YMSUK", hasMap: false, locationState: "Kano State", category: "State", city: "Kano" },
  { id: "YUMSUK", name: "Yusuf Maitama Sule University Kano", shortName: "YUMSUK", hasMap: false, locationState: "Kano State", category: "State", city: "Kano" },
  { id: "ZAMSU", name: "Zamfara State University", shortName: "ZAMSU", hasMap: false, locationState: "Zamfara State", category: "State", city: "Talata Mafara" },
  { id: "AC", name: "Achievers University", shortName: "AC", hasMap: false, locationState: "Ondo State", category: "Private", city: "Owo" },
  { id: "AUE", name: "Adeleke University", shortName: "AUE", hasMap: false, locationState: "Osun State", category: "Private", city: "Ede" },
  { id: "ADMIRALTY", name: "Admiralty University of Nigeria", shortName: "Admiralty", hasMap: false, locationState: "Delta State", category: "Private", city: "Ibusa" },
  { id: "ABUAD", name: "Afe Babalola University", shortName: "ABUAD", hasMap: false, locationState: "Ekiti State", category: "Private", city: "Ado-Ekiti" },
  { id: "AUST", name: "African University of Science and Technology", shortName: "AUST", hasMap: false, locationState: "Federal Capital Territory", category: "Private", city: "Abuja" },
  { id: "APU", name: "Ahman Pategi University", shortName: "APU", hasMap: false, locationState: "Kwara State", category: "Private", city: "Pategi" },
  { id: "ACU", name: "Ajayi Crowther University", shortName: "ACU", hasMap: false, locationState: "Oyo State", category: "Private", city: "Oyo" },
  { id: "AUM", name: "Al-Ansar University Maiduguri", shortName: "AUM", hasMap: false, locationState: "Borno State", category: "Private", city: "Maiduguri" },
  { id: "AHU", name: "Al-Hikmah University", shortName: "AHU", hasMap: false, locationState: "Kwara State", category: "Private", city: "Ilorin" },
  { id: "AL-ISTIQAMA", name: "Al-Istiqama University", shortName: "Al-Istiqama", hasMap: false, locationState: "Kano State", category: "Private", city: "Sumaila" },
  { id: "AL-MUHIBBAH", name: "Al-Muhibbah Open University", shortName: "Al-Muhibbah", hasMap: false, locationState: "Federal Capital Territory", category: "Private", city: "Abuja" },
  { id: "AUK", name: "Al-Qalam University", shortName: "AUK", hasMap: false, locationState: "Katsina State", category: "Private", city: "Katsina" },
  { id: "AUN", name: "American University of Nigeria", shortName: "AUN", hasMap: false, locationState: "Adamawa State", category: "Private", city: "Yola" },
  { id: "ANAN", name: "ANAN University", shortName: "ANAN", hasMap: false, locationState: "Plateau State", category: "Private", city: "Kwall" },
  { id: "AU", name: "Anchor University", shortName: "AU", hasMap: false, locationState: "Lagos State", category: "Private", city: "Ayobo" },
  { id: "AJU", name: "Arthur Jarvis University", shortName: "AJU", hasMap: false, locationState: "Cross River State", category: "Private", city: "Akpabuyo" },
  { id: "ATIBA", name: "Atiba University", shortName: "Atiba", hasMap: false, locationState: "Oyo State", category: "Private", city: "Oyo" },
  { id: "AUGUSTINE", name: "Augustine University", shortName: "Augustine", hasMap: false, locationState: "Lagos State", category: "Private", city: "Ilara-Epe" },
  { id: "AMU", name: "Ave Maria University", shortName: "AMU", hasMap: false, locationState: "Nasarawa State", category: "Private", city: "Piyanko" },
  { id: "AZMAN", name: "Azman University", shortName: "Azman", hasMap: false, locationState: "Kano State", category: "Private", city: "Kano" },
  { id: "BABA-AHMED", name: "Baba-Ahmed University", shortName: "Baba-Ahmed", hasMap: false, locationState: "Kano State", category: "Private", city: "Kano" },
  { id: "BU", name: "Babcock University", shortName: "BU", hasMap: false, locationState: "Ogun State", category: "Private", city: "Ilishan-Remo" },
  { id: "BAZE", name: "Baze University", shortName: "BAZE", hasMap: false, locationState: "Federal Capital Territory", category: "Private", city: "Abuja" },
  { id: "BUT", name: "Bells University of Technology", shortName: "BUT", hasMap: false, locationState: "Ogun State", category: "Private", city: "Ota" },
  { id: "BIU", name: "Benson Idahosa University", shortName: "BIU", hasMap: false, locationState: "Edo State", category: "Private", city: "Benin City" },
  { id: "BHU", name: "Bingham University", shortName: "BHU", hasMap: false, locationState: "Nasarawa State", category: "Private", city: "Karu" },
  { id: "BU-2", name: "Bowen University", shortName: "BU", hasMap: false, locationState: "Osun State", category: "Private", city: "Iwo" },
  { id: "CUL", name: "Caleb University", shortName: "CUl", hasMap: false, locationState: "Lagos State", category: "Private", city: "Ikorodu" },
  { id: "CAPITALCITY", name: "Capital City University", shortName: "Capital City", hasMap: false, locationState: "Kano State", category: "Private", city: "Kano" },
  { id: "CU", name: "Caritas University", shortName: "CU", hasMap: false, locationState: "Enugu State", category: "Private", city: "Enugu" },
  { id: "CCU", name: "CETEP City University", shortName: "CCU", hasMap: false, locationState: "Lagos State", category: "Private", city: "Yaba" },
  { id: "CLU", name: "Chrisland University", shortName: "CLU", hasMap: false, locationState: "Ogun State", category: "Private", city: "Abeokuta" },
  { id: "CU-2", name: "Christopher University", shortName: "CU", hasMap: false, locationState: "Ogun State", category: "Private", city: "Mowe" },
  { id: "CLU-2", name: "Clifford University", shortName: "CLU", hasMap: false, locationState: "Abia State", category: "Private", city: "Owerrinta" },
  { id: "CCU-2", name: "Coal City University", shortName: "CCU", hasMap: false, locationState: "Enugu State", category: "Private", city: "Enugu" },
  { id: "COSMOPOLITAN", name: "Cosmopolitan University", shortName: "Cosmopolitan", hasMap: false, locationState: "Federal Capital Territory", category: "Private", city: "Abuja" },
  { id: "CU-3", name: "Covenant University", shortName: "CU", hasMap: false, locationState: "Ogun State", category: "Private", city: "Ota" },
  { id: "CU-4", name: "Crawford University", shortName: "CU", hasMap: false, locationState: "Ogun State", category: "Private", city: "Igbesa" },
  { id: "CU-5", name: "Crescent University", shortName: "CU", hasMap: false, locationState: "Ogun State", category: "Private", city: "Abeokuta" },
  { id: "CROWNHILL", name: "Crown-Hill University", shortName: "Crown-Hill", hasMap: false, locationState: "Kwara State", category: "Private", city: "Eyenkorin" },
  { id: "DOMINICAN", name: "Dominican University", shortName: "Dominican", hasMap: false, locationState: "Oyo State", category: "Private", city: "Ibadan" },
  { id: "DUI", name: "Dominican University Ibadan", shortName: "DUI", hasMap: false, locationState: "Oyo State", category: "Private", city: "Ibadan" },
  { id: "EDUSOKO", name: "Edusoko University", shortName: "Edusoko", hasMap: false, locationState: "Niger State", category: "Private", city: "Bida" },
  { id: "ECU", name: "Edwin Clark University", shortName: "ECU", hasMap: false, locationState: "Delta State", category: "Private", city: "Kiagbodo" },
  { id: "EKOUNIV", name: "Eko University of Medicine and Health Sciences", shortName: "Eko Uni", hasMap: false, locationState: "Lagos State", category: "Private", city: "Ijanikin" },
  { id: "EU", name: "Elizade University", shortName: "EU", hasMap: false, locationState: "Ondo State", category: "Private", city: "Ilara-Mokin" },
  { id: "EUN", name: "European University of Nigeria", shortName: "EUN", hasMap: false, locationState: "Federal Capital Territory", category: "Private", city: "Abuja" },
  { id: "EVANGEL", name: "Evangel University", shortName: "Evangel", hasMap: false, locationState: "Ebonyi State", category: "Private", city: "Akaeze" },
  { id: "EUA", name: "Evangel University, Akaeze", shortName: "EUA", hasMap: false, locationState: "Ebonyi State", category: "Private", city: "Akaeze" },
  { id: "FUO", name: "Fountain University", shortName: "FUO", hasMap: false, locationState: "Osun State", category: "Private", city: "Osogbo" },
  { id: "FRANCO-BRITISH", name: "Franco-British International University", shortName: "FBIU", hasMap: false, locationState: "Kaduna State", category: "Private", city: "Kaduna" },
  { id: "GOU", name: "Godfrey Okoye University", shortName: "GOU", hasMap: false, locationState: "Enugu State", category: "Private", city: "Enugu" },
  { id: "GFU", name: "Greenfield University", shortName: "GFU", hasMap: false, locationState: "Kaduna State", category: "Private", city: "Kaduna" },
  { id: "GUU", name: "Gregory University", shortName: "GUU", hasMap: false, locationState: "Abia State", category: "Private", city: "Uturu" },
  { id: "HU", name: "Hallmark University", shortName: "HU", hasMap: false, locationState: "Ogun State", category: "Private", city: "Ijebu-Itele" },
  { id: "HU-2", name: "Hezekiah University", shortName: "HU", hasMap: false, locationState: "Imo State", category: "Private", city: "Umudi" },
  { id: "HUST", name: "Hillside University of Science and Technology", shortName: "HUST", hasMap: false, locationState: "Ekiti State", category: "Private", city: "Okemesi" },
  { id: "IUO", name: "Igbinedion University", shortName: "IUO", hasMap: false, locationState: "Edo State", category: "Private", city: "Okada" },
  { id: "JHU", name: "James Hope University, Lagos", shortName: "JHU", hasMap: false, locationState: "Lagos State", category: "Private", city: "Lekki" },
  { id: "JABU", name: "Joseph Ayo Babalola University", shortName: "JABU", hasMap: false, locationState: "Osun State", category: "Private", city: "Ikeji-Arakeji" },
  { id: "KARLKUMM", name: "Karl Kumm University", shortName: "Karl Kumm", hasMap: false, locationState: "Plateau State", category: "Private", city: "Vom" },
  { id: "KUM", name: "Khadija University", shortName: "KUM", hasMap: false, locationState: "Jigawa State", category: "Private", city: "Majia" },
  { id: "KU", name: "Kings University", shortName: "KU", hasMap: false, locationState: "Osun State", category: "Private", city: "Odeomu" },
  { id: "KU-2", name: "Koladaisi University", shortName: "KU", hasMap: false, locationState: "Oyo State", category: "Private", city: "Ibadan" },
  { id: "KU-3", name: "Kwararafa University", shortName: "KU", hasMap: false, locationState: "Taraba State", category: "Private", city: "Wukari" },
  { id: "LU", name: "Landmark University", shortName: "LU", hasMap: false, locationState: "Kwara State", category: "Private", city: "Omu-Aran" },
  { id: "LCU", name: "Lead City University", shortName: "LCU", hasMap: false, locationState: "Oyo State", category: "Private", city: "Ibadan" },
  { id: "LEGACY", name: "Legacy University", shortName: "Legacy", hasMap: false, locationState: "Anambra State", category: "Private", city: "Okija" },
  { id: "LUO", name: "Legacy University Okija", shortName: "LUO", hasMap: false, locationState: "Anambra State", category: "Private", city: "Okija" },
  { id: "MU", name: "Madonna University", shortName: "MU", hasMap: false, locationState: "Rivers State", category: "Private", city: "Elele" },
  { id: "MADUKA", name: "Maduka University", shortName: "Maduka", hasMap: false, locationState: "Enugu State", category: "Private", city: "Ekwegbe" },
  { id: "MARANATHA", name: "Maranatha University", shortName: "Maranatha", hasMap: false, locationState: "Imo State", category: "Private", city: "Mgbidi" },
  { id: "MAAUN", name: "Maryam Abacha American University of Nigeria", shortName: "MAAUN", hasMap: false, locationState: "Kano State", category: "Private", city: "Kano" },
  { id: "MCU", name: "McPherson University", shortName: "MCU", hasMap: false, locationState: "Ogun State", category: "Private", city: "Seriki-Setayo" },
  { id: "MEWAR", name: "Mewar International University", shortName: "Mewar", hasMap: false, locationState: "Nasarawa State", category: "Private", city: "Masaka" },
  { id: "MU-2", name: "Mewar University", shortName: "MU", hasMap: false, locationState: "Nasarawa State", category: "Private", city: "Masaka" },
  { id: "MCIU", name: "Michael and Cecilia Ibru University", shortName: "MCIU", hasMap: false, locationState: "Delta State", category: "Private", city: "Agbara-Otor" },
  { id: "MIVA", name: "Miva Open University", shortName: "Miva", hasMap: false, locationState: "Federal Capital Territory", category: "Private", city: "Abuja" },
  { id: "MTU", name: "Mountain Top University", shortName: "MTU", hasMap: false, locationState: "Ogun State", category: "Private", city: "Makogi Oba" },
  { id: "MU-3", name: "Mudiame University", shortName: "MU", hasMap: false, locationState: "Edo State", category: "Private", city: "Irrua" },
  { id: "NEWGATE", name: "Newgate University", shortName: "Newgate", hasMap: false, locationState: "Niger State", category: "Private", city: "Minna" },
  { id: "NUTM", name: "Nigerian University of Technology and Management", shortName: "NUTM", hasMap: false, locationState: "Lagos State", category: "Private", city: "Apapa" },
  { id: "NUN", name: "Nile University of Nigeria", shortName: "NUN", hasMap: false, locationState: "Federal Capital Territory", category: "Private", city: "Abuja" },
  { id: "NUK", name: "Nok University Kachia", shortName: "NUK", hasMap: false, locationState: "Kaduna State", category: "Private", city: "Kachia" },
  { id: "NU", name: "Novena University", shortName: "NU", hasMap: false, locationState: "Delta State", category: "Private", city: "Ogume" },
  { id: "OU", name: "Obong University", shortName: "OU", hasMap: false, locationState: "Akwa Ibom State", category: "Private", city: "Obong Ntak" },
  { id: "OUI", name: "Oduduwa University", shortName: "OUI", hasMap: false, locationState: "Osun State", category: "Private", city: "Ipetumodu" },
  { id: "PUOMS", name: "PAMO University of Medical Sciences", shortName: "PUoMS", hasMap: false, locationState: "Rivers State", category: "Private", city: "Port Harcourt" },
  { id: "PAU", name: "Pan-Atlantic University", shortName: "PAU", hasMap: false, locationState: "Lagos State", category: "Private", city: "Lekki" },
  { id: "PU", name: "Paul University", shortName: "PU", hasMap: false, locationState: "Anambra State", category: "Private", city: "Awka" },
  { id: "PUE", name: "Peaceland University", shortName: "PUE", hasMap: false, locationState: "Enugu State", category: "Private", city: "Enugu" },
  { id: "PENRESOURCE", name: "Pen Resource University", shortName: "Pen Resource", hasMap: false, locationState: "Gombe State", category: "Private", city: "Gombe" },
  { id: "PHILOMATH", name: "Philomath University", shortName: "Philomath", hasMap: false, locationState: "Federal Capital Territory", category: "Private", city: "Kuje" },
  { id: "PCU", name: "Precious Cornerstone University", shortName: "PCU", hasMap: false, locationState: "Oyo State", category: "Private", city: "Ibadan" },
  { id: "RUN-2", name: "Redeemer's University", shortName: "RUN", hasMap: false, locationState: "Osun State", category: "Private", city: "Ede" },
  { id: "RUN", name: "Redeemer's University Nigeria", shortName: "RUN", hasMap: false, locationState: "Osun State", category: "Private", city: "Ede" },
  { id: "RU", name: "Renaissance University", shortName: "RU", hasMap: false, locationState: "Enugu State", category: "Private", city: "Ugbawka" },
  { id: "RU-2", name: "Rhema University", shortName: "RU", hasMap: false, locationState: "Abia State", category: "Private", city: "Aba" },
  { id: "RU-3", name: "Ritman University", shortName: "RU", hasMap: false, locationState: "Akwa Ibom State", category: "Private", city: "Ikot Ekpene" },
  { id: "SU", name: "Salem University", shortName: "SU", hasMap: false, locationState: "Kogi State", category: "Private", city: "Lokoja" },
  { id: "SMU", name: "Sam Maris University", shortName: "SMU", hasMap: false, locationState: "Ondo State", category: "Private", city: "Supare" },
  { id: "SAU", name: "Samuel Adegboyega University", shortName: "SAU", hasMap: false, locationState: "Edo State", category: "Private", city: "Ogwa" },
  { id: "SUN", name: "Skyline University", shortName: "SUN", hasMap: false, locationState: "Kano State", category: "Private", city: "Kano" },
  { id: "SKYLINE", name: "Skyline University Nigeria", shortName: "Skyline", hasMap: false, locationState: "Kano State", category: "Private", city: "Kano" },
  { id: "SOUTHWESTERN", name: "Southwestern University", shortName: "Southwestern", hasMap: false, locationState: "Ogun State", category: "Private", city: "Okun-Owa" },
  { id: "SPORTUNI", name: "Sports University of Nigeria", shortName: "Sports Uni", hasMap: false, locationState: "Delta State", category: "Private", city: "Idumuje-Ugboko" },
  { id: "SU-2", name: "Summit University", shortName: "SU", hasMap: false, locationState: "Kwara State", category: "Private", city: "Offa" },
  { id: "TANSIAN", name: "Tansian University", shortName: "Tansian", hasMap: false, locationState: "Anambra State", category: "Private", city: "Umunya" },
  { id: "TAU", name: "Thomas Adewumi University", shortName: "TAU", hasMap: false, locationState: "Kwara State", category: "Private", city: "Oko" },
  { id: "TOPFAITH", name: "Topfaith University", shortName: "Topfaith", hasMap: false, locationState: "Akwa Ibom State", category: "Private", city: "Mkpatak" },
  { id: "TRINITY", name: "Trinity University", shortName: "Trinity", hasMap: false, locationState: "Lagos State", category: "Private", city: "Yaba" },
  { id: "UOMCHU", name: "University of Mkar (formerly called Hilltop University)", shortName: "UoM(cHU", hasMap: false, locationState: "Benue State", category: "Private", city: "Mkar" },
  { id: "VENITE", name: "Venite University", shortName: "Venite", hasMap: false, locationState: "Ekiti State", category: "Private", city: "Iloro-Ekiti" },
  { id: "VERITAS", name: "Veritas University", shortName: "Veritas", hasMap: false, locationState: "Federal Capital Territory", category: "Private", city: "Bwari" },
  { id: "VUNA", name: "Veritas University (Catholic University of Nigeria) Abuja", shortName: "VUNA", hasMap: false, locationState: "Federal Capital Territory", category: "Private", city: "Bwari" },
  { id: "WELLSPRING", name: "Wellspring University", shortName: "Wellspring", hasMap: false, locationState: "Edo State", category: "Private", city: "Benin City" },
  { id: "WUO", name: "Wesley University", shortName: "WUO", hasMap: false, locationState: "Ondo State", category: "Private", city: "Ondo" },
  { id: "WDU", name: "Western Delta University", shortName: "WDU", hasMap: false, locationState: "Delta State", category: "Private", city: "Oghara" },
  { id: "WUI", name: "Westland University", shortName: "WUI", hasMap: false, locationState: "Osun State", category: "Private", city: "Iwo" },
  { id: "WIGWE", name: "Wigwe University", shortName: "Wigwe", hasMap: false, locationState: "Rivers State", category: "Private", city: "Isiokpo" },
];

export function getInstitutionsByCategory(category: 'Federal' | 'State' | 'Private'): Institution[] {
  return SUPPORTED_INSTITUTIONS.filter((inst) => inst.category === category);
}

export function getInstitutionsByState(state: string): Institution[] {
  return SUPPORTED_INSTITUTIONS.filter(
    (inst) => inst.locationState.toLowerCase() === state.toLowerCase()
  );
}

export function getInstitutionById(id: string): Institution | undefined {
  if (!id) return undefined;
  const normalized = id.toLowerCase();
  return SUPPORTED_INSTITUTIONS.find(
    (inst) => inst.id.toLowerCase() === normalized || inst.shortName.toLowerCase() === normalized
  );
}

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

export interface InteractiveChoices {
  title?: string;
  multiSelect?: boolean;
  options: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    venueCode: string;
  };
  profileUpdatedBadge?: string;
  interactiveChoices?: InteractiveChoices;
  generatedQuiz?: QuizData;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

export interface PeerStudent {
  id: string;
  name: string;
  avatarUrl?: string;
  institutionCode: string;
  institutionName: string;
  department: string;
  level: string;
  isOnline: boolean;
  verified: boolean;
  stringAccountId?: string;
  bio?: string;
}

export interface PeerDirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  type?: 'text' | 'quiz_share' | 'voice_note' | 'note_attachment';
  voiceUrl?: string;
  voiceDurationSeconds?: number;
  sharedQuizData?: QuizData;
  isRead?: boolean;
}

export interface CampusStudySquad {
  id: string;
  name: string;
  topic: string;
  courseCode: string;
  institutionCode: string;
  memberCount: number;
  lastActive: string;
  isPublic: boolean;
  tags: string[];
}
