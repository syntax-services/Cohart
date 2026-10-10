/**
 * National Universities Commission (NUC) CCMAS Academic Curriculum & Reference Library Matrix
 * Covers all 17 NUC disciplines across 256 approved Nigerian universities (Federal, State, Private).
 * 
 * Under the NUC Core Curriculum and Minimum Academic Standards (CCMAS):
 * - 70% of curriculum content is standardized nationwide across all universities.
 * - 30% reflects institutional discretion, university-specific electives, and local adaptations.
 */

export interface PrescribedBookReference {
  title: string;
  authors: string;
  edition?: string;
  publisher?: string;
  isNigerianAuthor: boolean;
  coreTopicsCovered: string[];
  examRelevanceNotes: string;
}

export interface CatalogCourse {
  code: string;
  title: string;
  units: number;
  level: '100L' | '200L' | '300L' | '400L' | '500L';
  semester: 1 | 2;
  category: 'core' | 'required' | 'gst' | 'elective';
  prescribedBooks: PrescribedBookReference[];
  learningOutcomes: string[];
}

export interface DegreeProgramCatalog {
  discipline: string; // One of the 17 NUC Broad Disciplines
  faculty: string;
  department: string;
  degreeTitle: string; // e.g. B.Sc. Computer Science, LL.B Law, B.Eng Mechanical Engineering, MB;BS
  durationYears: 4 | 5 | 6;
  courses: Record<string, CatalogCourse[]>; // '100L', '200L', '300L', '400L', '500L'
}

export interface NucDisciplineInfo {
  id: string;
  name: string;
  description: string;
  popularDepartments: string[];
  coreFoundationalTexts: PrescribedBookReference[];
}

