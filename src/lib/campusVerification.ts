export interface NigerianUniversity {
  code: string;
  name: string;
  shortName: string;
  state: string;
  mainCampus: string;
  badgeColor: string;
}

export interface CampusInsiderQuestion {
  id: string;
  institutionCode: string;
  question: string;
  expectedKeywords: string[];
  nearMissKeywords?: string[];
  nearMissNudge: string;
  bluffChallenge: string;
  bluffConfirmationWords: string[]; // words user uses to reject the bluff, e.g. "no", "not green", "orange"
  fallbackQuestion: {
    question: string;
    expectedKeywords: string[];
  };
}

export const NIGERIAN_UNIVERSITIES: NigerianUniversity[] = [
  {
    code: 'OOU',
    name: 'Olabisi Onabanjo University',
    shortName: 'OOU',
    state: 'Ogun State',
    mainCampus: 'Ago-Iwoye Main Campus',
    badgeColor: '#0B57D0',
  },
  {
    code: 'UNILAG',
    name: 'University of Lagos',
    shortName: 'UNILAG',
    state: 'Lagos State',
    mainCampus: 'Akoka Campus, Yaba',
    badgeColor: '#9333EA',
  },
  {
    code: 'UI',
    name: 'University of Ibadan',
    shortName: 'UI',
    state: 'Oyo State',
    mainCampus: 'Ibadan Main Campus',
    badgeColor: '#D97706',
  },
  {
    code: 'OAU',
    name: 'Obafemi Awolowo University',
    shortName: 'OAU',
    state: 'Osun State',
    mainCampus: 'Ile-Ife Campus',
    badgeColor: '#2563EB',
  },
  {
    code: 'FUTA',
    name: 'Federal University of Technology, Akure',
    shortName: 'FUTA',
    state: 'Ondo State',
    mainCampus: 'Obanla / Obakekere',
    badgeColor: '#059669',
  },
  {
    code: 'LASU',
    name: 'Lagos State University',
    shortName: 'LASU',
    state: 'Lagos State',
    mainCampus: 'Ojo Main Campus',
    badgeColor: '#0284C7',
  },
  {
    code: 'UNILORIN',
    name: 'University of Ilorin',
    shortName: 'UNILORIN',
    state: 'Kwara State',
    mainCampus: 'PS Campus, Ilorin',
    badgeColor: '#4F46E5',
  },
  {
    code: 'COVENANT',
    name: 'Covenant University',
    shortName: 'Covenant',
    state: 'Ogun State',
    mainCampus: 'Canaanland, Ota',
    badgeColor: '#DC2626',
  },
];

