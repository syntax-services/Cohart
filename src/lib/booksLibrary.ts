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
  // 1. ECONOMICS (ECO 201)
  {
    id: 'book_eco_201',
    courseCode: 'ECO 201',
    title: 'Principles of Microeconomics II',
    subtitle: 'Market Structures, Game Theory & Oligopolistic Competition',
    department: 'Economics',
    faculty: 'Social & Management Sciences',
    level: '200L',
    institutionScope: 'ALL',
    units: 3,
    author: 'Prof. A. Adeleke & Dr. K. Balogun',
    coverIllustration: '/illustrations/stickman_study.jpg',
    description: 'Comprehensive analysis of imperfect competition, Cournot and Bertrand oligopolies, game theory, and consumer welfare dynamics in emerging market economies.',
    nucCcmasTopicStandards: ['Oligopoly Models', 'Cournot Equilibrium', 'Bertrand Price War', 'Kinked Demand Curve', 'Game Theory & Nash Equilibrium'],
    chapters: [
      {
        id: 'chap_eco_201_oligopoly',
        courseCode: 'ECO 201',
        title: 'Cournot Competition: How a Few Big Companies Compete',
        subtitle: 'How rival companies choose how much to produce by watching each other',
        readTimeMinutes: 4,
        paragraphs: [
          'In business and economics, an oligopoly simply means a market where only a few big companies control everything. Unlike a monopoly where one single company is in charge, or a regular market where hundreds of small traders sell, here the few big companies must carefully watch what each other is doing before making any move.',
          'An economist named Augustin Cournot explained this simply: instead of fighting only on prices, companies choose how much goods (quantity) to produce at the same time. Each company looks at how much its rival is likely to produce, and then decides its own best production amount to make maximum profit.',
          'We see this in Nigeria every day with cement and telecom companies. Think of MTN and Airtel, or Dangote Cement and BUA. If Dangote decides to produce 10,000 bags of cement in Ogun State, BUA looks at that amount and decides how many bags they should supply so the market is not overflooded and prices do not crash.',
          'When each company\'s decision balances out and neither of them wants to change how much they are producing, economists call this the Cournot Equilibrium. At this point, the market stays stable, but consumers usually pay higher prices than if there were many small competitors.',
          'Because there are only a few big players, they often keep prices higher than what it actually costs to make the product. That is why government consumer protection agencies watch these big companies closely to make sure they do not secretly agree to cheat buyers or fix high prices.',
        ],
        checkpoints: [
          {
            id: 'chk_eco_1',
            paragraphIndex: 2,
            prompt: 'Quick Check: In Cournot competition, what do the rival companies choose simultaneously?',
            options: [
              'The retail consumer price',
              'Their production quantity output',
              'Their billboard advertisement budget',
              'The location of their head office',
            ],
            correctIndex: 1,
            explanation: 'Correct! In Cournot competition, companies decide how much quantity to produce simultaneously, observing rival output.',
          },
          {
            id: 'chk_eco_2',
            paragraphIndex: 4,
            prompt: 'Quick Check: What is the Cournot Equilibrium state in economic theory?',
            options: [
              'When both companies merge into one monopoly',
              'A stable point where neither firm wants to alter their chosen output amount',
              'When production costs exceed total revenue',
              'When prices collapse to zero naira',
            ],
            correctIndex: 1,
            explanation: 'Correct! At Cournot Equilibrium, each firm\'s output choice is an optimal response to the other firm\'s output.',
          },
        ],
      },
      {
        id: 'chap_eco_201_bertrand',
        courseCode: 'ECO 201',
        title: 'Bertrand Competition: Direct Price Wars Between Rivals',
        subtitle: 'What happens when companies fight by cutting prices to win customers',
        readTimeMinutes: 4,
        paragraphs: [
          'Another economist named Joseph Bertrand had a different idea from Cournot. He said that in many markets, companies do not fight over how much to produce—they fight directly over prices. When two companies sell the exact same product and it costs buyers nothing to switch, buyers will always rush to whoever sells cheaper.',
          'This leads to a direct price war. If Company A sells pure water or data subscriptions slightly cheaper than Company B, almost all customers will leave Company B and buy from Company A. So Company B is forced to drop its price even lower to survive.',
          'If this price war continues, both companies will keep cutting prices until the price drops all the way down to what it actually costs them to make the product (Marginal Cost). At this point, profit becomes zero. Economists call this the "Bertrand Paradox" because even though there are only two companies, the price ends up as low as in a market with a thousand sellers.',
          'In real Nigerian markets, companies usually avoid this zero-profit trap by making their products a bit different, building brand trust, offering better customer service, or because people live closer to one shop than another.',
        ],
        checkpoints: [
          {
            id: 'chk_eco_b1',
            paragraphIndex: 2,
            prompt: 'Quick Check: What happens in a pure Bertrand price war when goods are identical?',
            options: [
              'Prices skyrocket to monopoly peaks',
              'Prices drop down to marginal cost of production, leaving zero economic profit',
              'Both firms exit the state immediately',
              'Government fixes maximum quantities',
            ],
            correctIndex: 1,
            explanation: 'Correct! The Bertrand Paradox states that pure price cuts push prices down to marginal cost (P = MC).',
          },
        ],
      },
    ],
  },

  // 2. COMPUTER SCIENCE (CSC 201)
  {
    id: 'book_csc_201',
    courseCode: 'CSC 201',
    title: 'Structured Programming & Algorithmic Logic',
    subtitle: 'Python, Sequential Logic, Pointers & Problem Solving',
    department: 'Computer Science',
    faculty: 'Computing & Sciences',
    level: '200L',
    institutionScope: 'ALL',
    units: 3,
    author: 'Dr. S. O. Ogundele & Engr. T. Balogun',
    coverIllustration: '/illustrations/stickman_tech.jpg',
    description: 'Foundational guide to procedural programming, data structures, recursion, and time complexity tailored to Nigerian University computing curricula.',
    nucCcmasTopicStandards: ['Structured Programming', 'Memory Pointers', 'Array vs Linked Lists', 'Time Complexity (Big-O)', 'Recursion & Stack Frames'],
    chapters: [
      {
        id: 'chap_csc_201_algo',
        courseCode: 'CSC 201',
        title: 'Algorithmic Thinking & Step-by-Step Problem Decomposition',
        subtitle: 'Breaking complex problems into precise, computer-executable recipes',
        readTimeMinutes: 5,
        paragraphs: [
          'An algorithm is not magic—it is simply a finite, unambiguous sequence of steps to solve a specific problem. Think of it like a recipe for making Jollof rice: if you change the order of adding water and frying the tomato paste, the result changes completely.',
          'In computer programming, computers do not possess human intuition. Every step must be stated with strict precision. Before writing a single line of Python, C, or Java code, a software engineer designs the algorithm using pseudocode or flowcharts.',
          'A good algorithm must satisfy three fundamental properties: it must be correct (produce the right output), it must be finite (always terminate after a certain number of steps), and it must be efficient (use minimal computing time and memory).',
          'In Nigerian banking apps, for example, when an instant bank transfer is initiated, the system executes an atomic transaction algorithm: verifying the sender\'s account balance, locking the funds, crediting the receiver\'s bank switch, and logging an audit trail.',
        ],
        checkpoints: [
          {
            id: 'chk_csc_1',
            paragraphIndex: 2,
            prompt: 'Quick Check: What are the three non-negotiable properties of an algorithm?',
            options: [
              'Fast typing, colorful graphics, and cloud hosting',
              'Correctness, finiteness, and computational efficiency',
              'Randomness, infinite loops, and heavy RAM consumption',
              'Database encryption, internet connection, and user login',
            ],
            correctIndex: 1,
            explanation: 'Correct! An algorithm must always be correct, finite (must terminate), and efficient.',
          },
        ],
      },
      {
        id: 'chap_csc_201_complexity',
        courseCode: 'CSC 201',
        title: 'Time & Space Complexity: Understanding Big-O Notation',
        subtitle: 'Why fast code matters when handling millions of university records',
        readTimeMinutes: 5,
        paragraphs: [
          'Imagine searching for a student\'s matriculation number among 50,000 students. If you check each student folder one by one from the first to the last, that is Linear Search. In computer science, we say its time complexity is O(n), where n is the total number of students.',
          'Now imagine the folders are sorted in numerical order. You can open right in the middle, see if your target is higher or lower, and cut the search space in half each time. This is Binary Search, and its time complexity is O(log n). For 50,000 students, binary search takes at most 16 comparisons instead of 50,000!',
          'Big-O notation measures how the running time or memory usage of an algorithm grows as the size of the input data increases. It does not measure seconds on a stopwatch, but the rate of growth of operations.',
          'When designing university portal systems or banking engines, selecting an O(n log n) sorting algorithm over an O(n^2) nested loop is the difference between a page loading in 50 milliseconds or crashing the entire server under exam registration traffic.',
        ],
        checkpoints: [
          {
            id: 'chk_csc_2',
            paragraphIndex: 1,
            prompt: 'Quick Check: If a list of 50,000 student names is sorted, which search algorithm is most efficient?',
            options: [
              'Linear search checking every name',
              'Binary search cutting search space in half (O(log n))',
              'Bubble sort repeated scanning',
              'Randomized guessing',
            ],
            correctIndex: 1,
            explanation: 'Correct! Binary search operates in O(log n) time, drastically reducing search comparisons from 50,000 to around 16.',
          },
        ],
      },
    ],
  },

  // 3. LAW (PUL 201)
  {
    id: 'book_pul_201',
    courseCode: 'PUL 201',
    title: 'Constitutional Law I: Foundations of Governance',
    subtitle: 'Supremacy of the Constitution, Separation of Powers & Judicial Review',
    department: 'Law',
    faculty: 'Law',
    level: '200L',
    institutionScope: 'ALL',
    units: 4,
    author: 'Prof. J. O. Akande & Barr. M. Adeleke',
    coverIllustration: '/illustrations/stickman_law.jpg',
    description: 'Comprehensive study of constitutional theory, rule of law, institutional checks and balances, and fundamental human rights under the 1999 Constitution of the Federal Republic of Nigeria.',
    nucCcmasTopicStandards: ['Constitutional Supremacy', 'Separation of Powers', 'Rule of Law (Dicey Concept)', 'Judicial Review & Marbury v. Madison', 'Fundamental Rights (Chapter IV)'],
    chapters: [
      {
        id: 'chap_pul_201_supremacy',
        courseCode: 'PUL 201',
        title: 'The Principle of Constitutional Supremacy in Nigeria',
        subtitle: 'Why the Constitution is the supreme groundnorm and overrides any contradictory law',
        readTimeMinutes: 5,
        paragraphs: [
          'In constitutional jurisprudence, the constitution is the organic fundamental law from which all organs of government derive their existence and validity. Unlike the United Kingdom which practices Parliamentary Sovereignty where Parliament can make or unmake any law, Nigeria operates Constitutional Supremacy.',
          'This doctrine is firmly enshrined in Section 1, Subsection 1 of the 1999 Constitution of Nigeria, which boldly declares that "This Constitution is supreme and its provisions shall have binding force on all authorities and persons throughout the Federal Republic of Nigeria."',
          'Section 1, Subsection 3 reinforces this by providing that if any other law enacted by the National Assembly or a State House of Assembly is inconsistent with the provisions of this Constitution, this Constitution shall prevail, and that other law shall to the extent of the inconsistency be null and void.',
          'In the landmark case of Attorney-General of Ondo State v. Attorney-General of the Federation (2002), the Supreme Court emphasized that neither the President nor any Governor can exercise power outside the express boundaries granted by the supreme Constitution.',
        ],
        checkpoints: [
          {
            id: 'chk_law_1',
            paragraphIndex: 2,
            prompt: 'Quick Check: What is the legal consequence under Section 1(3) if a state law contradicts the 1999 Constitution?',
            options: [
              'The state law supersedes the Constitution automatically',
              'The state law is null, void, and of no legal effect to the extent of its inconsistency',
              'The Governor rewrites the Constitution',
              'The case is sent to the United Nations',
            ],
            correctIndex: 1,
            explanation: 'Correct! Under Section 1(3), the Constitution prevails and any inconsistent enactment is null and void to the extent of the inconsistency.',
          },
        ],
      },
      {
        id: 'chap_pul_201_powers',
        courseCode: 'PUL 201',
        title: 'Separation of Powers & The Baron de Montesquieu Doctrine',
        subtitle: 'How dividing state power prevents tyranny and protects democratic liberty',
        readTimeMinutes: 5,
        paragraphs: [
          'The doctrine of Separation of Powers was famously articulated by the French jurist Baron de Montesquieu in his 1748 work, "The Spirit of the Laws." Montesquieu warned that when legislative and executive powers are united in the same person or body, there can be no liberty, because apprehension may arise lest the monarch enact tyrannical laws to execute them tyrannically.',
          'Under the Nigerian 1999 Constitution, governmental authority is split across three distinct arms: Section 4 vests legislative powers in the National Assembly and State Houses of Assembly; Section 5 vests executive powers in the President and Governors; and Section 6 vests judicial powers in the Courts of Judicature.',
          'However, in modern practice, total separation is neither possible nor desirable. Instead, the constitution introduces Checks and Balances: the Legislature enacts laws but the President must assent; the President appoints judges but the Senate must confirm; and the Courts possess the power of Judicial Review to strike down unconstitutional actions.',
        ],
        checkpoints: [
          {
            id: 'chk_law_2',
            paragraphIndex: 1,
            prompt: 'Quick Check: Which section of the 1999 Constitution vests judicial powers in the Courts of Law?',
            options: [
              'Section 1',
              'Section 4',
              'Section 5',
              'Section 6',
            ],
            correctIndex: 3,
            explanation: 'Correct! Section 6 vests judicial powers in the superior courts of record in Nigeria.',
          },
        ],
      },
    ],
  },

  // 4. GENERAL STUDIES (GST 111 - NUC CCMAS NATIONWIDE)
  {
    id: 'book_gst_111',
    courseCode: 'GST 111',
    title: 'Communication in English & Academic Writing',
    subtitle: 'NUC CCMAS National Core Standard for All 100L Undergraduates',
    department: 'General Studies',
    faculty: 'General Academic Studies',
    level: '100L',
    institutionScope: 'ALL',
    units: 2,
    author: 'NUC Benchmark Directorate & University Faculty',
    coverIllustration: '/illustrations/stickman_study.jpg',
    description: 'Mandatory national undergraduate textbook covering English grammar, concord, sentence mechanics, scholarly vocabulary, academic reading techniques, and research report presentation.',
    nucCcmasTopicStandards: ['Subject-Verb Concord', 'Grammatical Modifiers & Tenses', 'Critical Academic Reading (PQ4R)', 'Summary & Note-Making', 'Formal Examination Essay Composition'],
    chapters: [
      {
        id: 'chap_gst_111_concord',
        courseCode: 'GST 111',
        title: 'Rules of Subject-Verb Concord & Common Pitfalls',
        subtitle: 'Mastering grammatical harmony between sentence subjects and predicate verbs',
        readTimeMinutes: 4,
        paragraphs: [
          'In English syntax, Concord means agreement between the grammatical subject and the verb of a sentence. The golden rule states: a singular subject requires a singular verb, while a plural subject requires a plural verb.',
          'However, university exams frequently test tricky exceptions. Consider phrases like "together with", "as well as", or "in conjunction with". When these intervene between the subject and verb, the verb must still agree with the principal subject! For example: "The Lecturer, together with his students, IS in the auditorium" (not "are", because the true subject is "The Lecturer").',
          'Another common trap is the rule of proximity with "either... or" and "neither... nor". Here, the verb agrees with the nearest subject: "Neither the class rep nor the students WERE present", but "Neither the students nor the class rep WAS present".',
          'Words ending in "-one", "-body", or "-thing" (like everyone, someone, nobody, anything) are grammatically singular: "Everyone HAS submitted their assignment", never "Everyone have submitted".',
        ],
        checkpoints: [
          {
            id: 'chk_gst_1',
            paragraphIndex: 1,
            prompt: 'Quick Check: Which sentence obeys correct subject-verb concord?',
            options: [
              'The Dean, as well as the heads of department, were in the meeting.',
              'The Dean, as well as the heads of department, was in the meeting.',
              'Everyone have arrived at the lecture theatre.',
              'Neither the lecturer nor the students was seated.',
            ],
            correctIndex: 1,
            explanation: 'Correct! The intervening phrase "as well as..." does not change the singular subject "The Dean", so the singular verb "was" is correct.',
          },
        ],
      },
      {
        id: 'chap_gst_111_reading',
        courseCode: 'GST 111',
        title: 'Effective Reading Techniques: Skimming, Scanning & Critical Analysis',
        subtitle: 'How top scholars process 50-page lecture materials in 20 focused minutes',
        readTimeMinutes: 4,
        paragraphs: [
          'University study requires strategic reading rather than reading every word like a storybook. Two foundational techniques are Skimming and Scanning.',
          'Skimming means glancing rapidly through headings, subheadings, and the first sentences of paragraphs (topic sentences) to grasp the general overview or central theme of a chapter.',
          'Scanning means moving your eyes quickly down the page looking specifically for a key fact, date, course code, formula, or specific name without reading the surrounding prose.',
          'When preparing for semester examinations, use the PQ4R Method: Preview (skim headings), Question (formulate exam questions from headings), Read (read actively for answers), Reflect (relate concepts to Nigerian examples), Recite (explain aloud in your own words), and Review (revisit notes after 24 hours).',
        ],
        checkpoints: [
          {
            id: 'chk_gst_2',
            paragraphIndex: 2,
            prompt: 'Quick Check: What is the main purpose of "Scanning" in academic study?',
            options: [
              'Reading every single sentence word-by-word',
              'Searching rapidly for a specific date, term, or formula',
              'Memorizing the font style and printer name',
              'Rewriting the chapter by hand',
            ],
            correctIndex: 1,
            explanation: 'Correct! Scanning is looking specifically for discrete key facts or numbers without reading the entire text.',
          },
        ],
      },
    ],
  },

  // 5. GENERAL STUDIES (GST 212 / GNS 201 - PHILOSOPHY & LOGIC)
  {
    id: 'book_gst_212',
    courseCode: 'GST 212',
    title: 'Philosophy, Logic and Human Values',
    subtitle: 'NUC CCMAS National Standard for 200L Students Across Nigerian Universities',
    department: 'General Studies',
    faculty: 'Humanities & Social Sciences',
    level: '200L',
    institutionScope: 'ALL',
    units: 2,
    author: 'Prof. C. Alabi & Dr. F. Falana',
    coverIllustration: '/illustrations/stickman_law.jpg',
    description: 'Critical reasoning, logical deduction, formal fallacies, moral philosophy, and ethical human values in public leadership and scholarship.',
    nucCcmasTopicStandards: ['Deductive vs Inductive Logic', 'Formal & Informal Fallacies', 'Truth vs Validity', 'Epistemology & Epistemic Justification', 'Moral Philosophy & Ubuntu Ethics'],
    chapters: [
      {
        id: 'chap_gst_212_logic',
        courseCode: 'GST 212',
        title: 'Deductive vs Inductive Logic & The Concept of Validity',
        subtitle: 'Distinguishing sound scientific arguments from persuasive illusions',
        readTimeMinutes: 5,
        paragraphs: [
          'Logic is the systematic study of the principles of valid reasoning and correct inference. An argument in logic consists of one or more premises which provide grounds or evidence for a conclusion.',
          'In a Deductive Argument, the conclusion follows with absolute necessity from the premises. If the premises are true, the conclusion CANNOT be false. For example: "All mammals have lungs (Premise 1). A goat is a mammal (Premise 2). Therefore, a goat has lungs (Conclusion)." If a deductive argument has a valid structure and all its premises are factually true, logicians call it a Sound Argument.',
          'In an Inductive Argument, the premises provide probable or likely support for the conclusion, but not absolute certainty. For example: "Every swan observed in Ogun State so far has been white. Therefore, all swans are white." This argument is strong, but a single black swan disproves the conclusion.',
          'Crucially, in university exam questions, remember that "Validity" refers to the formal connection between statements, while "Truth" refers to real-world factual accuracy. An argument can be valid in structure even if its premises are factually untrue!',
        ],
        checkpoints: [
          {
            id: 'chk_gst212_1',
            paragraphIndex: 1,
            prompt: 'Quick Check: What makes a deductive argument "Sound" in logic?',
            options: [
              'It sounds poetic and dramatic when read aloud',
              'It has a valid logical structure AND all its premises are factually true',
              'It is accepted by the university student union',
              'It contains at least ten premises',
            ],
            correctIndex: 1,
            explanation: 'Correct! A sound argument is one that is valid in structure and possesses completely true premises in reality.',
          },
        ],
      },
    ],
  },

  // 6. ACCOUNTING (ACC 201)
  {
    id: 'book_acc_201',
    courseCode: 'ACC 201',
    title: 'Financial Accounting & Standard Practice I',
    subtitle: 'IFRS Standards, Double Entry, Ledger Mechanics & Final Accounts',
    department: 'Accounting',
    faculty: 'Administration & Management Sciences',
    level: '200L',
    institutionScope: 'ALL',
    units: 3,
    author: 'Mrs. T. M. Olutayo & Prof. E. Eze',
    coverIllustration: '/illustrations/stickman_tech.jpg',
    description: 'Detailed practical manual on bookkeeping principles, bank reconciliation, trial balance adjustments, depreciation accounting, and financial statement presentation.',
    nucCcmasTopicStandards: ['Double Entry Bookkeeping', 'Bank Reconciliation Statements', 'Depreciation & Amortization', 'Trial Balance Adjustments', 'Statement of Comprehensive Income'],
    chapters: [
      {
        id: 'chap_acc_201_double_entry',
        courseCode: 'ACC 201',
        title: 'The Dual Aspect Concept & Double-Entry Bookkeeping',
        subtitle: 'Why every commercial transaction creates a debit and equal credit',
        readTimeMinutes: 5,
        paragraphs: [
          'The bedrock of all modern accounting was formalized by Luca Pacioli in 1494. Known as the Dual Aspect Concept, it states that every financial transaction has two equal and opposing effects on a business.',
          'This is expressed in the Fundamental Accounting Equation: Assets = Capital + Liabilities. Whatever economic resources the business owns (Assets) must equal what the owners contributed (Capital) plus what the business owes outsiders (Liabilities).',
          'Under the Double-Entry rule: Debit the receiver, Credit the giver. An increase in an Asset or an Expense is recorded as a DEBIT. An increase in a Liability, Equity, or Revenue is recorded as a CREDIT.',
          'For instance, when a campus photocopier vendor buys A4 paper for ₦20,000 cash, they debit Stationery Expense (increasing expense) and credit Cash Account (reducing asset by ₦20,000). The balance sheet remains in perfect equilibrium.',
        ],
        checkpoints: [
          {
            id: 'chk_acc_1',
            paragraphIndex: 2,
            prompt: 'Quick Check: Under double-entry rules, how do you record an increase in an asset?',
            options: [
              'Credit entry',
              'Debit entry',
              'Reverse entry',
              'Footnote memo',
            ],
            correctIndex: 1,
            explanation: 'Correct! Increases in assets and expenses are always entered as Debits.',
          },
        ],
      },
    ],
  },

  // 7. MASS COMMUNICATION (MAC 201)
  {
    id: 'book_mac_201',
    courseCode: 'MAC 201',
    title: 'News Writing and Reporting Techniques',
    subtitle: 'Journalistic Ethics, The Inverted Pyramid & Digital Storytelling',
    department: 'Mass Communication',
    faculty: 'Communication & Media Studies',
    level: '200L',
    institutionScope: 'ALL',
    units: 3,
    author: 'Dr. I. U. Mohammed & Faculty Team',
    coverIllustration: '/illustrations/stickman_study.jpg',
    description: 'Essential textbook for print, broadcast, and multimedia journalists covering news gathering, lead writing, verification, libel law, and public affairs reporting.',
    nucCcmasTopicStandards: ['Inverted Pyramid Structure', 'The 5 Ws and H Lead', 'Attribution & Sourcing', 'Defamation & Media Law in Nigeria', 'Feature vs Hard News Writing'],
    chapters: [
      {
        id: 'chap_mac_201_pyramid',
        courseCode: 'MAC 201',
        title: 'The Inverted Pyramid Style in Print & Digital Journalism',
        subtitle: 'Structuring breaking news so the most crucial facts hit the reader immediately',
        readTimeMinutes: 4,
        paragraphs: [
          'In journalistic writing, readers do not read like they are enjoying a mystery novel waiting for the final chapter reveal. Readers are busy, and newspaper editors traditionally had to trim stories from the bottom up to fit physical column spaces.',
          'This necessity gave birth to the Inverted Pyramid Style: placing the most critical, newsworthy facts at the very top of the story, followed by important contextual background, and ending with minor incidental details.',
          'The first paragraph of a news story is called the Lead (or Lede). A professional hard news lead answers the classic "5 Ws and H": Who, What, Where, When, Why, and How in a single crisp sentence of 25 to 35 words.',
          'For example: "The Academic Staff Union of Universities (Who) announced a nationwide suspension of its warning strike (What) at its national secretariat in Abuja (Where) early Monday morning (When) following a consensus agreement with federal negotiators (Why)."',
        ],
        checkpoints: [
          {
            id: 'chk_mac_1',
            paragraphIndex: 1,
            prompt: 'Quick Check: In the Inverted Pyramid structure, where are the most newsworthy facts placed?',
            options: [
              'Hidden in the concluding paragraph',
              'At the very top in the lead paragraph',
              'In the middle section',
              'In the appendix',
            ],
            correctIndex: 1,
            explanation: 'Correct! The Inverted Pyramid places the most crucial information right at the top in the lead paragraph.',
          },
        ],
      },
    ],
  },

  // 8. COMPUTER SCIENCE (COS 101 / CSC 301)
  {
    id: 'book_csc_301',
    courseCode: 'CSC 301',
    title: 'Data Structures, Algorithms & Program Design',
    subtitle: 'Asymptotic Analysis, Trees, Hash Maps & Algorithmic Efficiency',
    department: 'Computer Science',
    faculty: 'Computing & Information Technology',
    level: '300L',
    institutionScope: 'ALL',
    units: 3,
    author: 'Thomas H. Cormen (CLRS) & Prof. O. Folorunso',
    coverIllustration: '/illustrations/stickman_tech.jpg',
    description: 'Foundational computing manual covering Big-O algorithmic complexity, dynamic arrays, binary search trees, hash table collisions, and graph traversal techniques.',
    nucCcmasTopicStandards: ['Asymptotic Notation (Big-O, Omega, Theta)', 'Stack & Queue ADT', 'Binary Search Trees & Balancing', 'Hash Tables & Collision Resolution', 'Sorting Algorithms (QuickSort, MergeSort)'],
    chapters: [
      {
        id: 'chap_csc_301_big_o',
        courseCode: 'CSC 301',
        title: 'Asymptotic Analysis & Big-O Complexity Explained',
        subtitle: 'How software engineers measure algorithm performance as input scales to millions',
        readTimeMinutes: 5,
        paragraphs: [
          'In computer science, measuring the performance of an algorithm by checking how many seconds it takes on your laptop is misleading, because a faster laptop will run the same code quicker than an older phone.',
          'Instead, computer scientists use Asymptotic Analysis to measure how the execution time or memory space grows as the input size (N) grows towards infinity. This mathematical upper bound is written as Big-O notation: O(N).',
          'For example, O(1) means constant time—whether you have 10 bank accounts or 10 million bank accounts in a database, looking up an account by its unique primary key in a hash table takes the exact same single step.',
          'Conversely, O(N) represents linear time: checking through an unsorted student attendance list line by line. If there are 1,000 students, the loop checks up to 1,000 times.',
          'Top tech companies and bank switches (like Interswitch or Paystack) avoid O(N²) quadratic loops in transactions because as transactions grow from 10,000 to 1,000,000, an O(N²) algorithm would freeze the entire payment gateway.',
        ],
        checkpoints: [
          {
            id: 'chk_csc_1',
            paragraphIndex: 2,
            prompt: 'Quick Check: What does O(1) constant time complexity mean?',
            options: [
              'The algorithm takes exactly one second to execute',
              'The execution time remains constant regardless of the input size N',
              'The algorithm can only process one user at a time',
              'The code runs once and deletes itself',
            ],
            correctIndex: 1,
            explanation: 'Correct! O(1) constant time means the number of steps does not increase with input size.',
          },
        ],
      },
    ],
  },

  // 9. ENGINEERING (ENG 101 / MEG 201)
  {
    id: 'book_eng_101',
    courseCode: 'ENG 101',
    title: 'Engineering Mathematics & Calculus Mechanics',
    subtitle: 'First-Order Differential Equations, Vectors & Structural Equilibrium',
    department: 'Mechanical Engineering',
    faculty: 'Engineering & Technology',
    level: '100L',
    institutionScope: 'ALL',
    units: 3,
    author: 'K. A. Stroud & Prof. Matthew Sadiku',
    coverIllustration: '/illustrations/stickman_tech.jpg',
    description: 'Statutory mathematics curriculum for all Nigerian engineering undergraduates covering differential calculus, vector mechanics, matrices, and rate of change dynamics.',
    nucCcmasTopicStandards: ['First-Order Ordinary Differential Equations', 'Separation of Variables', 'Integrating Factors', 'Vector Dot & Cross Products', 'Newtonian Mechanical Equilibrium'],
    chapters: [
      {
        id: 'chap_eng_101_ode',
        courseCode: 'ENG 101',
        title: 'First-Order Differential Equations & Rates of Physical Change',
        subtitle: 'Modeling cooling engines, fluid discharge, and electrical circuit charging',
        readTimeMinutes: 5,
        paragraphs: [
          'In engineering design, physical systems are rarely static; temperatures cool down, bridge supports deflect under moving truck loads, and electric capacitors discharge voltage over time. These dynamic rates of change are modeled using Differential Equations.',
          'A first-order ordinary differential equation (ODE) contains only the first derivative dy/dx. The most fundamental analytical technique is the Method of Separation of Variables, where all terms containing y are gathered on one side with dy, and all terms containing x are gathered on the other side with dx.',
          'Once variables are separated, both sides are integrated directly: ∫ g(y) dy = ∫ f(x) dx + C. The constant of integration (C) is evaluated using initial boundary conditions (e.g. at time t = 0, initial voltage V = 220V).',
          'When variables cannot be separated cleanly, engineers apply the Integrating Factor method: I(x) = e^(∫ P(x) dx), which transforms the left-hand side into the derivative of a product: d/dx [y · I(x)] = Q(x) · I(x).',
        ],
        checkpoints: [
          {
            id: 'chk_eng_1',
            paragraphIndex: 3,
            prompt: 'Quick Check: What is the formula for the Integrating Factor I(x) in a standard linear first-order differential equation dy/dx + P(x)y = Q(x)?',
            options: [
              'I(x) = P(x) + Q(x)',
              'I(x) = e^(∫ P(x) dx)',
              'I(x) = ln(P(x))',
              'I(x) = d/dx [Q(x)]',
            ],
            correctIndex: 1,
            explanation: 'Correct! The integrating factor is calculated as I(x) = e^(∫ P(x) dx).',
          },
        ],
      },
    ],
  },

  // 10. BASIC MEDICAL SCIENCES & BIOCHEMISTRY (BCH 201 / ANA 201)
  {
    id: 'book_bch_201',
    courseCode: 'BCH 201',
    title: 'General Biochemistry & Cellular Energetics',
    subtitle: 'Biomolecules, Glycolysis, ATP Synthesis & Enzymatic Catalysis',
    department: 'Biochemistry',
    faculty: 'Basic Medical Sciences',
    level: '200L',
    institutionScope: 'ALL',
    units: 3,
    author: 'David L. Nelson, Michael M. Cox (Lehninger) & Prof. A. Olorunsogo',
    coverIllustration: '/illustrations/stickman_study.jpg',
    description: 'Seminal bioscience treatise for pre-clinical medicine, biochemistry, pharmacology, and nursing students covering carbohydrate metabolism, enzyme kinetics, and cellular ATP bioenergetics.',
    nucCcmasTopicStandards: ['Carbohydrate Structures', 'Glycolysis Pathway (Preparatory & Payoff Phases)', 'Substrate-Level Phosphorylation', 'Net ATP Yield', 'Enzyme Inhibition (Competitive vs Non-Competitive)'],
    chapters: [
      {
        id: 'chap_bch_201_glycolysis',
        courseCode: 'BCH 201',
        title: 'The 10 Steps of Glycolysis & Substrate-Level Phosphorylation',
        subtitle: 'How human cells break down glucose to generate cellular energy ATP',
        readTimeMinutes: 5,
        paragraphs: [
          'All living cells require energy to sustain life, pump ions across cell membranes, and synthesize proteins. This energy is stored chemically in the high-energy phosphoanhydride bonds of Adenosine Triphosphate (ATP).',
          'Glycolysis is the universal, evolutionarily ancient pathway in the cell cytoplasm that splits one 6-carbon molecule of Glucose into two 3-carbon molecules of Pyruvate. This occurs in 10 enzyme-catalyzed chemical reactions divided into two distinct phases.',
          'Phase 1 is the Preparatory (Investment) Phase: the cell actually consumes 2 molecules of ATP to phosphorylate glucose into Fructose-1,6-bisphosphate (catalyzed by Hexokinase and Phosphofructokinase-1).',
          'Phase 2 is the Payoff Phase: the 3-carbon fragments are oxidized and converted to pyruvate. Here, 4 molecules of ATP are generated directly by Substrate-Level Phosphorylation, along with 2 molecules of reduced NADH.',
          'Therefore, the Net Energy Yield of aerobic glycolysis per molecule of glucose is: 2 ATP + 2 NADH + 2 Pyruvate.',
        ],
        checkpoints: [
          {
            id: 'chk_bch_1',
            paragraphIndex: 4,
            prompt: 'Quick Check: What is the net yield of ATP produced per molecule of glucose during glycolysis?',
            options: [
              '36 ATP',
              '2 ATP net (4 produced minus 2 invested)',
              '10 ATP',
              'Zero ATP',
            ],
            correctIndex: 1,
            explanation: 'Correct! Glycolysis consumes 2 ATP in the preparatory phase and generates 4 ATP in the payoff phase, leaving a net gain of 2 ATP.',
          },
        ],
      },
    ],
  },

  // 11. PURE & APPLIED SCIENCES (PHY 101)
  {
    id: 'book_phy_101',
    courseCode: 'PHY 101',
    title: 'General Physics I: Mechanics & Thermal Properties of Matter',
    subtitle: 'Newtonian Dynamics, Conservation of Momentum & Work-Energy Theorem',
    department: 'Physics',
    faculty: 'Pure & Applied Sciences',
    level: '100L',
    institutionScope: 'ALL',
    units: 3,
    author: 'David Halliday, Robert Resnick, Jearl Walker & P. Nelkon',
    coverIllustration: '/illustrations/stickman_tech.jpg',
    description: 'Prescribed 100L physical science textbook across all Nigerian faculties of science, engineering, and agriculture covering kinematics, Newton\'s laws, momentum conservation, and elasticity.',
    nucCcmasTopicStandards: ['Vectors and Scalars', 'Newton\'s Laws of Motion', 'Conservation of Linear Momentum', 'Work, Energy and Power', 'Elasticity & Hooke\'s Law'],
    chapters: [
      {
        id: 'chap_phy_101_momentum',
        courseCode: 'PHY 101',
        title: 'Conservation of Linear Momentum & Inelastic Collisions',
        subtitle: 'Why total momentum before collision equals total momentum after collision',
        readTimeMinutes: 4,
        paragraphs: [
          'Linear momentum (p) of an object is defined as the product of its mass (m) and its velocity (v): p = mv. Momentum is a vector quantity, meaning it possesses both magnitude and direction.',
          'The Law of Conservation of Linear Momentum states that in an isolated system where no external unbalanced force acts, the total momentum remains constant over time: m1u1 + m2u2 = m1v1 + m2v2.',
          'In university exam problems, lecturers frequently test the difference between Elastic and Inelastic Collisions. In an Elastic Collision, both momentum and kinetic energy are conserved.',
          'In a Perfectly Inelastic Collision, momentum is conserved, but kinetic energy is lost (converted into heat, sound, or deformation). The two colliding bodies stick together and move with a single common velocity (V): m1u1 + m2u2 = (m1 + m2)V.',
        ],
        checkpoints: [
          {
            id: 'chk_phy_1',
            paragraphIndex: 3,
            prompt: 'Quick Check: What happens in a perfectly inelastic collision between two bodies?',
            options: [
              'Kinetic energy increases spontaneously',
              'The two bodies stick together and move with a single common velocity',
              'Momentum is destroyed completely',
              'The velocities invert without touching',
            ],
            correctIndex: 1,
            explanation: 'Correct! In a perfectly inelastic collision, maximum kinetic energy is dissipated and the bodies move together with a shared velocity.',
          },
        ],
      },
    ],
  },
];