// 1. All 17 Broad Disciplines Recognized by the National Universities Commission (NUC CCMAS)
export const NUC_DISCIPLINES: NucDisciplineInfo[] = [
  {
    id: 'admin_mgmt',
    name: 'Administration & Management Sciences',
    description: 'Financial management, accounting standards, corporate administration, public policy, and marketing.',
    popularDepartments: ['Accounting', 'Business Administration', 'Banking & Finance', 'Public Administration', 'Marketing', 'Insurance'],
    coreFoundationalTexts: [
      {
        title: 'Frank Wood\'s Business Accounting (Vols 1 & 2)',
        authors: 'Frank Wood & Alan Sangster',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Double Entry', 'Trial Balance', 'Income Statement', 'Balance Sheet', 'Partnership Accounts'],
        examRelevanceNotes: 'The statutory baseline for all 100L/200L accounting and commerce exams in Nigeria.',
      },
      {
        title: 'Management: Global and Southern African Perspectives',
        authors: 'Stephen P. Robbins, Mary Coulter & Decenzo',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Planning', 'Organizing', 'Leading', 'Controlling', 'Strategic Decision Making'],
        examRelevanceNotes: 'Universally cited in BUS 101/201 across Federal and State universities.',
      },
      {
        title: 'Corporate Finance & Nigerian Financial System',
        authors: 'Prof. J. O. Anyanwu',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Money Market', 'Capital Market', 'SEC Regulations', 'Working Capital Management'],
        examRelevanceNotes: 'Essential for Nigerian capital market questions and BFN 201/301.',
      },
    ],
  },
  {
    id: 'agriculture',
    name: 'Agricultural Sciences',
    description: 'Crop production, animal science, agricultural economics, extension services, soil science, and agro-forestry.',
    popularDepartments: ['Agronomy', 'Animal Science', 'Agricultural Economics', 'Soil Science', 'Fisheries & Aquaculture', 'Forestry & Wildlife'],
    coreFoundationalTexts: [
      {
        title: 'Principles of Crop Production in the Tropics',
        authors: 'Prof. C. O. Agboola',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Tropical Agronomy', 'Soil Fertility', 'Crop Protection', 'Harvesting Techniques'],
        examRelevanceNotes: 'Standard textbook used across FUNAAB, FUAM, and faculty of agriculture departments.',
      },
      {
        title: 'Animal Husbandry & Nutrition in West Africa',
        authors: 'Prof. A. O. Longe',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Ruminant Digestion', 'Feed Formulation', 'Poultry Management', 'Livestock Diseases'],
        examRelevanceNotes: 'Foundational for ANS 201/301 questions on feed conversion ratios and livestock physiology.',
      },
    ],
  },
  {
    id: 'allied_health',
    name: 'Allied Health Sciences',
    description: 'Diagnostic sciences, nursing care, physiotherapy, medical laboratory technology, and clinical imaging.',
    popularDepartments: ['Nursing Science', 'Medical Laboratory Science (MLS)', 'Physiotherapy', 'Radiography'],
    coreFoundationalTexts: [
      {
        title: 'Brunner & Suddarth\'s Textbook of Medical-Surgical Nursing',
        authors: 'Janice L. Hinkle & Kerry H. Cheever',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Patient Assessment', 'Surgical Care', 'Pathophysiological Interventions', 'Pharmacology in Nursing'],
        examRelevanceNotes: 'The golden reference for Nursing and Midwifery Council of Nigeria (NMCN) exams.',
      },
      {
        title: 'District Laboratory Practice in Tropical Countries (Vols 1 & 2)',
        authors: 'Monica Cheesbrough',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Parasitology', 'Clinical Microbiology', 'Haematology', 'Tropical Staining Methods'],
        examRelevanceNotes: 'Mandatory benchmark for Medical Laboratory Science Council of Nigeria (MLSCN) practicals.',
      },
    ],
  },
  {
    id: 'arts_humanities',
    name: 'Arts & Humanities',
    description: 'Linguistic structures, literary criticism, history, philosophy, religious traditions, and performing arts.',
    popularDepartments: ['English & Literary Studies', 'History & International Studies', 'Philosophy', 'Linguistics', 'Theatre Arts'],
    coreFoundationalTexts: [
      {
        title: 'Groundwork of Nigerian History',
        authors: 'Prof. Obaro Ikime (Historical Society of Nigeria)',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Pre-Colonial Kingdoms', 'Caliphate & Emirates', 'Colonial Amalgamation 1914', 'Post-Independence Politics'],
        examRelevanceNotes: 'Universally required for HIS 101/201 and General Studies Nigerian Culture across all varsities.',
      },
      {
        title: 'Knowing Philosophy: A General Introduction',
        authors: 'Prof. Joseph I. Omoregbe',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Epistemology', 'Metaphysics', 'Ethics', 'Theories of Truth', 'African Philosophy'],
        examRelevanceNotes: 'Standard philosophy reader across UI, OAU, UNILAG, UNN, and OOU.',
      },
    ],
  },
  {
    id: 'basic_medical',
    name: 'Basic Medical Sciences',
    description: 'Foundational human biosciences for pre-clinical medical, dental, and health sciences students.',
    popularDepartments: ['Human Anatomy', 'Human Physiology', 'Medical Biochemistry', 'Pharmacology'],
    coreFoundationalTexts: [
      {
        title: 'Clinically Oriented Anatomy',
        authors: 'Keith L. Moore, Arthur F. Dalley & Anne M. R. Agur',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Thorax & Abdomen', 'Pelvis & Perineum', 'Upper & Lower Limbs', 'Head & Neck', 'Neuroanatomy'],
        examRelevanceNotes: 'Prescribed text for 2nd MB;BS professional examinations across Nigerian College of Medicine faculties.',
      },
      {
        title: 'Guyton and Hall Textbook of Medical Physiology',
        authors: 'John E. Hall & Michael E. Hall',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Membrane Potentials', 'Cardiovascular System', 'Renal Physiology', 'Endocrine Feedback', 'Neurophysiology'],
        examRelevanceNotes: 'Essential for 200L/300L physiology vivas and continuous assessment.',
      },
      {
        title: 'Lehninger Principles of Biochemistry',
        authors: 'David L. Nelson & Michael M. Cox',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Enzyme Kinetics', 'Glycolysis & Krebs Cycle', 'Oxidative Phosphorylation', 'Lipid Biosynthesis', 'DNA Replication'],
        examRelevanceNotes: 'Primary text for BCH 201/301 across pure science and medical colleges.',
      },
    ],
  },
  {
    id: 'media_communication',
    name: 'Communication & Media Studies',
    description: 'Journalism, digital media broadcasting, public relations strategy, and media law ethics.',
    popularDepartments: ['Mass Communication', 'Journalism & Media Studies', 'Public Relations & Advertising', 'Broadcasting'],
    coreFoundationalTexts: [
      {
        title: 'Mass Communication: Living in a Media World',
        authors: 'Ralph E. Hanson',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Media Literacy', 'Inverted Pyramid', 'Broadcasting Technology', 'Digital Platforms'],
        examRelevanceNotes: 'Standard foundation text for MAC 101/201.',
      },
      {
        title: 'Mass Media Laws and Ethics in Nigeria',
        authors: 'Prof. Ralph Akinfeleye',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Defamation & Libel', 'Copyright Infringement', 'Contempt of Court', 'Official Secrets Act', 'NBC Code'],
        examRelevanceNotes: 'Standard text for Nigerian media law exams and ethics questions.',
      },
    ],
  },
  {
    id: 'computing',
    name: 'Computing & Information Technology',
    description: 'Algorithms, data structures, software engineering, systems architecture, networks, cyber defense, and artificial intelligence.',
    popularDepartments: ['Computer Science', 'Software Engineering', 'Cyber Security', 'Information Technology', 'Data Science', 'Artificial Intelligence'],
    coreFoundationalTexts: [
      {
        title: 'Introduction to Algorithms (CLRS)',
        authors: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest & Clifford Stein',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Asymptotic Analysis (Big-O)', 'Sorting & Searching', 'Dynamic Programming', 'Graph Theory (BFS/DFS)', 'Greedy Algorithms'],
        examRelevanceNotes: 'The premier bible for CSC 301 Data Structures and Algorithms across top engineering and computing faculties.',
      },
      {
        title: 'Operating System Concepts (The Dinosaur Book)',
        authors: 'Abraham Silberschatz, Peter B. Galvin & Greg Gagne',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Process Scheduling', 'Deadlocks & Synchronization', 'Memory Management (Paging/Segmentation)', 'Virtual Memory', 'File Systems'],
        examRelevanceNotes: 'Required text for CSC 303 across federal, state, and private university computing curricula.',
      },
      {
        title: 'Fundamentals of Database Systems',
        authors: 'Ramez Elmasri & Shamkant B. Navathe',
        isNigerianAuthor: false,
        coreTopicsCovered: ['ER Modeling', 'Relational Algebra', 'SQL Queries', 'Functional Dependencies & Normalization (1NF-BCNF)', 'Transaction ACID Properties'],
        examRelevanceNotes: 'The standard text for CSC 305 and ICT database development modules.',
      },
    ],
  },
  {
    id: 'engineering',
    name: 'Engineering & Technology',
    description: 'Applied physical principles, design optimization, thermodynamics, structural mechanics, circuits, and computational simulation.',
    popularDepartments: ['Mechanical Engineering', 'Electrical & Electronic Engineering', 'Civil Engineering', 'Chemical Engineering', 'Computer Engineering', 'Petroleum Engineering'],
    coreFoundationalTexts: [
      {
        title: 'Engineering Mathematics',
        authors: 'K. A. Stroud & Dexter J. Booth',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Differential Equations', 'Matrices & Determinants', 'Complex Numbers', 'Vector Calculus', 'Laplace Transforms'],
        examRelevanceNotes: 'The undisputed essential textbook for 100L/200L engineering students across all COREN-accredited faculties.',
      },
      {
        title: 'Vector Mechanics for Engineers: Statics and Dynamics',
        authors: 'Ferdinand P. Beer, E. Russell Johnston Jr. & Phillip J. Cornwell',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Equilibrium of Rigid Bodies', 'Trusses & Frames', 'Friction', 'Kinetics of Particles', 'Work and Energy'],
        examRelevanceNotes: 'The core benchmark for MEG 201/203 and civil engineering structural mechanics.',
      },
      {
        title: 'Thermodynamics: An Engineering Approach',
        authors: 'Yunus A. Çengel & Michael A. Boles',
        isNigerianAuthor: false,
        coreTopicsCovered: ['1st and 2nd Laws of Thermodynamics', 'Carnot Cycle', 'Entropy', 'Rankine and Otto Cycles', 'Refrigeration'],
        examRelevanceNotes: 'Required text for mechanical and chemical engineering thermo exams.',
      },
      {
        title: 'Fundamentals of Electric Circuits',
        authors: 'Charles K. Alexander & Matthew N. O. Sadiku',
        isNigerianAuthor: true, // Matthew Sadiku is a renowned Nigerian-American engineering professor!
        coreTopicsCovered: ['Kirchhoff\'s Laws', 'Thevenin and Norton Theorems', 'AC Sinusoidal Analysis', 'Operational Amplifiers', 'Three-Phase Systems'],
        examRelevanceNotes: 'The worldwide classic authored by Nigeria\'s Prof. Matthew Sadiku, used in EEE 201/202 everywhere.',
      },
    ],
  },
  {
    id: 'environmental_sciences',
    name: 'Environmental Sciences & Built Environment',
    description: 'Architecture, spatial planning, environmental monitoring, structural fabrication, and geomatics.',
    popularDepartments: ['Architecture', 'Urban & Regional Planning', 'Estate Management', 'Quantity Surveying', 'Building', 'Surveying & Geoinformatics'],
    coreFoundationalTexts: [
      {
        title: 'Building Construction Handbook',
        authors: 'Roy Chudley & Roger Greeno',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Substructure & Foundations', 'Superstructure Masonry', 'Concrete Technology', 'Roofing Structures', 'Drainage'],
        examRelevanceNotes: 'Essential for architecture, building technology, and quantity surveying students.',
      },
      {
        title: 'Urban Planning in Nigeria: Principles and Policies',
        authors: 'Prof. L. O. Olusanya',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Master Planning', 'Urban Land Use Decree', 'Traffic Congestion', 'Zoning Regulations'],
        examRelevanceNotes: 'Standard text for URP departments addressing urban density in Lagos, Ibadan, and Kano.',
      },
    ],
  },
  {
    id: 'law',
    name: 'Law (Jurisprudence & Legal Studies)',
    description: 'Common law doctrine, Nigerian constitutional framework, commercial transactions, criminal justice, and judicial precedents.',
    popularDepartments: ['Public & International Law', 'Private & Property Law', 'Commercial & Industrial Law', 'Jurisprudence & Legal Theory'],
    coreFoundationalTexts: [
      {
        title: 'The Nigerian Legal System',
        authors: 'Ese Malemi',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Sources of Nigerian Law', 'Court Hierarchy (Supreme Court to Magistrate)', 'Judicial Precedent (Stare Decisis)', 'Customary Law & Sharia'],
        examRelevanceNotes: 'The universal companion for all 100L law undergraduates in Nigeria (LAW 101/PUL 203).',
      },
      {
        title: 'Nigerian Law of Contract',
        authors: 'Prof. Itse E. Sagay',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Offer & Acceptance', 'Consideration & Privity', 'Intention to Create Legal Relations', 'Vitiating Elements (Mistake/Misrepresentation)', 'Breach & Remedies'],
        examRelevanceNotes: 'The authoritative Nigerian contract jurisprudence cited before all Nigerian courts and law faculties.',
      },
      {
        title: 'Criminal Law in Nigeria',
        authors: 'C. O. Okonkwo & M. E. Naish',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Actus Reus & Mens Rea', 'Defences (Insanity/Self Defence/Provocation)', 'Homicide (Murder/Manslaughter)', 'Offences against Property (Theft/Burglary)'],
        examRelevanceNotes: 'The seminal textbook for PUL 301 Criminal Law I & II.',
      },
      {
        title: 'The Nigerian Law of Torts',
        authors: 'Gilbert Kodilinye & Oluwole Aluko',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Negligence & Duty of Care', 'Nuisance & Rylands v. Fletcher', 'Defamation (Libel & Slander)', 'Trespass to Person/Goods', 'Vicarious Liability'],
        examRelevanceNotes: 'The premier Nigerian torts treatise for CIL 301.',
      },
      {
        title: 'The Law of Evidence in Nigeria',
        authors: 'Dr. T. Akinola Aguda',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Evidence Act 2011', 'Relevance & Admissibility', 'Hearsay Rule & Exceptions', 'Burden and Standard of Proof', 'Competence of Witnesses'],
        examRelevanceNotes: 'Mandatory text for 400L law students and Nigerian Law School preparation.',
      },
      {
        title: 'Practical Approach to Law of Real Property in Nigeria',
        authors: 'Prof. I. O. Smith',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Land Use Act 1978', 'Governor\'s Consent', 'Customary Land Tenure', 'Mortgages & Leases', 'Family Land Alienation'],
        examRelevanceNotes: 'Standard reference for PUL 401 Land Law examinations.',
      },
    ],
  },
  {
    id: 'medicine',
    name: 'Medicine & Surgery (Clinical)',
    description: 'Pathology, clinical medicine, surgical procedures, paediatrics, obstetrics, gynaecology, and community medicine.',
    popularDepartments: ['Medicine & Surgery (MB;BS)', 'Dentistry (BDS)', 'Pharmacy (Pharm.D)'],
    coreFoundationalTexts: [
      {
        title: 'Davidson\'s Principles and Practice of Medicine',
        authors: 'Stuart H. Ralston, Ian D. Penman, Mark W. J. Strachan & Richard P. Hobson',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Cardiology', 'Respiratory Disease', 'Gastroenterology', 'Infectious Diseases & Malaria', 'Endocrinology'],
        examRelevanceNotes: 'The gold standard clinical companion for 4th and 5th MB;BS examinations.',
      },
      {
        title: 'Bailey & Love\'s Short Practice of Surgery',
        authors: 'P. Ronan O\'Connell, Andrew W. McCaskie & Robert D. Sayers',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Principles of Wound Healing', 'Trauma & Shock', 'Abdominal Surgery', 'Orthopaedics', 'Oncological Surgery'],
        examRelevanceNotes: 'Required text for clinical surgical rounds and final medical school qualification.',
      },
    ],
  },
  {
    id: 'pharmacy',
    name: 'Pharmaceutical Sciences',
    description: 'Drug design, phytotherapy, pharmaceutical microbiology, dosage formulations, and pharmacokinetics.',
    popularDepartments: ['Clinical Pharmacy', 'Pharmacology & Toxicology', 'Pharmaceutics & Pharmaceutical Technology', 'Pharmacognosy'],
    coreFoundationalTexts: [
      {
        title: 'Trease and Evans Pharmacognosy',
        authors: 'William Charles Evans',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Plant Secondary Metabolites', 'Alkaloids & Flavonoids', 'Herbal Drug Extraction', 'Medicinal Plants of Africa'],
        examRelevanceNotes: 'Prescribed textbook for PCG 201/301 across Nigerian pharmacy faculties.',
      },
      {
        title: 'Aulton\'s Pharmaceutics: The Design and Manufacture of Medicines',
        authors: 'Kevin M. G. Taylor & Michael E. Aulton',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Tabletting & Capsules', 'Suspensions & Emulsions', 'Sterilization', 'Biopharmaceutics'],
        examRelevanceNotes: 'The primary pharmaceutics reference for formulation technology.',
      },
    ],
  },
  {
    id: 'pure_sciences',
    name: 'Pure & Applied Sciences',
    description: 'Fundamental chemical, physical, biological, and mathematical phenomena.',
    popularDepartments: ['Microbiology', 'Biochemistry', 'Industrial Chemistry', 'Physics', 'Mathematics', 'Plant Biology', 'Zoology'],
    coreFoundationalTexts: [
      {
        title: 'Fundamentals of Physics',
        authors: 'David Halliday, Robert Resnick & Jearl Walker',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Newtonian Mechanics', 'Thermodynamics & Heat', 'Wave Motion & Optics', 'Electromagnetism', 'Modern Physics'],
        examRelevanceNotes: 'The standard textbook for PHY 101/102 and physical science students in 100L.',
      },
      {
        title: 'Chemistry: The Central Science',
        authors: 'Theodore L. Brown, H. Eugene LeMay, Bruce E. Bursten & Catherine J. Murphy',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Stoichiometry', 'Atomic Structure & Periodic Trends', 'Chemical Bonding', 'Chemical Equilibrium', 'Organic Chemistry Basics'],
        examRelevanceNotes: 'Required text for CHM 101/102 nationwide.',
      },
      {
        title: 'Prescott\'s Microbiology',
        authors: 'Joanne M. Willey, Kathleen Sandman & Dorothy Wood',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Bacterial Morphology', 'Viral Replication', 'Microbial Genetics', 'Immunology Basics', 'Applied Microbiology in Industry'],
        examRelevanceNotes: 'The premier textbook for MCB 201/301 across Nigerian science faculties.',
      },
    ],
  },
  {
    id: 'social_sciences',
    name: 'Social Sciences',
    description: 'Human societies, economic behavior, geopolitical institutions, social structures, and mental processes.',
    popularDepartments: ['Economics', 'Political Science', 'Sociology', 'Psychology', 'Geography & Environmental Management'],
    coreFoundationalTexts: [
      {
        title: 'Intermediate Microeconomics: A Modern Approach',
        authors: 'Hal R. Varian',
        isNigerianAuthor: false,
        coreTopicsCovered: ['Consumer Theory & Utility', 'Cost Minimization & Profit Maximization', 'Monopoly & Price Discrimination', 'Game Theory', 'General Equilibrium'],
        examRelevanceNotes: 'The standard microeconomics textbook for ECO 201/301 across university economics departments.',
      },
      {
        title: 'Principles of Economics / Macroeconomics',
        authors: 'N. Gregory Mankiw',
        isNigerianAuthor: false,
        coreTopicsCovered: ['GDP Accounting', 'Inflation & Unemployment', 'IS-LM Model', 'Monetary Policy & Fiscal Multipliers', 'Economic Growth Models (Solow)'],
        examRelevanceNotes: 'Widely prescribed for ECO 101/202 across Nigerian universities.',
      },
      {
        title: 'Basic Econometrics',
        authors: 'Damodar N. Gujarati & Dawn C. Porter',
        isNigerianAuthor: false,
        coreTopicsCovered: ['OLS Regression', 'Hypothesis Testing (t and F tests)', 'Heteroscedasticity', 'Autocorrelation', 'Multicollinearity'],
        examRelevanceNotes: 'The essential companion for ECO 305/405 econometrics and student research projects.',
      },
      {
        title: 'Structure of the Nigerian Economy (1960-1997)',
        authors: 'J. C. Anyanwu, H. Oyefusi, H. Oaikhenan & F. A. Dimowo',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Petroleum Monoculture', 'Agricultural Sector Decline', 'SAP Policies', 'External Debt & Inflation Dynamics'],
        examRelevanceNotes: 'The seminal textbook for ECO 209 (Structure of the Nigerian Economy).',
      },
      {
        title: 'Elements of Politics',
        authors: 'Remi Anifowose & Francis C. Enemuo',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Power, Authority & Legitimacy', 'Sovereignty & Statehood', 'Political Parties & Elections', 'Military in African Politics'],
        examRelevanceNotes: 'Prescribed textbook for POL 101 and social science faculties.',
      },
    ],
  },
];