export const CAMPUS_INSIDER_QUESTIONS: Record<string, CampusInsiderQuestion[]> = {
  OOU: [
    {
      id: 'oou_shuttle_buses',
      institutionCode: 'OOU',
      question:
        'Who sponsored or donated the internal campus shuttle buses used for student transportation inside Ago-Iwoye PS, and what are the exact paint colors of those buses?',
      expectedKeywords: ['sug', 'union', 'yellow', 'orange', 'blue'],
      nearMissKeywords: ['yellow', 'orange', 'blue', 'bus', 'student union'],
      nearMissNudge:
        'You are very close! Did you mean orange, or what is the second stripe color on those SUG buses?',
      bluffChallenge:
        'Wait a minute... aren\'t those campus shuttle buses painted green and white like federal buses? Are you sure?',
      bluffConfirmationWords: [
        'no',
        'not green',
        'orange',
        'yellow',
        'blue',
        'never',
        'wrong',
        'definitely orange',
        'definitely yellow',
        'lie',
        'nah',
      ],
      fallbackQuestion: {
        question:
          'What is the popular food and bread/beans spot right by Motion Ground beside LLT called?',
        expectedKeywords: ['motion', 'new motion', 'mama', 'beans', 'bread'],
      },
    },
    {
      id: 'oou_motion_ground',
      institutionCode: 'OOU',
      question:
        'What major lecture theatre complex is located directly opposite New Motion ground shops on the southern campus road?',
      expectedKeywords: ['llt', 'llt 3', 'llt3', 'law', 'lecture theatre'],
      nearMissKeywords: ['llt', 'theatre', 'law'],
      nearMissNudge:
        'You\'re right there! Which specific LLT number is right by Motion Ground?',
      bluffChallenge:
        'Hold on, isn\'t LLT 3 located way up north near the Sports Stadium? Are you sure?',
      bluffConfirmationWords: ['no', 'south', 'motion', 'not north', 'wrong', 'near motion'],
      fallbackQuestion: {
        question:
          'What are the colors of the town tricycles (keke) that drop students at OOU Main Gate?',
        expectedKeywords: ['yellow', 'blue'],
      },
    },
  ],
  UNILAG: [
    {
      id: 'unilag_shuttle_colors',
      institutionCode: 'UNILAG',
      question:
        'What color are the internal campus shuttle buses running from UNILAG Main Gate, and which major student hall quad do they drop students at?',
      expectedKeywords: ['yellow', 'green', 'new hall', 'hall'],
      nearMissKeywords: ['yellow', 'new hall', 'shuttle'],
      nearMissNudge:
        'You are almost there! What color stripes are on the yellow shuttles, and where do they drop off?',
      bluffChallenge:
        'Wait, aren\'t those campus shuttles painted red and white like Lagos BRT buses? Are you sure?',
      bluffConfirmationWords: ['no', 'yellow', 'green', 'not red', 'danfo', 'never', 'wrong'],
      fallbackQuestion: {
        question:
          'What is the famous waterfront chill spot right behind the Senate Building called?',
        expectedKeywords: ['lagoon', 'front', 'lagoon front'],
      },
    },
  ],
  UI: [
    {
      id: 'ui_campus_cabs',
      institutionCode: 'UI',
      question:
        'What distinct color scheme are the campus cabs and micras that run from UI Main Gate down to SUB, and what is the central square near the Student Union building?',
      expectedKeywords: ['blue', 'yellow', 'sub', 'pitch', 'kunle'],
      nearMissKeywords: ['blue', 'yellow', 'sub'],
      nearMissNudge:
        'Very close! What is the traditional Ibadan taxi color combo, or what is the square by SUB?',
      bluffChallenge:
        'Wait, aren\'t the campus cabs painted green and white like Abuja taxis? Are you sure?',
      bluffConfirmationWords: ['no', 'blue', 'yellow', 'not green', 'ibadan', 'wrong', 'nah'],
      fallbackQuestion: {
        question:
          'What is the popular campus name of the Student Union Building named after a student martyr?',
        expectedKeywords: ['kunle', 'adepeju', 'sub'],
      },
    },
  ],
  OAU: [
    {
      id: 'oau_spider_building',
      institutionCode: 'OAU',
      question:
        'What architectural feature gave the Natural History Museum its famous nickname on campus, and what is the open asphalt field where students converge called?',
      expectedKeywords: ['spider', 'legs', 'motion', 'ground', 'motion ground'],
      nearMissKeywords: ['spider', 'motion'],
      nearMissNudge:
        'Almost there! Think of the eight-legged shape and the name of the open convergence ground.',
      bluffChallenge:
        'Wait, isn\'t Motion Ground outside campus along Road 1 in Ife town? Are you sure?',
      bluffConfirmationWords: ['no', 'inside', 'campus', 'sub', 'wrong', 'never', 'nah'],
      fallbackQuestion: {
        question:
          'What do Great Ife students shout together when power is restored in the halls at night?',
        expectedKeywords: ['aro', 'great ife', 'ife'],
      },
    },
  ],
  FUTA: [
    {
      id: 'futa_gates_and_shuttles',
      institutionCode: 'FUTA',
      question:
        'What are the names of the two main entry gates of FUTA, and what are the two main campuses students commute between?',
      expectedKeywords: ['north', 'south', 'obanla', 'obakekere'],
      nearMissKeywords: ['north', 'south', 'obanla'],
      nearMissNudge:
        'You\'re right on it! Which two directional gates, and which campuses (Obanla and ...)?',
      bluffChallenge:
        'Wait, isn\'t Obanla the pre-degree site and Obakekere the main campus with Senate? Are you sure?',
      bluffConfirmationWords: ['no', 'obanla is main', 'reverse', 'wrong', 'nah'],
      fallbackQuestion: {
        question: 'What color are the official campus shuttle buses in FUTA?',
        expectedKeywords: ['blue', 'green', 'white'],
      },
    },
  ],
  LASU: [
    {
      id: 'lasu_shuttle_colors',
      institutionCode: 'LASU',
      question:
        'What are the colors of the campus shuttle buses that run from Iyana-Iba main gate into LASU Ojo campus?',
      expectedKeywords: ['blue', 'white'],
      nearMissKeywords: ['blue'],
      nearMissNudge:
        'Very close! What is the secondary accent color alongside blue on those shuttles?',
      bluffChallenge:
        'Wait, aren\'t those shuttles painted yellow and black like regular Lagos Danfos? Are you sure?',
      bluffConfirmationWords: ['no', 'blue', 'white', 'not yellow', 'wrong', 'never'],
      fallbackQuestion: {
        question:
          'What is the name of the busy expressway market gate where students enter LASU Ojo?',
        expectedKeywords: ['iyana', 'iba', 'iyana-iba'],
      },
    },
  ],
};

