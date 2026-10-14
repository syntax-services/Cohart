import { ReaderChapter } from './types';

export interface CourseBook {
  id: string;
  courseCode: string;
  title: string;
  subtitle: string;
  department: string;
  faculty: string;
  level: string;
  institutionScope: string; // 'ALL' or specific university code
  units: number;
  author: string;
  coverIllustration: string;
  description: string;
  nucCcmasTopicStandards: string[];
  chapters: ReaderChapter[];
}

export const SUPPORTED_BOOKS: CourseBook[] = [
  // 1. GST 101: USE OF ENGLISH & COMMUNICATION SKILLS
  {
    id: 'book_gst_101',
    courseCode: 'GST 101',
    title: 'Use of English & Communication Skills',
    subtitle: 'Concord, Lexis & Structure, Phonetics & Exam Traps',
    department: 'General Studies',
    faculty: 'General Studies Unit',
    level: '100L',
    institutionScope: 'ALL',
    units: 2,
    author: 'Senate Committee on General Studies & Language Curriculum',
    coverIllustration: '/illustrations/stickman_study.jpg',
    description: 'Statutory compulsory course for all Nigerian university undergraduates. Covers Subject-Verb agreement rules, stress patterns, silent consonants, and past Senate CBT questions.',
    nucCcmasTopicStandards: [
      'Concord & Subject-Verb Agreement',
      'Lexis & Structure',
      'Primary Stress & Phonetics',
      'Reading Comprehension Techniques',
      'Sentence Structure & Common Errors',
    ],
    chapters: [
      {
        id: 'chap_gst101_concord',
        courseCode: 'GST 101',
        title: 'Subject-Verb Concord: The 10 Traps Lecturers Set',
        subtitle: 'Proximity, correlated conjunctions, and collective nouns',
        readTimeMinutes: 5,
        paragraphs: [
          'In university Use of English examinations, concord questions account for over 35% of the objective CBT section. The most common pitfall occurs when intervening phrases separate the subject from the verb. Phrases introduced by "as well as", "together with", "in conjunction with", "accompanied by", and "in addition to" are parenthetical and do NOT compound the subject. For example, "The Vice-Chancellor, together with the Deans, is [not are] arriving today."',
          'The Rule of Proximity applies strictly to correlated conjunctions: "either... or", "neither... nor", and "not only... but also". In these constructions, the verb agrees solely with the subject closest to it. Example: "Neither the lecturer nor the students were in the theatre", but "Neither the students nor the lecturer was in the theatre". In exam questions, lecturers deliberately place plural nouns adjacent to singular subjects to trigger reflexive errors.',
          'Indefinite pronouns such as "each", "everyone", "everybody", "neither", "either", and "someone" take strictly singular verbs, regardless of any following prepositional phrase. For instance, "Each of the thirty faculties has [not have] submitted their timetable." When qualified by "one of those who", however, relative pronoun concord dictates that the verb takes the plural form: "He is one of those scholars who study [not studies] overnight."',
          'Mathematical quantities, sums of money, periods of time, and distance measurements represent single unitary concepts and require singular verbs. For example, "Fifty thousand naira is [not are] sufficient for course registration," and "Ten kilometres is a long distance to trek from Main Gate to PS Park."',
          'OOU & UNILAG Past Exam Insight: Look out for words ending in "-s" that are singular in meaning (e.g. "News", "Physics", "Economics", "Measles", "Innings"). "The news regarding hostel allocation was [not were] broadcast at noon."',
        ],
        checkpoints: [
          {
            id: 'chk_gst101_1',
            paragraphIndex: 1,
            prompt: 'Senate Exam Drill: Select the grammatically correct option: "Neither the Departmental President nor his executives _____ present at the faculty congress."',
            options: [
              'was',
              'were',
              'is',
              'are being',
            ],
            correctIndex: 1,
            explanation: 'Correct! By the Rule of Proximity, the verb agrees with the nearer subject "his executives" (plural), requiring "were".',
          },
          {
            id: 'chk_gst101_2',
            paragraphIndex: 2,
            prompt: 'Quick Check: Choose the correct verb: "Every student in the three newly accredited departments _____ registered for the GST CBT exam."',
            options: [
              'have',
              'has',
              'were',
              'are',
            ],
            correctIndex: 1,
            explanation: 'Correct! "Every" makes the subject singular regardless of the intervening plural prepositional phrase ("in the three departments"), requiring "has".',
          },
        ],
      },
      {
        id: 'chap_gst101_phonetics',
        courseCode: 'GST 101',
        title: 'Phonetics & Stress Patterns: Scoring 100% on Oral English',
        subtitle: 'Primary stress rules, noun-verb homographs, and silent letters',
        readTimeMinutes: 5,
        paragraphs: [
          'In Nigerian university oral English tests, the most reliable scoring rule is the Noun-Verb Stress Shift for two-syllable homographs. When a two-syllable word functions as a noun or adjective, the primary stress falls on the FIRST syllable. When it functions as a verb, the stress shifts to the SECOND syllable. Example: RE-cord (noun) vs re-CORD (verb); CON-duct (noun) vs con-DUCT (verb); PRO-duce (noun) vs pro-DUCE (verb).',
          'Words ending in the suffixes "-tion", "-sion", "-ic", and "-ical" always take the primary stress on the penultimate (second-to-last) syllable. For example: edu-CA-tion, eco-NO-mic, demo-CRA-tic, com-pre-HEN-sion. Memorizing suffix rules eliminates guesswork for over 80% of multisyllabic stress questions.',
          'Words ending in "-ate", "-fy", "-ise/-ize", and "-ity" take primary stress on the antepenultimate (third syllable from the end). Examples: com-MU-ni-cate, e-LEC-tri-fy, CRIT-i-cise, uni-VER-si-ty, op-por-TU-ni-ty.',
          'Silent letters in English orthography are heavily tested in 100L general examinations. Key exam words include: "subtle" (silent b), "debt" (silent b), "receipt" (silent p), "indict" (pronounced in-DITE; silent c), "debris" (silent s), "sword" (silent w), and "parliament" (silent i, pronounced PAR-la-ment).',
        ],
        checkpoints: [
          {
            id: 'chk_gst101_p1',
            paragraphIndex: 0,
            prompt: 'Exam Question: In the sentence "The Senate will record the minutes", which syllable of RECORD carries primary stress?',
            options: [
              'First syllable: RE-cord',
              'Second syllable: re-CORD',
              'Both syllables equally',
              'Neither syllable',
            ],
            correctIndex: 1,
            explanation: 'Correct! "Record" functions as a verb here ("will record"), so the primary stress shifts to the second syllable: re-CORD.',
          },
        ],
      },
    ],
  },

  // 2. GST 102: PHILOSOPHY, LOGIC & HUMAN EXISTENCE
  {
    id: 'book_gst_102',
    courseCode: 'GST 102',
    title: 'Philosophy, Logic & Human Existence',
    subtitle: 'Informal Fallacies, Syllogisms, Epistemology & Arguments',
    department: 'Philosophy & General Studies',
    faculty: 'Faculty of Arts',
    level: '100L',
    institutionScope: 'ALL',
    units: 2,
    author: 'Department of Philosophy & Logic Research Council',
    coverIllustration: '/illustrations/stickman_law_sketch_1791420401642.jpg',
    description: 'Essential grounding in formal and informal logic, branches of philosophy, fallacies, categorical propositions, and deductive validity for university examinations.',
    nucCcmasTopicStandards: [
      'Branches of Philosophy (Epistemology, Metaphysics, Ethics, Logic)',
      'Structure of Arguments (Premises & Conclusions)',
      'Informal Fallacies (Ad Hominem, Strawman, Equivocation, etc.)',
      'Categorical Syllogisms & Truth Tables',
      'Deductive vs Inductive Reasoning',
    ],
    chapters: [
      {
        id: 'chap_gst102_fallacies',
        courseCode: 'GST 102',
        title: 'Informal Fallacies: Identifying False Logic in Exam MCQs',
        subtitle: 'Fallacies of relevance, presumption, and ambiguity',
        readTimeMinutes: 5,
        paragraphs: [
          'An informal fallacy is an error in reasoning resulting from defects in content or context rather than purely invalid formal structure. In GST 102 exams, identifying specific Latin-named fallacies is compulsory. The most common is Argumentum ad Hominem (attack against the person), where an arguer attacks their opponent\'s character, tribe, or background rather than refuting their argument. Example: "Disregard the candidate\'s proposal on tuition fees; he is merely an undisciplined fresher."',
          'Argumentum ad Populum (appeal to the people / bandwagon fallacy) occurs when a conclusion is urged as true simply because the majority of people believe or practice it. Argumentum ad Baculum (appeal to force/threat) substitutes coercion or intimidation for logical evidence: "Accept the proposed departmental fee, or your continuous assessment marks will be withheld."',
          'The Straw Man fallacy involves misrepresenting, exaggerating, or oversimplifying an opponent\'s position to make it easier to knock down. Example: "Those advocating for online lecture recordings want students to completely stop attending classes and destroy university discipline."',
          'Petitio Principii (Begging the Question / Circular Reasoning) assumes the very conclusion it seeks to prove within the premises. Example: "Freedom of speech is essential for national democracy because an enlightened populace must be permitted to speak without state censorship."',
          'Fallacy of Equivocation arises when an ambiguous word or phrase is used in two different senses within the same argument. Example: "A feather is light. What is light cannot be dark. Therefore, a feather cannot be dark."',
        ],
        checkpoints: [
          {
            id: 'chk_gst102_f1',
            paragraphIndex: 0,
            prompt: 'Identify the fallacy: "Senator Adeleke says the state budget should allocate 30% to student loans, but how can we listen to a man who failed his university examinations?"',
            options: [
              'Argumentum ad Populum',
              'Argumentum ad Hominem',
              'Post Hoc Ergo Propter Hoc',
              'Fallacy of Composition',
            ],
            correctIndex: 1,
            explanation: 'Correct! This attacks the person\'s past academic record rather than analyzing the budgetary proposal, constituting an ad Hominem attack.',
          },
        ],
      },
    ],
  },

  // 3. MAT 101: GENERAL MATHEMATICS I (ALGEBRA & TRIGONOMETRY)
  {
    id: 'book_mat_101',
    courseCode: 'MAT 101',
    title: 'General Mathematics I: Algebra & Trigonometry',
    subtitle: 'Quadratic Theory, Binomial Theorem, Matrices, Determinants & Sets',
    department: 'Mathematics',
    faculty: 'Faculty of Science',
    level: '100L',
    institutionScope: 'ALL',
    units: 3,
    author: 'Prof. J. O. Alabi & Dr. M. E. Adeleke',
    coverIllustration: '/illustrations/stickman_tech_sketch_1791420335091.jpg',
    description: 'Foundational algebra curriculum for Science, Engineering, Agriculture, and Economics freshmen. Step-by-step proofs, discriminants, and matrix determinants.',
    nucCcmasTopicStandards: [
      'Theory of Quadratic Equations & Symmetric Functions of Roots',
      'Binomial Theorem for Rational and Integer Indices',
      'Matrices, Determinants & Cramer\'s Rule',
      'Complex Numbers & De Moivre\'s Theorem',
      'Trigonometric Identities & Compound Angles',
    ],
    chapters: [
      {
        id: 'chap_mat101_quadratic',
        courseCode: 'MAT 101',
        title: 'Quadratic Equations & Symmetric Functions of Roots',
        subtitle: 'Mastering alpha, beta substitutions and discriminant conditions',
        readTimeMinutes: 5,
        paragraphs: [
          'For any standard quadratic equation ax² + bx + c = 0 where a ≠ 0, with roots α and β, the fundamental relationships derived from Vieta\'s formulas are: Sum of roots α + β = -b/a, and Product of roots αβ = c/a. In university degree examinations, lecturers rarely ask you to merely solve for x; instead, they test symmetric expressions in α and β.',
          'The most frequently tested symmetric function is α² + β². To evaluate this without solving for individual roots, expand (α + β)² = α² + 2αβ + β². Rearranging gives the identity: α² + β² = (α + β)² - 2αβ = (-b/a)² - 2(c/a) = (b² - 2ac)/a². Memorizing this identity saves crucial minutes during timed examinations.',
          'For higher powers: α³ + β³ = (α + β)(α² - αβ + β²) = (α + β)[(α + β)² - 3αβ]. Another common question asks to form a new quadratic equation whose roots are 1/α and 1/β. The new sum is (1/α + 1/β) = (α + β)/αβ = (-b/a)/(c/a) = -b/c. The new product is (1/α)(1/β) = 1/αβ = a/c. Thus, the new equation is cx² + bx + a = 0 (simply reversing the coefficients of the original equation).',
          'Discriminant conditions determine the nature of roots: Δ = b² - 4ac. If Δ > 0, roots are real and distinct. If Δ = 0, roots are real and equal (a perfect square condition, often tested to solve for unknown parameter k). If Δ < 0, roots are complex conjugate pairs.',
        ],
        checkpoints: [
          {
            id: 'chk_mat101_q1',
            paragraphIndex: 1,
            prompt: 'Senate Exam Drill: If α and β are the roots of 2x² - 5x + 3 = 0, find the exact value of α² + β².',
            options: [
              '13/4',
              '25/4',
              '19/4',
              '7/4',
            ],
            correctIndex: 0,
            explanation: 'Correct! α + β = 5/2, αβ = 3/2. Using α² + β² = (α + β)² - 2αβ = (25/4) - 2(3/2) = 25/4 - 12/4 = 13/4.',
          },
        ],
      },
    ],
  },

  // 4. LAW 101: INTRODUCTION TO NIGERIAN LEGAL SYSTEM
  {
    id: 'book_law_101',
    courseCode: 'LAW 101',
    title: 'Introduction to Nigerian Legal System & Legal Methods',
    subtitle: 'Sources of Nigerian Law, Judicial Precedent, Hierarchy of Courts & Customary Law',
    department: 'Law',
    faculty: 'Faculty of Law',
    level: '100L',
    institutionScope: 'ALL',
    units: 4,
    author: 'Faculty of Law Academic Board',
    coverIllustration: '/illustrations/stickman_law_sketch_1791420401642.jpg',
    description: 'Comprehensive analysis of the Nigerian legal framework, the doctrine of Stare Decisis, validity tests for customary law, and statutory interpretation.',
    nucCcmasTopicStandards: [
      'Sources of Nigerian Law (Legislation, English Law, Customary Law, Judicial Precedent)',
      'The Doctrine of Judicial Precedent (Stare Decisis)',
      'Ratio Decidendi vs Obiter Dictum',
      'Customary Law Validity Tests (Repugnancy, Incompatibility, Public Policy)',
      'Hierarchy of Courts & Appellate Jurisdiction',
    ],
    chapters: [
      {
        id: 'chap_law101_sources',
        courseCode: 'LAW 101',
        title: 'Sources of Nigerian Law & Judicial Precedent (Stare Decisis)',
        subtitle: 'Ratio decidendi, obiter dictum, and the binding hierarchy of courts',
        readTimeMinutes: 6,
        paragraphs: [
          'The Nigerian legal system is pluralistic, derived from three primary formal sources: Nigerian Legislation (the 1999 Constitution as amended, Acts of the National Assembly, Laws of State Houses of Assembly), Received English Law, and Customary Law (including Islamic Law / Sharia). By Section 1(1) and (3) of the 1999 Constitution, the Constitution is supreme; any other law that is inconsistent with its provisions is void to the extent of its inconsistency.',
          'Received English Law comprises three historical elements: English Common Law, Doctrines of Equity, and Statutes of General Application (SOGA) that were in force in England as of January 1, 1900. Where Common Law conflicts with the Doctrines of Equity, Equity prevails (reaffirming the historic Earl of Oxford\'s Case of 1615).',
          'Customary Law represents the indigenous customs and usages of the varied ethnic nationalities in Nigeria. Before any rule of customary law can be enforced by a court of law, it must pass three statutory validity tests: (1) The Repugnancy Test: it must not be repugnant to natural justice, equity, and good conscience (see Edet v. Essien); (2) The Incompatibility Test: it must not be incompatible with any written law in force; and (3) The Public Policy Test.',
          'The Doctrine of Judicial Precedent (Stare Decisis et non quieta movere - stand by things decided) establishes that lower courts are strictly bound by the decisions of superior courts. The Supreme Court of Nigeria stands at the apex; its decisions bind all courts in Nigeria, including the Court of Appeal, the Federal High Court, and State High Courts. The Supreme Court is not bound by its own prior decisions and may depart from them in rare cases where the previous decision was reached per incuriam (through lack of care) or causes gross injustice (see Bronik Motors v. Wema Bank).',
          'Only the Ratio Decidendi (the legal principle or rationale that forms the necessary basis for the court\'s ultimate decision) is legally binding on lower courts. An Obiter Dictum (a remark said by the way) is merely persuasive and lacks binding authority.',
        ],
        checkpoints: [
          {
            id: 'chk_law101_1',
            paragraphIndex: 2,
            prompt: 'Examination Question: In Nigerian Law, which test renders a native custom unenforceable if it violates universal human decency and equity?',
            options: [
              'The Incompatibility Test',
              'The Repugnancy Test',
              'The Public Policy Test',
              'The Precedent Test',
            ],
            correctIndex: 1,
            explanation: 'Correct! The Repugnancy Test requires that no customary law shall be enforced if it is repugnant to natural justice, equity, and good conscience.',
          },
          {
            id: 'chk_law101_2',
            paragraphIndex: 4,
            prompt: 'Quick Check: Which part of a judicial decision creates binding precedent for lower courts in Nigeria?',
            options: [
              'The Obiter Dictum',
              'The Summary of Counsel\'s arguments',
              'The Ratio Decidendi',
              'The Per Incuriam footnote',
            ],
            correctIndex: 2,
            explanation: 'Correct! Only the Ratio Decidendi (the legal reason for the decision) carries binding authority under Stare Decisis.',
          },
        ],
      },
    ],
  },
];

export function getAllSupportedBooks(): CourseBook[] {
  return SUPPORTED_BOOKS;
}

export function getBookById(id: string): CourseBook | undefined {
  return SUPPORTED_BOOKS.find((b) => b.id === id);
}

export function getBookByCourseCode(code: string): CourseBook | undefined {
  const clean = code.trim().toUpperCase().replace(/\s+/g, '');
  return SUPPORTED_BOOKS.find((b) => b.courseCode.toUpperCase().replace(/\s+/g, '') === clean);
}

export function getBookContextPrompt(bookId: string): string {
  const book = getBookById(bookId);
  if (!book) return '';

  return `[ENROLLED COURSE TEXTBOOK & SYLLABUS CONTEXT]:
Course: ${book.courseCode} - ${book.title} (${book.units} Units)
Faculty/Dept: ${book.faculty} • ${book.department} (${book.level})
Accredited Topics: ${book.nucCcmasTopicStandards.join(', ')}
Chapters Available: ${book.chapters.map((c) => c.title).join('; ')}
Provide authoritative, syllabus-grounded academic tutoring aligned strictly with Nigerian university examination requirements.`;
}