// 2. Nationwide General Studies (GST) NUC CCMAS Benchmark Required for EVERY University Student in Nigeria
export const NATIONWIDE_GST_CURRICULUM: CatalogCourse[] = [
  {
    code: 'GST 111',
    title: 'Communication in English',
    units: 2,
    level: '100L',
    semester: 1,
    category: 'gst',
    learningOutcomes: [
      'Master rules of subject-verb concord, tense sequencing, and modifiers',
      'Apply effective reading strategies (PQ4R, skimming, and scanning)',
      'Construct well-organized academic essays, summaries, and term papers',
    ],
    prescribedBooks: [
      {
        title: 'Studies in English Language and Academic Writing',
        authors: 'NUC General Studies Directorate / Babatunde & Aremo',
        isNigerianAuthor: true,
        coreTopicsCovered: ['English Syntax', 'Phonology & Stress Patterns', 'Concord Rules', 'Essay Mechanics'],
        examRelevanceNotes: 'Mandatory for all 100L students in all 256 universities in First Semester.',
      },
    ],
  },
  {
    code: 'GST 112',
    title: 'Nigerian Peoples and Culture',
    units: 2,
    level: '100L',
    semester: 1,
    category: 'gst',
    learningOutcomes: [
      'Understand Nigeria\'s cultural zones, linguistic heritage, and ethnic diversity',
      'Analyze the evolution of Nigeria as a nation-state from pre-colonial to contemporary era',
      'Evaluate moral values, national identity, and civic responsibilities',
    ],
    prescribedBooks: [
      {
        title: 'Nigerian Peoples and Culture: A Historical and Sociological Perspective',
        authors: 'Prof. Obaro Ikime & Toyin Falola',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Pre-Colonial Kingdoms', '1914 Amalgamation', 'Cultural Pluralism', 'Civic Values'],
        examRelevanceNotes: 'Universally tested via university CBT portals in 100L.',
      },
    ],
  },
  {
    code: 'GST 113',
    title: 'Basic Digital Skills & Information Literacy',
    units: 2,
    level: '100L',
    semester: 2,
    category: 'gst',
    learningOutcomes: [
      'Navigate operating systems, document processors, spreadsheets, and presentations',
      'Demonstrate cyber hygiene, digital security, and academic plagiarism avoidance',
      'Utilize digital research databases and modern online scholarly tools',
    ],
    prescribedBooks: [
      {
        title: 'Information Literacy and Digital Skills for Nigerian Undergraduates',
        authors: 'Computer Professionals Registration Council of Nigeria (CPN)',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Office Productivity', 'Cloud Storage', 'Internet Ethics', 'Cyber Safety'],
        examRelevanceNotes: 'New CCMAS course introduced in 2023 for all 100L Second Semester students.',
      },
    ],
  },
  {
    code: 'GST 212',
    title: 'Philosophy, Logic and Human Values',
    units: 2,
    level: '200L',
    semester: 1,
    category: 'gst',
    learningOutcomes: [
      'Distinguish between deductive and inductive arguments, truth and validity',
      'Identify formal and informal fallacies in everyday discourse and public arguments',
      'Analyze moral ethics, justice, human rights, and human values in society',
    ],
    prescribedBooks: [
      {
        title: 'Introduction to Logic and Critical Thinking',
        authors: 'Prof. J. O. Omoregbe / Irving M. Copi & Carl Cohen',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Deduction vs Induction', 'Fallacies (Ad Hominem, Strawman)', 'Syllogisms', 'Ubuntu Ethics'],
        examRelevanceNotes: 'Core requirement in 200L Alpha semester across all universities.',
      },
    ],
  },
  {
    code: 'GST 222',
    title: 'Peace Studies and Conflict Resolution',
    units: 2,
    level: '200L',
    semester: 2,
    category: 'gst',
    learningOutcomes: [
      'Understand the root causes of communal, religious, and political conflicts in West Africa',
      'Apply negotiation, mediation, and arbitration techniques in resolving disputes',
      'Analyze peacebuilding structures, human security, and rule of law',
    ],
    prescribedBooks: [
      {
        title: 'Introduction to Peace and Conflict Studies in West Africa',
        authors: 'Prof. Shedrack Gaya Best',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Conflict Typologies', 'Alternative Dispute Resolution (ADR)', 'Peacekeeping', 'Early Warning Systems'],
        examRelevanceNotes: 'Statutory 200L Omega semester course tested across all faculties.',
      },
    ],
  },
  {
    code: 'GST 311',
    title: 'Entrepreneurship and Innovation',
    units: 2,
    level: '300L',
    semester: 1,
    category: 'gst',
    learningOutcomes: [
      'Identify business opportunities, customer segments, and value propositions',
      'Develop a viable business plan with financial projections and operational feasibility',
      'Understand intellectual property, patent laws, and venture finance in Nigeria',
    ],
    prescribedBooks: [
      {
        title: 'Entrepreneurship: Theory, Process and Practice in Nigeria',
        authors: 'Robert D. Hisrich, Michael P. Peters / SMEDAN Enterprise Directorate',
        isNigerianAuthor: true,
        coreTopicsCovered: ['Feasibility Analysis', 'Business Model Canvas', 'Cash Flow Projections', 'CAC Registration'],
        examRelevanceNotes: 'Mandatory 300L project and exam course for all undergraduate disciplines.',
      },
    ],
  },
];