export function getRandomCampusQuestion(institutionCode: string): CampusInsiderQuestion {
  const code = institutionCode.toUpperCase();
  const list = CAMPUS_INSIDER_QUESTIONS[code] || CAMPUS_INSIDER_QUESTIONS.OOU;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

export interface VerificationEvaluation {
  status: 'correct' | 'near_miss' | 'incorrect' | 'bluff_rejected';
  feedbackText: string;
  bluffPrompt?: string;
  nudgePrompt?: string;
  isVerified: boolean;
}

export function evaluateCampusAnswer(
  question: CampusInsiderQuestion,
  answer: string,
  isAnsweringBluff = false
): VerificationEvaluation {
  const clean = answer.toLowerCase().trim();

  // If we are currently evaluating the user's response to the bluff
  if (isAnsweringBluff) {
    const rejectedBluff = question.bluffConfirmationWords.some((w) => clean.includes(w));
    if (rejectedBluff) {
      return {
        status: 'bluff_rejected',
        feedbackText: `Real campus insider confirmed. You rejected the bluff with confidence. Welcome to ${question.institutionCode}!`,
        isVerified: true,
      };
    } else {
      return {
        status: 'incorrect',
        feedbackText: 'That seemed hesitant or uncertain. Real students know their campus by heart.',
        isVerified: false,
      };
    }
  }

  // Count matching expected keywords
  const matchedExpected = question.expectedKeywords.filter((k) => clean.includes(k));
  const matchedNearMiss = (question.nearMissKeywords || []).filter((k) => clean.includes(k));

  // If user matched sufficient expected keywords (at least 2, or 1 if single keyword)
  const isCorrect =
    matchedExpected.length >= Math.min(2, question.expectedKeywords.length);

  if (isCorrect) {
    return {
      status: 'correct',
      feedbackText: 'Great answer! But let us verify your true campus conviction...',
      bluffPrompt: question.bluffChallenge,
      isVerified: false,
    };
  }

  // If user matched at least 1 keyword or near-miss
  if (matchedExpected.length >= 1 || matchedNearMiss.length >= 1) {
    return {
      status: 'near_miss',
      feedbackText: question.nearMissNudge,
      nudgePrompt: question.nearMissNudge,
      isVerified: false,
    };
  }

  return {
    status: 'incorrect',
    feedbackText: `Not quite. Real campus insider tip: try this backup question: "${question.fallbackQuestion.question}"`,
    isVerified: false,
  };
}
