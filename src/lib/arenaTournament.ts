/**
 * Cohart Campus Arena & Collegiate Tournament Engine
 * Multi-Stage Academic Competitions with Payouts at Every Stage,
 * Live Spectator Streaming, and Specialized University Leagues.
 */

export type TournamentStage = 'coursemates' | 'department' | 'faculty' | 'national_collegiate';

export interface TournamentStageConfig {
  stage: TournamentStage;
  title: string;
  scope: string;
  payoutDescription: string;
  cashPrizeNgn: number;
  bonusTones: number;
  format: string;
}

export const TOURNAMENT_STAGES: Record<TournamentStage, TournamentStageConfig> = {
  coursemates: {
    stage: 'coursemates',
    title: 'Stage 1: Coursemate Clash',
    scope: 'Direct class & level coursemates',
    payoutDescription: 'Instant airtime/data pack + cash bonus + 200 Study Tones',
    cashPrizeNgn: 2500,
    bonusTones: 200,
    format: '10-Question Rapid Speed Quiz on current course syllabus',
  },
  department: {
    stage: 'department',
    title: 'Stage 2: Departmental Derby',
    scope: 'Departments within the same faculty',
    payoutDescription: 'Direct bank transfer cash prize + Verified Departmental Champion Badge',
    cashPrizeNgn: 10000,
    bonusTones: 600,
    format: 'Multi-course buzzer round & theoretical accuracy battle',
  },
  faculty: {
    stage: 'faculty',
    title: 'Stage 3: Faculty Championship',
    scope: 'All faculties campus-wide',
    payoutDescription: 'Major cash jackpot + Semester Pro Pass + Faculty Trophy',
    cashPrizeNgn: 30000,
    bonusTones: 1500,
    format: 'Inter-disciplinary grand finals with live student spectators',
  },
  national_collegiate: {
    stage: 'national_collegiate',
    title: 'Stage 4: National Collegiate League',
    scope: 'Inter-University (School vs School across Nigeria & beyond)',
    payoutDescription: 'Grand collegiate cash purse + Tech gear + National Scholar Plaque',
    cashPrizeNgn: 100000,
    bonusTones: 5000,
    format: 'Live broadcasted varsity tournament across specialized school leagues',
  },
};

/**
 * Specialized School Groupings for fair, specialized academic competitions
 */
export interface SchoolSpecializationLeague {
  id: string;
  name: string;
  description: string;
  focusDisciplines: string[];
  schools: Array<{ code: string; name: string }>;
}