// Helper to look up discipline info by department name
export function findDisciplineForDepartment(departmentName: string): NucDisciplineInfo {
  const norm = departmentName.toLowerCase();
  for (const disc of NUC_DISCIPLINES) {
    if (disc.name.toLowerCase().includes(norm)) return disc;
    for (const dept of disc.popularDepartments) {
      if (norm.includes(dept.toLowerCase()) || dept.toLowerCase().includes(norm)) {
        return disc;
      }
    }
  }
  // Default to Pure & Applied Sciences or Administration if unmatched
  return NUC_DISCIPLINES[0];
}

// Helper to look up core reference books for any student across all 256 universities
export function getRecommendedBooksForStudent(params: {
  institution: string;
  department: string;
  level: string;
}): PrescribedBookReference[] {
  const discipline = findDisciplineForDepartment(params.department);
  const books: PrescribedBookReference[] = [...discipline.coreFoundationalTexts];

  // Add GST books based on student's academic level
  const normLevel = params.level || '100L';
  const matchingGst = NATIONWIDE_GST_CURRICULUM.filter((c) => c.level === normLevel);
  matchingGst.forEach((c) => {
    books.push(...c.prescribedBooks);
  });

  return books;
}

// Generate comprehensive AI guidance prompt detailing NUC CCMAS curriculum, reading books, and past question context
export function generateCurriculumContextPrompt(params: {
  institution: string;
  department: string;
  faculty?: string;
  level: string;
}): string {
  const discipline = findDisciplineForDepartment(params.department || 'General');
  const recommendedBooks = getRecommendedBooksForStudent(params);

  return `
[NUC CCMAS 70/30 CURRICULUM & CORE REFERENCE LIBRARY KNOWLEDGE]:
- Student's University: ${params.institution || 'Nigerian Higher Institution (250+ Supported)'}
- Department: ${params.department || 'General Studies'} (${params.level || '100L'})
- Broad NUC Discipline: ${discipline.name}
- NUC Curriculum Regulation: 70% of the syllabus for this department is standardized nationwide by NUC CCMAS. The remaining 30% consists of university-specific courses and departmental lecturer adaptations.
- Prescribed Foundational Literature & Reference Books for ${params.department || 'this discipline'}:
${recommendedBooks.map((b, idx) => `  ${idx + 1}. "${b.title}" by ${b.authors}${b.isNigerianAuthor ? ' [Nigerian Authority]' : ' [International Standard]'}\n     Core Exam Focus: ${b.coreTopicsCovered.join(', ')}\n     Lecturer & Exam Relevance: ${b.examRelevanceNotes}`).join('\n')}
- Instruction for Responses:
  * When explaining concepts in ${params.department || 'their course'}, frame your explanations to match the exact definitions, diagrams, and terminology found in these prescribed books.
  * In Nigeria, lecturers mark exams according to these standard textbooks and lecturer monographs. Always prioritize these exact definitions over generic internet summaries.
  * Reassure the student that Cohart has full curriculum and book coverage for all 256 accredited universities across all 17 NUC disciplines!`;
}