// Helper to filter books based on user institution, department, and level
export function getBooksForStudent(
  institution: string = 'OOU',
  department: string = 'Economics',
  level: string = '200L'
): CourseBook[] {
  const normDept = (department || '').toLowerCase();
  const normLevel = (level || '100L').replace('L', '');

  const matches = SUPPORTED_BOOKS.filter((b) => {
    // GST books are available to all students
    if (b.courseCode.startsWith('GST') || b.courseCode.startsWith('GNS')) return true;

    // Department match or faculty match
    const deptMatch =
      b.department.toLowerCase().includes(normDept) ||
      normDept.includes(b.department.toLowerCase()) ||
      b.faculty.toLowerCase().includes(normDept);

    // Level match
    const levelMatch = b.level.includes(normLevel);

    return deptMatch || levelMatch;
  });

  return matches.length > 0 ? matches : SUPPORTED_BOOKS;
}

export function getBookById(id: string): CourseBook | undefined {
  return SUPPORTED_BOOKS.find((b) => b.id === id);
}

export function getAllSupportedBooks(): CourseBook[] {
  return SUPPORTED_BOOKS;
}

// Generate structured context prompt string for AI injection
export function getBookContextPrompt(bookId: string): string {
  const book = getBookById(bookId);
  if (!book) return '';

  return `Selected Course Material & Syllabus Knowledge for ${book.courseCode} (${book.title}):
- Course Code: ${book.courseCode} (${book.units} Units)
- Department: ${book.department} (${book.level})
- Core Textbook: ${book.title} by ${book.author}
- Course Description: ${book.description}
- Curriculum Topics: ${book.nucCcmasTopicStandards.join(', ')}
- Chapter Outlines & Core Reading Notes in Context:
${book.chapters.map((ch, idx) => `  * Chapter ${idx + 1}: "${ch.title}" - ${ch.subtitle}\n    Key Concept Synopsis: ${ch.paragraphs.slice(0, 2).join(' ')}`).join('\n')}
When the student asks questions about ${book.courseCode} or ${book.title}, leverage these exact chapter topics, explanations, and practical Nigerian analogies!`;
}