export const SPECIALIZED_SCHOOL_LEAGUES: SchoolSpecializationLeague[] = [
  {
    id: 'tech_consortium',
    name: 'Technology & Engineering Consortium (Tech League)',
    description: 'Specialized universities of technology competing in pure science, computing, and engineering',
    focusDisciplines: ['Computer Science', 'Software Engineering', 'Mechanical', 'Electrical/Electronics', 'Civil Engineering', 'Applied Physics'],
    schools: [
      { code: 'FUTO', name: 'Federal University of Technology, Owerri' },
      { code: 'FUTA', name: 'Federal University of Technology, Akure' },
      { code: 'FUTMINNA', name: 'Federal University of Technology, Minna' },
      { code: 'LAUTECH', name: 'Ladoke Akintola University of Technology' },
      { code: 'CUSTECH', name: 'Confluence University of Science and Technology' },
      { code: 'AFIT', name: 'Air Force Institute of Technology' },
    ],
  },
  {
    id: 'agriculture_consortium',
    name: 'Agricultural Sciences & Bio-Resources League',
    description: 'Universities of agriculture focusing on agrarian economics, veterinary medicine, and bio-tech',
    focusDisciplines: ['Agric Economics', 'Agronomy', 'Animal Science', 'Veterinary Medicine', 'Food Science'],
    schools: [
      { code: 'FUNAAB', name: 'Federal University of Agriculture, Abeokuta' },
      { code: 'FUAM', name: 'Joseph Sarwuan Tarka University (formerly FUAM Makurdi)' },
      { code: 'MOUAU', name: 'Michael Okpara University of Agriculture, Umudike' },
    ],
  },
  {
    id: 'health_medical_league',
    name: 'Medical & Health Sciences Collegiate Circle',
    description: 'Specialized healthcare institutions and medical colleges',
    focusDisciplines: ['Medicine & Surgery', 'Pharmacy', 'Nursing Science', 'Medical Laboratory Science', 'Physiology'],
    schools: [
      { code: 'BMU', name: 'Bayelsa Medical University' },
      { code: 'FUHSO', name: 'Federal University of Health Sciences, Otukpo' },
      { code: 'FUHSI', name: 'Federal University of Health Sciences, Ila-Orangun' },
    ],
  },
  {
    id: 'comprehensive_state_federal',
    name: 'Comprehensive Varsity League (Federal & State)',
    description: 'Traditional universities with balanced humanities, social sciences, management, and physical sciences',
    focusDisciplines: ['Law', 'Economics', 'Accounting', 'Political Science', 'Mass Communication', 'Sciences'],
    schools: [
      { code: 'OOU', name: 'Olabisi Onabanjo University' },
      { code: 'UNILAG', name: 'University of Lagos' },
      { code: 'UI', name: 'University of Ibadan' },
      { code: 'OAU', name: 'Obafemi Awolowo University' },
      { code: 'LASU', name: 'Lagos State University' },
      { code: 'UNN', name: 'University of Nigeria, Nsukka' },
      { code: 'UNIBEN', name: 'University of Benin' },
      { code: 'UNILORIN', name: 'University of Ilorin' },
      { code: 'ABU', name: 'Ahmadu Bello University' },
    ],
  },
  {
    id: 'private_varsity_circuit',
    name: 'Private Universities Championship Circuit',
    description: 'Private higher institutions competing in business, tech, law, and international relations',
    focusDisciplines: ['Business Administration', 'Economics', 'Computer Science', 'Law', 'International Relations'],
    schools: [
      { code: 'CU', name: 'Covenant University' },
      { code: 'BU', name: 'Babcock University' },
      { code: 'ABUAD', name: 'Afe Babalola University' },
      { code: 'BOWEN', name: 'Bowen University' },
      { code: 'PAU', name: 'Pan-Atlantic University' },
    ],
  },
];

/**
 * Mock Live Matches for Spectator Streaming Interface
 */
export interface LiveArenaMatch {
  id: string;
  stage: TournamentStage;
  stageTitle: string;
  schoolLeague: string;
  teamA: {
    name: string;
    institution: string;
    department: string;
    score: number;
    avatarUrl?: string;
  };
  teamB: {
    name: string;
    institution: string;
    department: string;
    score: number;
    avatarUrl?: string;
  };
  currentQuestion: string;
  secondsRemaining: number;
  liveViewersCount: number;
  isLive: boolean;
  prizePoolNgn: number;
}

export const SAMPLE_LIVE_MATCHES: LiveArenaMatch[] = [
  {
    id: 'match_tech_finals',
    stage: 'national_collegiate',
    stageTitle: 'Stage 4: National Collegiate Finals',
    schoolLeague: 'Technology & Engineering Consortium',
    teamA: {
      name: 'FUTO Engineering Titans',
      institution: 'FUTO',
      department: 'Mechanical Engineering',
      score: 8,
    },
    teamB: {
      name: 'FUTA Cyber Hawks',
      institution: 'FUTA',
      department: 'Computer Science',
      score: 7,
    },
    currentQuestion: 'In thermodynamic cycles, what is the maximum theoretical efficiency formula for a Carnot heat engine?',
    secondsRemaining: 18,
    liveViewersCount: 1420,
    isLive: true,
    prizePoolNgn: 100000,
  },
  {
    id: 'match_oou_sms_clash',
    stage: 'department',
    stageTitle: 'Stage 2: Departmental Derby',
    schoolLeague: 'Comprehensive Varsity League',
    teamA: {
      name: 'OOU Economics Bulls',
      institution: 'OOU',
      department: 'Economics',
      score: 5,
    },
    teamB: {
      name: 'OOU Accounting Masters',
      institution: 'OOU',
      department: 'Accounting',
      score: 4,
    },
    currentQuestion: 'Define the cross-price elasticity of demand when two goods are perfect substitutes.',
    secondsRemaining: 24,
    liveViewersCount: 540,
    isLive: true,
    prizePoolNgn: 10000,
  },
];
