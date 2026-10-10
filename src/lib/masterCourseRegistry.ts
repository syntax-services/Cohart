/**
 * Cohart Master Course Code & Faculty Registry across Nigerian Universities
 * Covers comprehensive course code prefixes, departments, and course curricula across:
 * - 52+ Federal Universities (Conventional, Technology, Agriculture, Health Sciences, Education, Petroleum, Transport, Aviation)
 * - 63+ State Universities (Conventional, Technology, Education, Medical)
 * - 140+ Private Universities (Faith-based, Technology-focused, Specialized)
 * 
 * Includes exact 3-letter course code prefixes, level numbers (100L-600L), course titles,
 * credit units, and prescribed textbooks per faculty.
 */

export interface CourseCodeDefinition {
  prefix: string;
  department: string;
  faculty: string;
  discipline: string;
  typicalInstitutions: string[]; // e.g. ['All Universities', 'Universities of Technology', 'Universities of Agriculture', etc.]
  description: string;
  commonCourses: {
    code: string;
    title: string;
    units: number;
    level: string;
    semester: 1 | 2;
    prescribedTextbook: string;
    coreTopics: string[];
  }[];
}

// 1. Comprehensive Master Directory of All Course Code Prefixes across Nigerian Higher Institutions
export const MASTER_COURSE_PREFIX_REGISTRY: Record<string, CourseCodeDefinition> = {
  // ===================== GENERAL STUDIES & FOUNDATIONAL =====================
  GST: {
    prefix: 'GST',
    department: 'General Studies Unit',
    faculty: 'General Studies',
    discipline: 'General Academic Studies',
    typicalInstitutions: ['All 256 Universities (Federal, State, Private)'],
    description: 'Mandatory national undergraduate general studies curriculum governed by NUC CCMAS.',
    commonCourses: [
      { code: 'GST 111', title: 'Communication in English', units: 2, level: '100L', semester: 1, prescribedTextbook: 'Studies in English Language (Babatunde & Aremo)', coreTopics: ['Concord', 'Phonology', 'Reading Techniques', 'Essay Mechanics'] },
      { code: 'GST 112', title: 'Nigerian Peoples and Culture', units: 2, level: '100L', semester: 1, prescribedTextbook: 'Groundwork of Nigerian History (Prof. Obaro Ikime)', coreTopics: ['Pre-colonial Kingdoms', '1914 Amalgamation', 'Cultural Heritage', 'Civic Duties'] },
      { code: 'GST 113', title: 'Basic Digital Skills & Information Literacy', units: 2, level: '100L', semester: 2, prescribedTextbook: 'Information Literacy for Undergraduates (CPN)', coreTopics: ['Operating Systems', 'Spreadsheets', 'Cyber Hygiene', 'Plagiarism'] },
      { code: 'GST 212', title: 'Philosophy, Logic and Human Values', units: 2, level: '200L', semester: 1, prescribedTextbook: 'Knowing Philosophy (Prof. J. Omoregbe)', coreTopics: ['Deductive vs Inductive Logic', 'Fallacies', 'Validity vs Truth', 'Ubuntu Ethics'] },
      { code: 'GST 222', title: 'Peace Studies and Conflict Resolution', units: 2, level: '200L', semester: 2, prescribedTextbook: 'Peace & Conflict Studies in West Africa (Prof. S.G. Best)', coreTopics: ['Conflict Typologies', 'Mediation & ADR', 'Early Warning Systems', 'Human Security'] },
      { code: 'GST 311', title: 'Entrepreneurship and Innovation', units: 2, level: '300L', semester: 1, prescribedTextbook: 'Entrepreneurship: Theory & Practice (Hisrich & SMEDAN)', coreTopics: ['Feasibility Studies', 'Business Model Canvas', 'Cash Flow Analysis', 'CAC Registration'] },
      { code: 'GST 411', title: 'Venture Creation and Business Development', units: 2, level: '400L', semester: 1, prescribedTextbook: 'Venture Creation in Nigeria (NUC Manual)', coreTopics: ['Product Launch', 'Venture Capital', 'Tax Compliance', 'Scaling Enterprise'] },
    ],
  },
  GNS: {
    prefix: 'GNS',
    department: 'General Studies Unit',
    faculty: 'General Academic Studies',
    discipline: 'General Academic Studies',
    typicalInstitutions: ['OOU', 'LASU', 'UNILORIN', 'LAUTECH', 'State Universities'],
    description: 'General Studies nomenclature used by universities such as OOU, LASU, and UNILORIN.',
    commonCourses: [
      { code: 'GNS 101', title: 'Use of English I', units: 2, level: '100L', semester: 1, prescribedTextbook: 'Use of English Handbook (University Press)', coreTopics: ['Grammar', 'Lexis & Structure', 'Comprehension'] },
      { code: 'GNS 102', title: 'Use of English II', units: 2, level: '100L', semester: 2, prescribedTextbook: 'Academic Report Writing Manual', coreTopics: ['Report Writing', 'Citation Styles (APA/MLA)', 'Summary Skills'] },
      { code: 'GNS 201', title: 'Philosophy and Logic', units: 2, level: '200L', semester: 1, prescribedTextbook: 'A Simplified Introduction to Philosophy (Omoregbe)', coreTopics: ['Epistemology', 'Syllogisms', 'Logical Fallacies'] },
      { code: 'GNS 202', title: 'Peace and Conflict Studies', units: 2, level: '200L', semester: 2, prescribedTextbook: 'Conflict Resolution Mechanics (Best)', coreTopics: ['Communal Conflicts', 'Arbitration', 'Peacebuilding'] },
    ],
  },
  TMC: {
    prefix: 'TMC',
    department: 'Leadership & Total Man Development',
    faculty: 'Centre for Systems & Life Studies',
    discipline: 'Institutional Foundation',
    typicalInstitutions: ['Covenant University'],
    description: 'Covenant University proprietary Total Man Concept curriculum (Spiritual, Physical, Mental development).',
    commonCourses: [
      { code: 'TMC 111', title: 'Total Man Concept I (Foundational Character)', units: 1, level: '100L', semester: 1, prescribedTextbook: 'Towards Mental Excellence (David Oyedepo)', coreTopics: ['Spiritual Tenets', 'Mental Prowess', 'Physical Fitness', 'Academic Integrity'] },
      { code: 'TMC 211', title: 'Total Man Concept II (Leadership & Purpose)', units: 1, level: '200L', semester: 1, prescribedTextbook: 'Success Systems (Oyedepo)', coreTopics: ['Vision Casting', 'Self-Leadership', 'Time Stewardship'] },
    ],
  },
  GEDS: {
    prefix: 'GEDS',
    department: 'General Education Studies',
    faculty: 'General Studies',
    discipline: 'Institutional Foundation',
    typicalInstitutions: ['Babcock University'],
    description: 'Babcock University General Education Studies and Seventh-day Adventist values integration.',
    commonCourses: [
      { code: 'GEDS 101', title: 'Biblical Foundations & Ethics', units: 2, level: '100L', semester: 1, prescribedTextbook: 'Faith and Learning in Christian Higher Education', coreTopics: ['Christian Ethics', 'Holistic Health', 'Community Service'] },
      { code: 'GEDS 102', title: 'Philosophy of Christian Education', units: 2, level: '100L', semester: 2, prescribedTextbook: 'Education (Ellen G. White)', coreTopics: ['Character Building', 'Intellectual Stewardship', 'Moral Responsibility'] },
    ],
  },

  // ===================== COMPUTING & INFORMATION TECHNOLOGY =====================
  COS: {
    prefix: 'COS',
    department: 'Computer Science & Computing Systems',
    faculty: 'Faculty of Computing',
    discipline: 'Computing',
    typicalInstitutions: ['NUC CCMAS Unified Standard', 'UNN', 'Federal Universities'],
    description: 'Unified NUC CCMAS introductory computing prefix for all computing majors.',
    commonCourses: [
      { code: 'COS 101', title: 'Introduction to Computing Sciences', units: 3, level: '100L', semester: 1, prescribedTextbook: 'Computer Science Illuminated (Dale & Lewis)', coreTopics: ['Binary Number Systems', 'Logic Gates', 'Algorithms', 'Hardware/Software Hierarchy'] },
      { code: 'COS 102', title: 'Problem Solving & Programming Logic', units: 3, level: '100L', semester: 2, prescribedTextbook: 'Starting Out with Python (Tony Gaddis)', coreTopics: ['Control Flow', 'Functions', 'Recursion', 'Modular Design'] },
    ],
  },
  CSC: {
    prefix: 'CSC',
    department: 'Computer Science',
    faculty: 'Computing / Sciences',
    discipline: 'Computing',
    typicalInstitutions: ['UNILAG', 'UI', 'OAU', 'OOU', 'ABU', 'FUTA', 'FUTO', 'LASU', 'Covenant'],
    description: 'Standard Computer Science prefix across all Nigerian universities.',
    commonCourses: [
      { code: 'CSC 201', title: 'Computer Programming I (Structured & OOP)', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Object-Oriented Programming in C++ (Robert Lafore)', coreTopics: ['Classes & Objects', 'Encapsulation', 'Inheritance', 'Polymorphism'] },
      { code: 'CSC 203', title: 'Foundations of Sequential Program Design', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Structured Programming Concepts (Deitel & Deitel)', coreTopics: ['State Machines', 'Flowcharts', 'Pseudocode Verification', 'File I/O'] },
      { code: 'CSC 205', title: 'Discrete Mathematical Structures', units: 2, level: '200L', semester: 1, prescribedTextbook: 'Discrete Mathematics and Its Applications (Kenneth Rosen)', coreTopics: ['Set Theory', 'Propositional Calculus', 'Graph Theory', 'Combinatorics'] },
      { code: 'CSC 301', title: 'Data Structures and Algorithms', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Introduction to Algorithms (CLRS)', coreTopics: ['Big-O Analysis', 'Stacks & Queues', 'Binary Trees', 'Hash Tables', 'Sorting Algorithms'] },
      { code: 'CSC 303', title: 'Operating Systems & Concurrency', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Operating System Concepts (Silberschatz, Galvin & Gagne)', coreTopics: ['Process Scheduling', 'Deadlocks', 'Virtual Memory', 'Paging', 'File Systems'] },
      { code: 'CSC 305', title: 'Database Systems Design & SQL', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Fundamentals of Database Systems (Elmasri & Navathe)', coreTopics: ['ER Modeling', 'Relational Algebra', '1NF to BCNF Normalization', 'ACID Transactions'] },
      { code: 'CSC 307', title: 'Computer Networks and Data Communication', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Computer Networks (Andrew S. Tanenbaum)', coreTopics: ['OSI 7-Layer Model', 'TCP/IP Architecture', 'Routing Protocols', 'Subnetting'] },
      { code: 'CSC 401', title: 'Software Engineering Principles', units: 3, level: '400L', semester: 1, prescribedTextbook: 'Software Engineering (Ian Sommerville)', coreTopics: ['SDLC Models', 'Agile & Scrum', 'UML Architecture', 'Software Testing & QA'] },
      { code: 'CSC 403', title: 'Artificial Intelligence & Machine Learning', units: 3, level: '400L', semester: 1, prescribedTextbook: 'Artificial Intelligence: A Modern Approach (Russell & Norvig)', coreTopics: ['A* Search', 'Knowledge Representation', 'Neural Networks', 'Decision Trees'] },
      { code: 'CSC 405', title: 'Compiler Construction and Automata Theory', units: 3, level: '400L', semester: 1, prescribedTextbook: 'Compilers: Principles, Techniques & Tools (Dragon Book)', coreTopics: ['Lexical Analysis', 'Parsing (LL/LR)', 'Syntax-Directed Translation', 'Code Generation'] },
    ],
  },
  SEN: {
    prefix: 'SEN',
    department: 'Software Engineering',
    faculty: 'Faculty of Computing',
    discipline: 'Computing',
    typicalInstitutions: ['FUTA', 'Covenant', 'Babcock', 'Baze', 'Nile', 'UNILAG', 'Pan-Atlantic'],
    description: 'Dedicated Software Engineering degree program course prefix.',
    commonCourses: [
      { code: 'SEN 201', title: 'Introduction to Software Engineering', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Software Engineering: A Practitioner\'s Approach (Pressman)', coreTopics: ['Requirements Engineering', 'Design Patterns', 'Version Control (Git)'] },
      { code: 'SEN 301', title: 'Software Architecture and Design Patterns', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Design Patterns: Elements of Reusable Object-Oriented Software (GoF)', coreTopics: ['Factory Pattern', 'Singleton', 'Observer', 'Microservices Architecture'] },
      { code: 'SEN 401', title: 'Software Quality Assurance & Testing', units: 3, level: '400L', semester: 1, prescribedTextbook: 'Software Testing Fundamentals (Marnie Hutcheson)', coreTopics: ['Unit Testing', 'Integration Testing', 'CI/CD Pipelines', 'Automated Regression'] },
    ],
  },
  CYB: {
    prefix: 'CYB',
    department: 'Cyber Security',
    faculty: 'Faculty of Computing',
    discipline: 'Computing',
    typicalInstitutions: ['FUTMINNA', 'FUTO', 'Air Force Institute of Technology (AFIT)', 'Federal & Private Varsities'],
    description: 'Cyber Security and digital forensics course prefix.',
    commonCourses: [
      { code: 'CYB 201', title: 'Fundamentals of Cyber Security', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Computer Security: Principles and Practice (Stallings & Brown)', coreTopics: ['CIA Triad', 'Threat Vectors', 'Cryptography Basics', 'Access Controls'] },
      { code: 'CYB 301', title: 'Network Security & Cryptography', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Cryptography and Network Security (William Stallings)', coreTopics: ['RSA & AES Encryption', 'Public Key Infrastructure (PKI)', 'Firewalls & IDS/IPS'] },
      { code: 'CYB 401', title: 'Digital Forensics & Incident Response', units: 3, level: '400L', semester: 1, prescribedTextbook: 'Digital Forensics and Incident Response (Gerard Johansen)', coreTopics: ['Chain of Custody', 'Memory Analysis', 'Malware Reverse Engineering', 'NDPR Compliance'] },
    ],
  },
  IFT: {
    prefix: 'IFT',
    department: 'Information Technology',
    faculty: 'Faculty of Computing',
    discipline: 'Computing',
    typicalInstitutions: ['FUTO', 'FUTA', 'LAUTECH', 'State & Private Universities'],
    description: 'Information Technology systems and administration.',
    commonCourses: [
      { code: 'IFT 201', title: 'Introduction to Information Technology', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Information Technology Essentials', coreTopics: ['Enterprise Systems', 'Cloud Basics', 'Hardware Platforms'] },
      { code: 'IFT 301', title: 'Web Systems and Technologies', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Web Development and Design Foundations (Felke-Morris)', coreTopics: ['Full-Stack Architectures', 'REST APIs', 'Serverless Backend'] },
    ],
  },

  // ===================== ENGINEERING & TECHNOLOGY =====================
  ENG: {
    prefix: 'ENG',
    department: 'Faculty of Engineering General',
    faculty: 'Engineering & Technology',
    discipline: 'Engineering',
    typicalInstitutions: ['All Engineering Faculties in Nigeria (COREN-Accredited)'],
    description: 'General foundational engineering courses taken by all 100L & 200L engineering students.',
    commonCourses: [
      { code: 'ENG 101', title: 'Engineering Mathematics I', units: 3, level: '100L', semester: 1, prescribedTextbook: 'Engineering Mathematics (K.A. Stroud & Dexter Booth)', coreTopics: ['Differentiation & Integration', 'Matrices & Determinants', 'Coordinate Geometry', 'Trigonometric Series'] },
      { code: 'ENG 102', title: 'Engineering Mathematics II', units: 3, level: '100L', semester: 2, prescribedTextbook: 'Advanced Engineering Mathematics (Erwin Kreyszig)', coreTopics: ['Ordinary Differential Equations', 'Vectors', 'Partial Differentiation'] },
      { code: 'ENG 201', title: 'Advanced Engineering Mathematics I', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Advanced Engineering Mathematics (Kreyszig)', coreTopics: ['Fourier Series', 'Laplace Transforms', 'Numerical Methods'] },
      { code: 'ENG 203', title: 'Engineering Mechanics (Statics & Dynamics)', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Vector Mechanics for Engineers (Beer, Johnston & Cornwell)', coreTopics: ['Force Equilibrium', 'Trusses', 'Friction', 'Particle Kinematics', 'Work-Energy'] },
      { code: 'ENG 205', title: 'Engineering Drawing & CAD', units: 2, level: '200L', semester: 1, prescribedTextbook: 'Manual of Engineering Drawing (Simmons & Maguire)', coreTopics: ['Orthographic Projection', 'Isometric Views', 'Sectional Views', 'AutoCAD Drafting'] },
      { code: 'ENG 207', title: 'General Engineering Workshop Practice', units: 2, level: '200L', semester: 1, prescribedTextbook: 'Workshop Technology (W.A.J. Chapman)', coreTopics: ['Lathe Turning', 'Welding & Fabrication', 'Carpentry', 'Foundry Casting', 'Electrical Wiring'] },
    ],
  },
  MEE: {
    prefix: 'MEE',
    department: 'Mechanical Engineering',
    faculty: 'Engineering & Technology',
    discipline: 'Engineering',
    typicalInstitutions: ['FUTA', 'FUTO', 'UNILAG', 'ABU', 'UNN', 'OAU', 'OOU (MEG)'],
    description: 'Mechanical Engineering degree program prefix.',
    commonCourses: [
      { code: 'MEE 201', title: 'Engineering Thermodynamics I', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Thermodynamics: An Engineering Approach (Çengel & Boles)', coreTopics: ['First Law of Thermo', 'Closed/Open Systems', 'Property Tables', 'Steam Cycles'] },
      { code: 'MEE 301', title: 'Fluid Mechanics I', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Fluid Mechanics (Frank M. White)', coreTopics: ['Hydrostatics', 'Bernoulli Equation', 'Navier-Stokes Equations', 'Pipe Flow Losses'] },
      { code: 'MEE 303', title: 'Mechanics of Machines I', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Theory of Machines (R.S. Khurmi & J.K. Gupta)', coreTopics: ['Kinematic Linkages', 'Gears & Gear Trains', 'Cams', 'Flywheel Dynamics'] },
      { code: 'MEE 305', title: 'Strength of Materials II', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Strength of Materials (R.K. Rajput)', coreTopics: ['Bending Stress in Beams', 'Torsion of Shafts', 'Deflection of Beams', 'Mohr\'s Circle'] },
      { code: 'MEE 401', title: 'Heat and Mass Transfer', units: 3, level: '400L', semester: 1, prescribedTextbook: 'Fundamentals of Heat and Mass Transfer (Incropera & DeWitt)', coreTopics: ['Conduction (Fourier\'s Law)', 'Convection (Newton\'s Cooling)', 'Radiation (Stefan-Boltzmann)'] },
      { code: 'MEE 403', title: 'Mechanical Engineering Design', units: 3, level: '400L', semester: 1, prescribedTextbook: 'Shigley\'s Mechanical Engineering Design (Budynas & Nisbett)', coreTopics: ['Fatigue Failure', 'Bolted Joints', 'Welded Connections', 'Spring Design'] },
      { code: 'MEE 511', title: 'Applied Heat Transfer & Turbomachinery', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Principles of Turbomachinery (Turton)', coreTopics: ['Axial Compressors', 'Gas Turbines', 'Centrifugal Pumps', 'Euler Turbine Equation'] },
      { code: 'MEE 521', title: 'Internal Combustion Engines & Automotive Systems', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Internal Combustion Engine Fundamentals (Heywood)', coreTopics: ['Four-Stroke vs Two-Stroke Cycles', 'Fuel Injection Systems', 'Engine Emissions & Catalytic Converters'] },
      { code: 'MEE 531', title: 'Tribology, Lubrication & Failure Analysis', units: 2, level: '500L', semester: 1, prescribedTextbook: 'Engineering Tribology (Stachowiak & Batchelor)', coreTopics: ['Hydrodynamic Lubrication', 'Wear Mechanics', 'Viscosity Indexes in Nigerian Climates'] },
    ],
  },
  EEE: {
    prefix: 'EEE',
    department: 'Electrical & Electronic Engineering',
    faculty: 'Engineering & Technology',
    discipline: 'Engineering',
    typicalInstitutions: ['UNILAG', 'ABU', 'UNN', 'OAU', 'FUTA', 'FUTO', 'LASU', 'Covenant'],
    description: 'Electrical and Electronic Engineering program prefix.',
    commonCourses: [
      { code: 'EEE 201', title: 'Electric Circuit Theory I', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Fundamentals of Electric Circuits (Charles Alexander & Matthew Sadiku)', coreTopics: ['Kirchhoff\'s Current/Voltage Laws', 'Thevenin & Norton Equivalent Circuits', 'Mesh & Nodal Analysis'] },
      { code: 'EEE 301', title: 'Analogue Electronic Circuits', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Electronic Devices and Circuit Theory (Boylestad & Nashelsky)', coreTopics: ['BJT Transistor Biasing', 'MOSFET Amplifiers', 'Operational Amplifiers (Op-Amps)', 'Feedback Oscillators'] },
      { code: 'EEE 303', title: 'Electromagnetic Fields and Waves', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Elements of Electromagnetics (Prof. Matthew Sadiku)', coreTopics: ['Maxwell\'s Equations', 'Poynting Vector', 'Wave Propagation', 'Transmission Lines'] },
      { code: 'EEE 401', title: 'Power Systems Engineering I', units: 3, level: '400L', semester: 1, prescribedTextbook: 'Electric Power Systems (B.M. Weedy & B.J. Cory)', coreTopics: ['Transmission Line Parameters', 'Per-Unit System', 'Load Flow Analysis', 'Fault Calculations (Symmetrical/Unsymmetrical)'] },
      { code: 'EEE 511', title: 'Power Systems Reliability & High Voltage Engineering', units: 3, level: '500L', semester: 1, prescribedTextbook: 'High Voltage Engineering (Naidu & Kamaraju)', coreTopics: ['Corona Discharge', 'Lightning Surge Arresters', 'Insulation Coordination', 'Grid Reliability in Nigeria'] },
      { code: 'EEE 521', title: 'Control Engineering II & State-Space Systems', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Modern Control Engineering (Katsuhiko Ogata)', coreTopics: ['State-Space Representation', 'Controllability & Observability', 'Pole Placement Design', 'Nyquist Stability Criterion'] },
      { code: 'EEE 531', title: 'Telecommunication Networks & Microwave Systems', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Microwave Engineering (David M. Pozar)', coreTopics: ['Waveguides', 'Smith Chart Matching', 'Satellite Links', 'Cellular Handover Protocols'] },
    ],
  },
  CVE: {
    prefix: 'CVE',
    department: 'Civil Engineering',
    faculty: 'Engineering & Technology',
    discipline: 'Engineering',
    typicalInstitutions: ['All Engineering Faculties in Nigeria (UNILAG, FUTA, ABU, UNN, OOU - CIE)'],
    description: 'Civil Engineering degree program prefix.',
    commonCourses: [
      { code: 'CVE 201', title: 'Strength of Materials I', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Mechanics of Materials (Ferdinand Beer)', coreTopics: ['Stress and Strain', 'Hooke\'s Law', 'Thermal Stresses', 'Shear Force & Bending Moment Diagrams'] },
      { code: 'CVE 301', title: 'Structural Analysis I', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Structural Analysis (R.C. Hibbeler)', coreTopics: ['Deflections (Moment-Area, Conjugate Beam)', 'Influence Lines for Trusses', 'Energy Methods'] },
      { code: 'CVE 303', title: 'Soil Mechanics I', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Soil Mechanics (R.F. Craig)', coreTopics: ['Soil Phase Relationships', 'Atterberg Limits', 'Compaction & Permeability', 'Shear Strength of Soils'] },
      { code: 'CVE 401', title: 'Design of Reinforced Concrete Structures', units: 3, level: '400L', semester: 1, prescribedTextbook: 'Reinforced Concrete Design to BS 8110 / Eurocode 2 (Mosley, Bungey & Hulse)', coreTopics: ['Limit State Design', 'Bending & Shear in RC Beams', 'Solid Slabs Design', 'Axially Loaded RC Columns'] },
      { code: 'CVE 511', title: 'Advanced Structural Engineering & Pre-Stressed Concrete', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Prestressed Concrete (N. Krishna Raju)', coreTopics: ['Pre-tensioning vs Post-tensioning', 'Loss of Pre-stress', 'Cable Profiles', 'Finite Element Analysis (FEA)'] },
      { code: 'CVE 521', title: 'Highway and Transportation Engineering II', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Highway Engineering (Wright & Dixon)', coreTopics: ['Flexible vs Rigid Pavement Design', 'CBR Method', 'Bituminous Materials', 'Traffic Capacity & Level of Service'] },
      { code: 'CVE 531', title: 'Water Resources & Hydrological Engineering', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Applied Hydrology (Chow, Maidment & Mays)', coreTopics: ['Hydrograph Analysis (Unit Hydrograph)', 'Flood Routing', 'Dam Spillway Design', 'Groundwater Well Hydraulics'] },
    ],
  },
  CHE: {
    prefix: 'CHE',
    department: 'Chemical Engineering',
    faculty: 'Engineering & Technology',
    discipline: 'Engineering',
    typicalInstitutions: ['OAU', 'UNILAG', 'ABU', 'FUTO', 'FUPRE', 'Covenant'],
    description: 'Chemical Engineering program prefix.',
    commonCourses: [
      { code: 'CHE 201', title: 'Material and Energy Balances', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Elementary Principles of Chemical Processes (Felder & Rousseau)', coreTopics: ['Mass Conservation', 'Recycle & Bypass Streams', 'Combustion Stoichiometry', 'Enthalpy Balances'] },
      { code: 'CHE 301', title: 'Chemical Engineering Thermodynamics', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Introduction to Chemical Engineering Thermodynamics (Smith, Van Ness & Abbott)', coreTopics: ['Phase Equilibria (VLE)', 'Fugacity', 'Chemical Reaction Equilibrium'] },
      { code: 'CHE 303', title: 'Separation Processes I (Distillation & Absorption)', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Coulson & Richardson\'s Chemical Engineering (Vol 2)', coreTopics: ['McCabe-Thiele Method', 'Packed Tower Design', 'Liquid-Liquid Extraction'] },
      { code: 'CHE 511', title: 'Chemical Process Dynamics and Automated Control', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Process Systems Analysis and Control (Coughanowr & LeBlanc)', coreTopics: ['Transfer Functions', 'PID Controller Tuning (Ziegler-Nichols)', 'Bode & Nyquist Plots', 'Process Safety Interlocks'] },
      { code: 'CHE 521', title: 'Petrochemical Technology and Petroleum Refining', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Petroleum Refining: Technology and Economics (Gary & Handwerk)', coreTopics: ['Atmospheric & Vacuum Distillation', 'Catalytic Cracking (FCC)', 'Hydrotreating', 'Polymer Synthesis'] },
    ],
  },
  PNG: {
    prefix: 'PNG',
    department: 'Petroleum & Natural Gas Engineering',
    faculty: 'Engineering / Earth Sciences',
    discipline: 'Engineering',
    typicalInstitutions: ['FUPRE', 'UNIPORT', 'UI', 'FUTO', 'Covenant'],
    description: 'Petroleum and Natural Gas Engineering specialized course prefix.',
    commonCourses: [
      { code: 'PNG 201', title: 'Introduction to Petroleum Engineering', units: 2, level: '200L', semester: 1, prescribedTextbook: 'Petroleum Engineering Handbook (Bradley)', coreTopics: ['Origin of Petroleum', 'Reservoir Rocks', 'Drilling Rig Systems', 'Refining Overview'] },
      { code: 'PNG 301', title: 'Petroleum Reservoir Engineering I', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Fundamentals of Reservoir Engineering (Dake)', coreTopics: ['Porosity & Permeability', 'Capillary Pressure & Wettability', 'PVT Properties of Crude Oil', 'Material Balance Equation'] },
      { code: 'PNG 303', title: 'Drilling Engineering I', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Applied Drilling Engineering (Bourgoyne et al.)', coreTopics: ['Drilling Fluids (Mud Hydraulics)', 'Bit Selection', 'Casing Design', 'Well Control (Kick Detection)'] },
      { code: 'PNG 511', title: 'Enhanced Oil Recovery (EOR) Methods', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Enhanced Oil Recovery (Green & Willhite)', coreTopics: ['Thermal Recovery (Steam Injection)', 'Chemical Flooding (Polymer/Surfactant)', 'Gas Injection (CO2/Miscible Flooding)', 'Sweep Efficiency'] },
      { code: 'PNG 521', title: 'Well Logging and Formation Evaluation', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Well Logging for Earth Scientists (Ellis & Singer)', coreTopics: ['Gamma Ray & Spontaneous Potential (SP) Logs', 'Resistivity Logs (Archie\'s Equation)', 'Neutron-Density Porosity Crossplots'] },
    ],
  },
  MCE: {
    prefix: 'MCE',
    department: 'Mechatronics Engineering',
    faculty: 'Engineering & Technology',
    discipline: 'Engineering',
    typicalInstitutions: ['FUTA', 'FUTMINNA', 'ABUAD', 'UNILORIN', 'Air Force Institute of Technology'],
    description: 'Mechatronics, robotics, and automated systems engineering prefix.',
    commonCourses: [
      { code: 'MCE 201', title: 'Introduction to Mechatronics Systems', units: 2, level: '200L', semester: 1, prescribedTextbook: 'Mechatronics: Electronic Control Systems in Mechanical Engineering (Bolton)', coreTopics: ['Sensors & Transducers', 'Actuators', 'Signal Conditioning'] },
      { code: 'MCE 301', title: 'Microprocessors and Embedded Systems', units: 3, level: '300L', semester: 1, prescribedTextbook: 'The 8051 Microcontroller and Embedded Systems (Mazidi)', coreTopics: ['ARM Microcontrollers', 'Interfacing ADC/DAC', 'Real-Time Interrupts'] },
      { code: 'MCE 401', title: 'Robotics and Industrial Automation', units: 3, level: '400L', semester: 1, prescribedTextbook: 'Introduction to Robotics: Mechanics and Control (Craig)', coreTopics: ['Forward & Inverse Kinematics', 'Jacobians', 'PLC Ladder Logic'] },
    ],
  },

  // ===================== AGRICULTURAL SCIENCES =====================
  AGR: {
    prefix: 'AGR',
    department: 'General Agriculture',
    faculty: 'Agricultural Sciences',
    discipline: 'Agriculture',
    typicalInstitutions: ['FUNAAB', 'FUAM (UAM)', 'MOUAU', 'OAU', 'UI', 'UNN', 'FUAZ Zuru'],
    description: 'Foundational agricultural science courses across all agricultural colleges in Nigeria.',
    commonCourses: [
      { code: 'AGR 101', title: 'Introduction to Agriculture', units: 2, level: '100L', semester: 1, prescribedTextbook: 'Introduction to Tropical Agriculture (Youdeowei et al.)', coreTopics: ['Agriculture & National GDP', 'Farming Systems', 'Agro-Ecological Zones in Nigeria'] },
      { code: 'AGR 201', title: 'General Agriculture Practical Year', units: 2, level: '200L', semester: 1, prescribedTextbook: 'Practical Agriculture Handbook (FUNAAB Press)', coreTopics: ['Farm Power & Machinery', 'Seedbed Preparation', 'Harvesting Techniques'] },
    ],
  },
  CPP: {
    prefix: 'CPP',
    department: 'Crop Production & Plant Protection',
    faculty: 'Agricultural Sciences',
    discipline: 'Agriculture',
    typicalInstitutions: ['FUNAAB', 'FUAM', 'MOUAU', 'UI', 'OAU', 'State Agricultural Varsities'],
    description: 'Crop production, plant pathology, and agronomy course prefix.',
    commonCourses: [
      { code: 'CPP 201', title: 'Principles of Crop Production', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Principles of Crop Production in the Tropics (Prof. C.O. Agboola)', coreTopics: ['Crop Classification', 'Photosynthetic Pathways (C3 vs C4)', 'Crop Nutrition', 'Weed Science'] },
      { code: 'CPP 301', title: 'Grain and Legume Crop Agronomy', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Tropical Grain Legumes (IITA Manual)', coreTopics: ['Maize & Cowpea Cultivation', 'Cassava Tuberization', 'Storage Pest Management'] },
    ],
  },
  APH: {
    prefix: 'APH',
    department: 'Animal Production & Health',
    faculty: 'Agricultural Sciences',
    discipline: 'Agriculture',
    typicalInstitutions: ['FUNAAB', 'FUAM', 'MOUAU', 'OOU', 'UI', 'ABU'],
    description: 'Animal production, breeding, nutrition, and livestock management prefix.',
    commonCourses: [
      { code: 'APH 201', title: 'Introduction to Animal Agriculture', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Animal Husbandry in the Tropics (Williamson & Payne)', coreTopics: ['Ruminant vs Non-Ruminant Anatomy', 'Poultry Management', 'Swine Husbandry'] },
      { code: 'APH 301', title: 'Ruminant Animal Production & Management', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Beef and Dairy Cattle Management in Africa (Prof. A.O. Longe)', coreTopics: ['Cattle Breeds (White Fulani, Bunaji)', 'Pasture Management', 'Milk Synthesis'] },
    ],
  },
  SOS: {
    prefix: 'SOS',
    department: 'Soil Science & Land Management',
    faculty: 'Agricultural Sciences',
    discipline: 'Agriculture',
    typicalInstitutions: ['FUNAAB', 'FUAM', 'MOUAU', 'OAU', 'UI'],
    description: 'Soil physics, chemistry, fertility, and soil conservation.',
    commonCourses: [
      { code: 'SOS 201', title: 'Introduction to Soil Science', units: 3, level: '200L', semester: 1, prescribedTextbook: 'The Nature and Properties of Soils (Brady & Weil)', coreTopics: ['Soil Horizons', 'Texture & Structure', 'Cation Exchange Capacity (CEC)', 'Soil pH & Liming'] },
      { code: 'SOS 301', title: 'Soil Fertility and Plant Nutrition', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Soil Fertility Management for Sustainable Agriculture (Chude)', coreTopics: ['NPK Fertilizer Calculations', 'Micronutrient Deficiencies', 'Soil Organic Matter Dynamics'] },
    ],
  },
  FWM: {
    prefix: 'FWM',
    department: 'Forestry and Wildlife Management',
    faculty: 'Agricultural Sciences / Environmental Resources',
    discipline: 'Agriculture',
    typicalInstitutions: ['FUNAAB', 'FUAM', 'MOUAU', 'UI', 'FUTA'],
    description: 'Silviculture, wildlife conservation, and forest economics prefix.',
    commonCourses: [
      { code: 'FWM 201', title: 'Introduction to Forestry and Wildlife', units: 2, level: '200L', semester: 1, prescribedTextbook: 'Principles of Silviculture in Nigeria (Oseni)', coreTopics: ['Tropical Rain Forest Zones', 'Savanna Woodlands', 'Protected Reserves in Nigeria (Yankari, Kainji)'] },
    ],
  },
  AQF: {
    prefix: 'AQF',
    department: 'Aquaculture and Fisheries Management',
    faculty: 'Agricultural Sciences',
    discipline: 'Agriculture',
    typicalInstitutions: ['FUNAAB', 'FUAM', 'MOUAU', 'UI', 'LASU', 'UNILAG'],
    description: 'Fish breeding, pond construction, and fisheries management prefix.',
    commonCourses: [
      { code: 'AQF 201', title: 'Introduction to Fisheries & Aquaculture', units: 2, level: '200L', semester: 1, prescribedTextbook: 'Fish Farming in Nigeria (Prof. Ita)', coreTopics: ['Catfish & Tilapia Culture', 'Hatchery Management', 'Water Quality Parameters (DO, pH, Ammonia)'] },
    ],
  },

  // ===================== LAW & JURISPRUDENCE =====================
  LAW: {
    prefix: 'LAW',
    department: 'Faculty of Law General',
    faculty: 'Faculty of Law',
    discipline: 'Law',
    typicalInstitutions: ['All NUC-Accredited Law Faculties (UNILAG, UI, OAU, OOU, ABU, UNN, LASU, ABUAD)'],
    description: 'Foundational legal study prefix used in 100L across Nigerian law faculties.',
    commonCourses: [
      { code: 'LAW 101', title: 'Legal Method I', units: 4, level: '100L', semester: 1, prescribedTextbook: 'The Nigerian Legal System (Ese Malemi) / Learning the Law (Glanville Williams)', coreTopics: ['Nature of Law', 'Sources of Nigerian Law', 'Ratio Decidendi vs Obiter Dicta', 'Statutory Interpretation Rules (Literal, Golden, Mischief)'] },
      { code: 'LAW 102', title: 'Legal Method II', units: 4, level: '100L', semester: 2, prescribedTextbook: 'The Nigerian Legal System (A.O. Obilade)', coreTopics: ['Judicial Precedent (Stare Decisis)', 'Law Reporting in Nigeria', 'Hierarchy of Courts', 'Legal Research Methods'] },
    ],
  },
  PUL: {
    prefix: 'PUL',
    department: 'Public and International Law',
    faculty: 'Faculty of Law',
    discipline: 'Law',
    typicalInstitutions: ['UNILAG', 'OOU', 'UI', 'OAU', 'LASU', 'ABU', 'UNN'],
    description: 'Constitutional law, administrative law, criminal law, and human rights.',
    commonCourses: [
      { code: 'PUL 201', title: 'Constitutional Law I', units: 4, level: '200L', semester: 1, prescribedTextbook: 'Constitutional Law in Nigeria (Prof. Kehinde Mowoe) / Nwabueze', coreTopics: ['Constitutional Supremacy (Section 1)', 'Separation of Powers', 'Rule of Law', 'Citizenship & Fundamental Rights (Chapter IV)'] },
      { code: 'PUL 203', title: 'Nigerian Legal System I', units: 4, level: '200L', semester: 1, prescribedTextbook: 'The Nigerian Legal System (Ese Malemi)', coreTopics: ['English Law Received in Nigeria', 'Customary Law Validity Tests (Repugnancy & Incompatibility)', 'Islamic Law in Northern Nigeria'] },
      { code: 'PUL 301', title: 'Criminal Law I', units: 4, level: '300L', semester: 1, prescribedTextbook: 'Criminal Law in Nigeria (Okonkwo & Naish)', coreTopics: ['Actus Reus & Mens Rea', 'General Defences (Insanity/M\'Naghten, Self-Defence, Provocation)', 'Parties to Offences', 'Homicide (Murder vs Manslaughter)'] },
      { code: 'PUL 401', title: 'Land Law I (Property Law)', units: 4, level: '400L', semester: 1, prescribedTextbook: 'Practical Approach to Law of Real Property in Nigeria (Prof. I.O. Smith)', coreTopics: ['Customary Land Tenure', 'Alienation of Family Property', 'Land Use Act 1978 (Section 22 Governor\'s Consent)', 'Certificates of Occupancy (C of O)'] },
      { code: 'PUL 403', title: 'Law of Evidence I', units: 4, level: '400L', semester: 1, prescribedTextbook: 'The Law of Evidence in Nigeria (Dr. T. Akinola Aguda / Evidence Act 2011)', coreTopics: ['Relevance vs Admissibility', 'Hearsay Evidence & Exceptions', 'Burden of Proof (Beyond Reasonable Doubt in Crime, Balance of Probabilities in Civil)', 'Estoppel'] },
      { code: 'PUL 511', title: 'Administrative Law & Judicial Review', units: 4, level: '500L', semester: 1, prescribedTextbook: 'Administrative Law in Nigeria (Prof. Peter Oluyede)', coreTopics: ['Ultra Vires Doctrine', 'Natural Justice (Audi Alteram Partem, Nemo Judex)', 'Prerogative Writs (Mandamus, Certiorari, Prohibition)', 'Ombudsman System'] },
      { code: 'PUL 521', title: 'Nigerian Oil and Gas Law & Energy Regulations', units: 4, level: '500L', semester: 1, prescribedTextbook: 'Nigerian Petroleum Law (Omorogbe) / PIA 2021', coreTopics: ['Petroleum Industry Act (PIA 2021)', 'Concession Contracts & Production Sharing Contracts (PSC)', 'Host Community Development Trusts', 'Decommissioning Liabilities'] },
      { code: 'PUL 531', title: 'Criminology, Penology and Victimology', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Criminology in Nigeria (Dambazau)', coreTopics: ['Theories of Crime Causation', 'Sentencing Policies & Prison Reforms', 'Non-Custodial Sanctions (ACJA 2015)'] },
    ],
  },
  CIL: {
    prefix: 'CIL',
    department: 'Commercial and Industrial Law',
    faculty: 'Faculty of Law',
    discipline: 'Law',
    typicalInstitutions: ['UNILAG', 'OOU', 'LASU', 'UI', 'OAU', 'ABU'],
    description: 'Contract law, torts, commercial transactions, and labor law prefix.',
    commonCourses: [
      { code: 'CIL 201', title: 'Law of Contract I', units: 4, level: '200L', semester: 1, prescribedTextbook: 'Nigerian Law of Contract (Prof. Itse E. Sagay)', coreTopics: ['Offer & Acceptance (Carlill v Carbolic)', 'Consideration (Currie v Misa)', 'Intention to Create Legal Relations', 'Privity of Contract'] },
      { code: 'CIL 301', title: 'Law of Torts I', units: 4, level: '300L', semester: 1, prescribedTextbook: 'The Nigerian Law of Torts (Gilbert Kodilinye & Oluwole Aluko)', coreTopics: ['Negligence & Duty of Care (Donoghue v Stevenson)', 'Breach of Duty', 'Remoteness of Damage (The Wagon Mound)', 'Trespass to Person (Assault/Battery/False Imprisonment)'] },
      { code: 'CIL 401', title: 'Equity and Trusts I', units: 4, level: '400L', semester: 1, prescribedTextbook: 'Modern Equity (Hanbury & Martin) / Kodilinye', coreTopics: ['Maxims of Equity', 'Equitable Remedies (Injunctions, Specific Performance)', 'Creation of Express Trusts', 'Charitable Trusts'] },
      { code: 'CIL 511', title: 'Company Law & Corporate Governance', units: 4, level: '500L', semester: 1, prescribedTextbook: 'Nigerian Company Law & Practice (Prof. J.O. Orojo) / CAMA 2020', coreTopics: ['Corporate Personality (Salomon v Salomon)', 'Lifting the Veil of Incorporation', 'Directors\' Duties & Fiduciary Liabilities', 'Shareholder Minority Protection (Foss v Harbottle Exceptions)'] },
      { code: 'CIL 521', title: 'Banking Law & Negotiable Instruments', units: 4, level: '500L', semester: 1, prescribedTextbook: 'Banking Law in Nigeria (Elegido / BOFIA 2020)', coreTopics: ['Banker-Customer Relationship', 'Cheques, Promissory Notes & Bills of Exchange', 'Bank Guarantees & Letters of Credit', 'AMCON Debt Recovery'] },
      { code: 'CIL 531', title: 'Intellectual Property Law (Patents, Trademarks & Copyright)', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Intellectual Property Law in Nigeria (Prof. F.O. Babafemi)', coreTopics: ['Copyright Act 2022', 'Patentability Criteria', 'Trademark Infringement & Passing Off', 'Industrial Designs Protection'] },
    ],
  },
  JIL: {
    prefix: 'JIL',
    department: 'Jurisprudence & International Law',
    faculty: 'Faculty of Law',
    discipline: 'Law',
    typicalInstitutions: ['UNILAG', 'ABU', 'UI', 'OAU', 'UNN', 'OOU', 'LASU', 'Afe Babalola'],
    description: 'Jurisprudence, legal theory, and public international law prefix.',
    commonCourses: [
      { code: 'JIL 401', title: 'Jurisprudence and Legal Theory I', units: 3, level: '400L', semester: 1, prescribedTextbook: 'Jurisprudence (Prof. J.M. Elegido) / Lloyd\'s Introduction to Jurisprudence', coreTopics: ['Natural Law School (Aquinas, Fuller)', 'Legal Positivism (Bentham, Austin, Hart)', 'Pure Theory of Law (Hans Kelsen)', 'Historical & Sociological Jurisprudence'] },
      { code: 'JIL 511', title: 'Public International Law I', units: 4, level: '500L', semester: 1, prescribedTextbook: 'International Law (Malcolm N. Shaw)', coreTopics: ['Sources of International Law (Article 38 ICJ Statute)', 'Statehood, Recognition & Sovereignty', 'Territorial Jurisdiction & Immunity', 'Treaty Law (Vienna Convention)'] },
      { code: 'JIL 521', title: 'Jurisprudence and Legal Theory II', units: 3, level: '500L', semester: 1, prescribedTextbook: 'Jurisprudence (Dias / Freeman)', coreTopics: ['Legal Realism (American & Scandinavian)', 'Marxist Theory of Law', 'African Jurisprudence & Indigenous Customary Norms', 'Theories of Justice (Rawls, Nozick)'] },
    ],
  },

  // ===================== BASIC MEDICAL & CLINICAL SCIENCES =====================
  ANA: {
    prefix: 'ANA',
    department: 'Human Anatomy',
    faculty: 'Basic Medical Sciences',
    discipline: 'Basic Medical Sciences',
    typicalInstitutions: ['All Medical Schools (UNILAG, UI, OAU, OOU, ABU, UNN, FUHSO, BMU, KDUMS)'],
    description: 'Gross anatomy, histology, embryology, and neuroanatomy course prefix.',
    commonCourses: [
      { code: 'ANA 201', title: 'Gross Anatomy of Upper & Lower Limbs', units: 4, level: '200L', semester: 1, prescribedTextbook: 'Clinically Oriented Anatomy (Keith L. Moore & Dalley)', coreTopics: ['Brachial Plexus', 'Femoral Triangle', 'Knee Joint Biomechanics', 'Arterial Anastomoses'] },
      { code: 'ANA 203', title: 'General & Systemic Histology', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Junqueira\'s Basic Histology', coreTopics: ['Epithelial Tissues', 'Connective Tissue', 'Muscle Histology', 'Microscopic Organ Architecture'] },
      { code: 'ANA 301', title: 'Neuroanatomy and Head & Neck', units: 4, level: '300L', semester: 1, prescribedTextbook: 'Netter\'s Atlas of Human Anatomy / Snell\'s Clinical Neuroanatomy', coreTopics: ['Cranial Nerves (I to XII)', 'Circle of Willis', 'Cerebral Cortex Localization', 'Spinal Cord Tracts'] },
    ],
  },
  PHS: {
    prefix: 'PHS',
    department: 'Human Physiology',
    faculty: 'Basic Medical Sciences',
    discipline: 'Basic Medical Sciences',
    typicalInstitutions: ['All Medical Schools in Nigeria (UI, UNILAG, OOU - PHS / UNN - PGY)'],
    description: 'Human physiology systems, biophysics, and regulation prefix.',
    commonCourses: [
      { code: 'PHS 201', title: 'General Principles of Physiology & Blood', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Guyton and Hall Textbook of Medical Physiology', coreTopics: ['Homeostasis', 'Resting Membrane Potential', 'Erythropoiesis', 'Hemostasis & Blood Clotting Cascades'] },
      { code: 'PHS 301', title: 'Cardiovascular & Respiratory Physiology', units: 4, level: '300L', semester: 1, prescribedTextbook: 'Ganong\'s Review of Medical Physiology', coreTopics: ['Cardiac Output Regulation', 'ECG Waveform Analysis', 'Lung Compliance & Surfactant', 'Gas Exchange & O2-Hemoglobin Curve'] },
    ],
  },
  BCH: {
    prefix: 'BCH',
    department: 'Biochemistry / Medical Biochemistry',
    faculty: 'Basic Medical Sciences / Science',
    discipline: 'Basic Medical Sciences',
    typicalInstitutions: ['All Medical & Pure Science Colleges across Nigeria'],
    description: 'Biochemistry biomolecules, enzymes, and metabolic pathways prefix.',
    commonCourses: [
      { code: 'BCH 201', title: 'General Biochemistry I (Biomolecules)', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Lehninger Principles of Biochemistry (Nelson & Cox)', coreTopics: ['Amino Acids & Peptide Bonds', 'Protein Structures (1° to 4°)', 'Carbohydrate Chemistry', 'Lipid Classifications'] },
      { code: 'BCH 301', title: 'Enzymology and Enzyme Kinetics', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Biochemistry (Lippincott\'s Illustrated Reviews)', coreTopics: ['Michaelis-Menten Equation (Km, Vmax)', 'Lineweaver-Burk Plot', 'Competitive vs Non-Competitive Inhibition', 'Allosteric Regulation'] },
      { code: 'BCH 303', title: 'Intermediary Metabolism (Glycolysis & Krebs)', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Harper\'s Illustrated Biochemistry', coreTopics: ['10 Steps of Glycolysis', 'Pyruvate Dehydrogenase Complex', 'Citric Acid Cycle (TCA)', 'Oxidative Phosphorylation & ATP Synthase'] },
    ],
  },
  MLS: {
    prefix: 'MLS',
    department: 'Medical Laboratory Science',
    faculty: 'Allied Health Sciences',
    discipline: 'Allied Health Sciences',
    typicalInstitutions: ['UNN', 'UNIBEN', 'UNIMAID', 'OOU', 'ABU', 'FUHSO', 'Private Medical Varsities'],
    description: 'Medical Laboratory Science clinical diagnostics prefix.',
    commonCourses: [
      { code: 'MLS 201', title: 'Introduction to Medical Laboratory Science', units: 2, level: '200L', semester: 1, prescribedTextbook: 'District Laboratory Practice in Tropical Countries (Monica Cheesbrough)', coreTopics: ['Lab Safety & Biohazards', 'Microscopy Techniques', 'Specimen Collection & Preservation'] },
      { code: 'MLS 301', title: 'Clinical Haematology & Blood Transfusion', units: 4, level: '300L', semester: 1, prescribedTextbook: 'Essential Haematology (Hoffbrand & Moss)', coreTopics: ['Complete Blood Count (CBC)', 'Sickle Cell Genotyping (HbSS)', 'ABO & Rhesus Compatibility', 'Coagulation Disorders'] },
    ],
  },
  NSC: {
    prefix: 'NSC',
    department: 'Nursing Science',
    faculty: 'Allied Health Sciences',
    discipline: 'Allied Health Sciences',
    typicalInstitutions: ['UI', 'OAU', 'UNILAG', 'OOU', 'UNN', 'ABU', 'Babcock', 'Afe Babalola'],
    description: 'Nursing Science professional curriculum prefix.',
    commonCourses: [
      { code: 'NSC 201', title: 'Foundations of Nursing Practice', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Fundamentals of Nursing (Potter & Perry)', coreTopics: ['Nursing Process (ADPIE)', 'Vital Signs Monitoring', 'Infection Control & Asepsis', 'Patient Safety'] },
      { code: 'NSC 301', title: 'Medical-Surgical Nursing I', units: 4, level: '300L', semester: 1, prescribedTextbook: 'Brunner & Suddarth\'s Textbook of Medical-Surgical Nursing', coreTopics: ['Perioperative Nursing', 'Hypertension & Heart Failure Management', 'Diabetes Care Protocols'] },
      { code: 'NSC 401', title: 'Maternal and Child Health Nursing', units: 4, level: '400L', semester: 1, prescribedTextbook: 'Maternal & Child Health Nursing (Adele Pillitteri)', coreTopics: ['Antenatal Care', 'Labor Management', 'Postpartum Complications', 'Immunization Schedules'] },
      { code: 'NSC 501', title: 'Community Health Nursing & Epidemiology', units: 4, level: '500L', semester: 1, prescribedTextbook: 'Community Health Nursing (Stanhope & Lancaster)', coreTopics: ['Primary Health Care (PHC)', 'Epidemiological Triad', 'Outbreak Investigation in Nigeria'] },
    ],
  },
  MED: {
    prefix: 'MED',
    department: 'Department of Medicine (Clinical)',
    faculty: 'Faculty of Clinical Sciences',
    discipline: 'Clinical Medicine',
    typicalInstitutions: ['UI', 'UNILAG', 'ABU', 'UNN', 'OAU', 'OOU', 'LASU', 'FUHSO', 'BMU', 'KDUMS', 'ABUAD', 'Babcock'],
    description: 'Clinical Medicine, Cardiology, Neurology, Gastroenterology, and Infectious Diseases in 4th to 6th MB;BS.',
    commonCourses: [
      { code: 'MED 401', title: 'Introductory Clinical Clerkship & History Taking', units: 4, level: '400L', semester: 1, prescribedTextbook: 'Macleod\'s Clinical Examination (Innes, Dover & Fairhurst)', coreTopics: ['Cardiovascular System Examination', 'Respiratory Auscultation', 'Abdominal Palpation', 'Neurological Reflexes'] },
      { code: 'MED 501', title: 'Systemic Internal Medicine I (Cardiology & Pulmonology)', units: 6, level: '500L', semester: 1, prescribedTextbook: 'Davidson\'s Principles and Practice of Medicine (Ralston et al.)', coreTopics: ['Hypertensive Heart Disease', 'Infective Endocarditis', 'Tuberculosis & Pneumonia', 'Asthma & COPD Protocols'] },
      { code: 'MED 601', title: 'Clinical Cardiology & Nephrology', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Harrison\'s Principles of Internal Medicine (Loscalzo et al.)', coreTopics: ['Acute Coronary Syndrome (STEMI/NSTEMI)', 'Heart Failure with Reduced Ejection Fraction', 'Chronic Kidney Disease (CKD Stage 1-5)', 'Dialysis Indications'] },
      { code: 'MED 621', title: 'Neurology, Endocrinology & Rheumatology', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Kumar and Clark\'s Clinical Medicine (Feather, Randall & Waterhouse)', coreTopics: ['Cerebrovascular Accident (Stroke Management)', 'Diabetic Ketoacidosis (DKA) Resuscitation', 'Thyroid Storm', 'Systemic Lupus Erythematosus (SLE)'] },
      { code: 'MED 631', title: 'Advanced Clinical Clerkship & Tropical Infectious Diseases', units: 8, level: '600L', semester: 1, prescribedTextbook: 'Manson\'s Tropical Diseases (Farrar et al.) / Davidson\'s Medicine', coreTopics: ['Severe Falciparum Malaria with Cerebral Complications', 'Lassa Fever & Viral Haemorrhagic Protocols', 'HIV/AIDS Opportunistic Infections', 'Meningitis Outbreaks in Sahel Belt'] },
    ],
  },
  SUR: {
    prefix: 'SUR',
    department: 'Department of Surgery (Clinical)',
    faculty: 'Faculty of Clinical Sciences',
    discipline: 'Clinical Medicine',
    typicalInstitutions: ['All NUC & MDCN-Accredited Colleges of Medicine across Nigeria'],
    description: 'General Surgery, Traumatology, Orthopaedics, Urology, Neurosurgery, and Surgical Clerkship in 4th-6th MB;BS.',
    commonCourses: [
      { code: 'SUR 401', title: 'Principles of Surgery & Wound Healing', units: 4, level: '400L', semester: 1, prescribedTextbook: 'Bailey & Love\'s Short Practice of Surgery (O\'Connell, McCaskie & Sayers)', coreTopics: ['Surgical Infection & Asepsis', 'Shock (Hypovolaemic, Septic, Cardiogenic)', 'Suturing & Knot Tying Techniques', 'Haemostasis & Blood Transfusion'] },
      { code: 'SUR 501', title: 'Systemic Surgery & Surgical Pathology', units: 6, level: '500L', semester: 1, prescribedTextbook: 'Schwartz\'s Principles of Surgery (Brunicardi et al.)', coreTopics: ['Acute Appendicitis & Peritonitis', 'Intestinal Obstruction', 'Inguinal & Femoral Hernias', 'Breast Carcinoma Staging & Mastectomy'] },
      { code: 'SUR 601', title: 'General Surgical Principles & Acute Abdomen', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Bailey & Love\'s Short Practice of Surgery', coreTopics: ['Emergency Laparotomy', 'Peptic Ulcer Perforation', 'Typhoid Ileal Perforation (High Nigerian Incidence)', 'Blunt Abdominal Trauma (Splenic Rupture)'] },
      { code: 'SUR 621', title: 'Traumatology, Burns & Critical Care Surgery', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Advanced Trauma Life Support (ATLS Manual)', coreTopics: ['Primary Survey (ABCDE Resuscitation)', 'Parkland Burns Fluid Calculation Formula', 'Tension Pneumothorax Emergency Decompression', 'Damage Control Surgery'] },
      { code: 'SUR 631', title: 'Specialist Surgical Disciplines (Urology, Orthopaedics & Neurosurgery)', units: 8, level: '600L', semester: 1, prescribedTextbook: 'Apley & Solomon\'s System of Orthopaedics and Trauma / Campbell\'s Urology', coreTopics: ['Benign Prostatic Hyperplasia (BPH) & TURP', 'Compound Fractures & External Fixation', 'Glasgow Coma Scale (GCS) & Extradural Haematoma', 'Paediatric Inguinoscrotal Conditions'] },
    ],
  },
  OBG: {
    prefix: 'OBG',
    department: 'Obstetrics and Gynaecology',
    faculty: 'Faculty of Clinical Sciences',
    discipline: 'Clinical Medicine',
    typicalInstitutions: ['All Nigerian Colleges of Medicine (UI, UNILAG, OOU, ABU, UNN, LASU)'],
    description: 'Obstetrics, antenatal care, labor management, operative deliveries, and gynaecology in 5th-6th MB;BS.',
    commonCourses: [
      { code: 'OBG 501', title: 'Basic Obstetrics & Antenatal Physiology', units: 6, level: '500L', semester: 1, prescribedTextbook: 'Ten Teachers: Obstetrics by Ten Teachers (Kenny & B-Lynch)', coreTopics: ['Maternal Physiological Adaptations to Pregnancy', 'Normal Antenatal Screening Protocols', 'Fetal Wellbeing Assessment (CTG, Biophysical Profile)'] },
      { code: 'OBG 601', title: 'Obstetric Complications & High-Risk Pregnancy', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Williams Obstetrics (Cunningham et al.) / Ten Teachers', coreTopics: ['Pre-Eclampsia & Eclampsia Management (Magnesium Sulphate Protocols)', 'Postpartum Haemorrhage (PPH Prevention & B-Lynch Suture)', 'Antepartum Haemorrhage (Placenta Praevia vs Abruptio Placenta)'] },
      { code: 'OBG 611', title: 'Clinical Labour Ward Clerkship & Operative Delivery', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Comprehensive Obstetrics in the Tropics (Prof. Kwawukume)', coreTopics: ['Partograph Plotting & Obstructed Labour Prevention', 'Emergency Lower Segment Caesarean Section (EMLSCS)', 'Vacuum Extraction & Forceps Delivery', 'Breech Presentation'] },
      { code: 'OBG 621', title: 'Clinical Gynaecology, Infertility & Gynaecological Oncology', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Gynaecology by Ten Teachers (Mongu & Kumar)', coreTopics: ['Uterine Fibroids (Leiomyoma & Myomectomy)', 'Tubal Infertility & HSG Interpretation', 'Cervical Cancer Screening (Pap Smear, VIA & HPV Vaccines)', 'Ectopic Pregnancy Emergency Salpingectomy'] },
    ],
  },
  PED: {
    prefix: 'PED',
    department: 'Paediatrics and Child Health',
    faculty: 'Faculty of Clinical Sciences',
    discipline: 'Clinical Medicine',
    typicalInstitutions: ['All Medical Colleges across Nigeria'],
    description: 'Childhood growth, malnutrition, neonatal resuscitation, and paediatric emergencies in 5th-6th MB;BS.',
    commonCourses: [
      { code: 'PED 501', title: 'General Paediatrics, Growth & Development', units: 6, level: '500L', semester: 1, prescribedTextbook: 'Illustrated Textbook of Paediatrics (Lissauer & Carroll)', coreTopics: ['Developmental Milestones', 'Severe Acute Malnutrition (Kwashiorkor vs Marasmus)', 'National Immunization Schedule (NPI in Nigeria)', 'Fluid Dosing in Children'] },
      { code: 'PED 601', title: 'Systemic Paediatric Diseases & Tropical Infections', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Nelson Textbook of Pediatrics (Kliegman et al.) / Azubuike Paediatrics', coreTopics: ['Severe Malaria with Hypoglycaemia and Convulsions', 'Pneumonia & IMCI Protocols', 'Sickle Cell Anaemia Vaso-Occlusive Crises', 'Acute Diarrhoeal Dehydration & ORS/Zinc Protocols'] },
      { code: 'PED 621', title: 'Neonatology & Paediatric Emergency Resuscitation', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Neonatal Resuscitation Program (NRP Guidelines) / Paediatric Emergencies (Ogunlesi)', coreTopics: ['APGAR Score Evaluation', 'Neonatal Sepsis & Early Antibiotic Dosing', 'Neonatal Jaundice & Phototherapy/Exchange Blood Transfusion', 'Birth Asphyxia & Bag-Mask Ventilation'] },
    ],
  },
  COM: {
    prefix: 'COM',
    department: 'Community Medicine & Public Health',
    faculty: 'Faculty of Clinical Sciences',
    discipline: 'Clinical Medicine',
    typicalInstitutions: ['All Colleges of Medicine across Nigeria'],
    description: 'Epidemiology, biostatistics, environmental sanitation, primary healthcare, and rural health postings.',
    commonCourses: [
      { code: 'COM 401', title: 'Principles of Epidemiology & Biostatistics', units: 4, level: '400L', semester: 1, prescribedTextbook: 'Park\'s Textbook of Preventive and Social Medicine (K. Park)', coreTopics: ['Prevalence vs Incidence Rates', 'Odds Ratio & Relative Risk Calculations', 'Screening Tests (Sensitivity, Specificity, PPV)', 'Demographic Pyramids'] },
      { code: 'COM 601', title: 'Primary Health Care & Health Systems Management', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Short Textbook of Public Health Medicine for the Tropics (Lucas & Gilles)', coreTopics: ['Alma-Ata Declaration & PHC Components', 'National Health Insurance Scheme (NHIS/NHIA)', 'Safe Water & Sanitation (WASH in Nigeria)', 'Health Economics & Cold Chain Systems'] },
      { code: 'COM 631', title: 'Occupational Health, Environmental Toxicology & Rural Posting', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Oxford Textbook of Global Public Health', coreTopics: ['Pneumoconiosis & Occupational Hazards', 'Maternal Mortality Ratio (MMR) Reductions', 'Community Health Diagnosis Survey', 'Epidemic Outbreak Response Team Protocol'] },
    ],
  },
  CPH: {
    prefix: 'CPH',
    department: 'Clinical Pharmacy and Pharmacy Practice',
    faculty: 'Faculty of Pharmaceutical Sciences',
    discipline: 'Pharmacy',
    typicalInstitutions: ['OAU', 'UNN', 'UI', 'ABU', 'UNILAG', 'UNIBEN', 'OOU', 'Private Pharmacy Colleges'],
    description: 'Clinical pharmacy, patient counseling, pharmacotherapeutics, and clinical clerkship in 5th-6th year Pharm.D.',
    commonCourses: [
      { code: 'CPH 511', title: 'Hospital & Clinical Pharmacy Practice I', units: 4, level: '500L', semester: 1, prescribedTextbook: 'Clinical Pharmacy and Therapeutics (Walker & Whittlesea)', coreTopics: ['Ward Round Participation', 'Drug Interaction Screening', 'Adverse Drug Reaction (ADR) Yellow Card Reporting in Nigeria', 'Total Parenteral Nutrition (TPN)'] },
      { code: 'CPH 611', title: 'Advanced Clinical Pharmacy Inpatient Clerkship', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Pharmacotherapy: A Pathophysiologic Approach (DiPiro et al.)', coreTopics: ['Cardiovascular Pharmacotherapy (ACEi, ARBs, Beta-Blockers)', 'Antimicrobial Stewardship', 'Chemotherapy Dosing & Regimens', 'Therapeutic Drug Monitoring (Digoxin, Gentamicin, Phenytoin)'] },
      { code: 'CPH 621', title: 'Critical Care Pharmacotherapeutics & Patient Monitoring', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Applied Therapeutics: The Clinical Use of Drugs (Koda-Kimble & Young)', coreTopics: ['Intensive Care Unit (ICU) Sedation & Vasopressor Protocols', 'Renal Impairment Dosage Adjustments (Cockcroft-Gault Equation)', 'Hepatic Encephalopathy Therapy', 'Diabetic Emergencies Glycaemic Control'] },
      { code: 'CPH 631', title: 'Community Pharmacy Management & Public Health Practice', units: 4, level: '600L', semester: 1, prescribedTextbook: 'Community Pharmacy: Symptoms, Diagnosis and Treatment (Rutter)', coreTopics: ['Over-the-Counter (OTC) Prescribing Boundaries', 'PCN Statutory Regulations (Pharmacists Council of Nigeria)', 'Patient Adherence Counseling in Nigerian Polypharmacy'] },
    ],
  },
  ARC: {
    prefix: 'ARC',
    department: 'Department of Architecture',
    faculty: 'Faculty of Environmental Sciences',
    discipline: 'Architecture & Built Environment',
    typicalInstitutions: ['ABU Zaria', 'FUTA', 'UNILAG', 'OAU', 'UNN', 'FUTO', 'Covenant', 'Bells'],
    description: 'Architectural design studios, working drawings, construction tech, and urban masterplanning in B.Sc & M.Sc (up to 600L).',
    commonCourses: [
      { code: 'ARC 401', title: 'Architectural Design Studio IV (Commercial Complexes)', units: 6, level: '400L', semester: 1, prescribedTextbook: 'Neufert Architects\' Data (Ernst & Peter Neufert) / Time-Saver Standards', coreTopics: ['Commercial Mall Circulation', 'Basement Parking Ramps & Clearance', 'Multi-Floor Structural Grids', 'Emergency Fire Egress Standards'] },
      { code: 'ARC 511', title: 'Advanced Architectural Design Studio V (Civic & Public Edifices)', units: 6, level: '500L', semester: 1, prescribedTextbook: 'Building Construction Illustrated (Francis D. K. Ching)', coreTopics: ['Civic Airport Terminals / Legislative Assemblies', 'Curtain Wall Systems & Glazing', 'HVAC Ducting & Spatial Integration', 'Acoustic Auditorium Design'] },
      { code: 'ARC 521', title: 'Advanced Construction Technology & Working Drawings', units: 4, level: '500L', semester: 1, prescribedTextbook: 'Construction Technology (Roy Chudley & Roger Greeno)', coreTopics: ['Structural Steel Trusses & Space Frames', 'Waterproofing Below Grade', 'Comprehensive Production Working Drawings Sheet 1-30', 'Bill of Quantities (BOQ) Coordination'] },
      { code: 'ARC 611', title: 'Master\'s Architectural Design Studio VI (High-Rise & Smart Towers)', units: 6, level: '600L', semester: 1, prescribedTextbook: 'The Skyscraper: Bioclimatic Design (Ken Yeang)', coreTopics: ['High-Rise Core Design (Elevator Banks & Service Shafts)', 'Wind Load Resistance & Tuned Mass Dampers', 'Photovoltaic Building-Integrated Skin (BIPV)', 'LEED & EDGE Green Building Metrics'] },
      { code: 'ARC 621', title: 'Urban Design & Ecological Masterplanning Studio', units: 6, level: '600L', semester: 1, prescribedTextbook: 'Urban Design: Street and Square (Cliff Moughtin) / Kevin Lynch', coreTopics: ['City Transit-Oriented Development (TOD)', 'Ecological Waterfront Revitalization in Nigerian Coastal Cities', 'Zoning & Master Plan Phasing Strategies', 'Pedestrian Walkway Infrastructure'] },
      { code: 'ARC 631', title: 'Professional Architectural Practice, ARCON Code & Contract Management', units: 4, level: '600L', semester: 1, prescribedTextbook: 'The Architect in Practice (David Chappell) / Architects Registration Council of Nigeria (ARCON) Act', coreTopics: ['ARCON Scale of Professional Fees & Conditions of Engagement', 'Joint Contracts Tribunal (JCT) / Standard Nigerian Conditions of Building Contract', 'Tender Action & Contractor Selection', 'Arbitration in Building Construction Disputes'] },
    ],
  },
  VMD: {
    prefix: 'VMD',
    department: 'Veterinary Medicine (Clinical)',
    faculty: 'Faculty of Veterinary Medicine',
    discipline: 'Veterinary Medicine',
    typicalInstitutions: ['ABU Zaria', 'UI Ibadan', 'UNN Nsukka', 'UDUS Sokoto', 'FUNAAB', 'UNIMAID', 'UNIABUJA'],
    description: 'Clinical veterinary medicine, ruminants, equine, small animals, and avian pathology in 5th-6th year DVM.',
    commonCourses: [
      { code: 'VMD 511', title: 'Food Animal Medicine I (Ruminants & Swine)', units: 4, level: '500L', semester: 1, prescribedTextbook: 'Veterinary Medicine: A Textbook of the Diseases of Cattle, Horses, Sheep, Pigs and Goats (Constable et al.)', coreTopics: ['Contagious Bovine Pleuropneumonia (CBPP)', 'Peste des Petits Ruminants (PPR)', 'African Swine Fever (ASF)', 'Ketosis & Ruminal Acidosis in Dairy Cattle'] },
      { code: 'VMD 611', title: 'Equine, Canine & Feline Clinical Medicine', units: 4, level: '600L', semester: 1, prescribedTextbook: 'Ettinger\'s Textbook of Veterinary Internal Medicine (Feldman, Côté & Ettinger)', coreTopics: ['Canine Parvovirus & Distemper Management', 'Canine Babesiosis & Ehrlichiosis (Tropical Canine Pancytopenia)', 'Equine Colic Diagnosis & Emergency Gastric Decompression', 'Rabies Protocol in Domestic Animals'] },
      { code: 'VMD 621', title: 'Avian Medicine & Commercial Poultry Health Management', units: 4, level: '600L', semester: 1, prescribedTextbook: 'Diseases of Poultry (David E. Swayne et al.)', coreTopics: ['Newcastle Disease (ND) Vaccination Schedules', 'Infectious Bursal Disease (Gumboro)', 'Avian Influenza Biosecurity Measures', 'Coccidiosis Prevention in Commercial Broilers'] },
      { code: 'VMD 631', title: 'Advanced Veterinary Clinical Clerkship & Field Postings', units: 6, level: '600L', semester: 1, prescribedTextbook: 'The Merck Veterinary Manual', coreTopics: ['Mobile Pastoralist Clinic Deployment', 'Livestock Ranch Health Herd Auditing', 'Zoological Garden & Wildlife Medicine Postings'] },
    ],
  },
  VSR: {
    prefix: 'VSR',
    department: 'Veterinary Surgery and Radiology',
    faculty: 'Faculty of Veterinary Medicine',
    discipline: 'Veterinary Medicine',
    typicalInstitutions: ['ABU', 'UI', 'UNN', 'FUNAAB', 'UDUS', 'UNIMAID'],
    description: 'Veterinary surgery, diagnostic imaging, and anaesthesia in 5th-6th year DVM.',
    commonCourses: [
      { code: 'VSR 511', title: 'General Veterinary Surgery & Anaesthesia', units: 4, level: '500L', semester: 1, prescribedTextbook: 'Veterinary Surgery: Small Animal (Tobias & Johnston) / Lumb and Jones\' Veterinary Anesthesia', coreTopics: ['Pre-Anaesthetic Fasting & Sedation', 'Inhalation Anaesthesia (Isoflurane) & Monitoring', 'Wound Debridement & Bandaging Techniques', 'Aseptic Operating Theatre Protocols'] },
      { code: 'VSR 621', title: 'Large Animal Surgery (Ruminants & Equine Laparotomy)', units: 4, level: '600L', semester: 1, prescribedTextbook: 'Farm Animal Surgery (Susan L. Fubini & Norm G. Ducharme)', coreTopics: ['Left Flank Exploratory Laparotomy & Rumenotomy', 'Abomasal Displacement Correction (Right Paramedian Abomasopexy)', 'Caesarean Section in Cows & Ewes', 'Castration & Hernioplasty in Bulls & Rams'] },
      { code: 'VSR 631', title: 'Small Animal Orthopaedics, Radiology & Complex Surgery', units: 4, level: '600L', semester: 1, prescribedTextbook: 'Small Animal Surgery (Theresa Welch Fossum) / Thrall Veterinary Diagnostic Radiology', coreTopics: ['Intramedullary Pinning & Bone Plating for Femur Fractures', 'Cranial Cruciate Ligament Rupture (TPLO / Extracapsular Repair)', 'Exploratory Gastrotomy for Foreign Body Obstruction', 'Veterinary Radiographic Contrast Studies (Barium Swallow, Myelography)'] },
    ],
  },

  // ===================== ADMINISTRATION & MANAGEMENT SCIENCES =====================
  ACC: {
    prefix: 'ACC',
    department: 'Accounting',
    faculty: 'Administration & Management Sciences',
    discipline: 'Administration & Management Sciences',
    typicalInstitutions: ['All 256 Universities across Nigeria'],
    description: 'Financial and managerial accounting program prefix.',
    commonCourses: [
      { code: 'ACC 101', title: 'Introduction to Financial Accounting I', units: 3, level: '100L', semester: 1, prescribedTextbook: 'Business Accounting 1 (Frank Wood & Alan Sangster)', coreTopics: ['Dual Aspect Concept', 'Journals & Ledgers', 'Trial Balance Preparation', 'Trading, Profit & Loss Account'] },
      { code: 'ACC 201', title: 'Financial Accounting I', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Frank Wood\'s Business Accounting 2', coreTopics: ['Depreciation Methods (Straight Line, Reducing Balance)', 'Bank Reconciliation Statements', 'Bad Debts & Provisions', 'Control Accounts'] },
      { code: 'ACC 203', title: 'Cost Accounting I', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Cost Accounting (Colin Drury) / ICAN Study Pack', coreTopics: ['Material Costing (FIFO, LIFO, Weighted Average)', 'Labor Costing & Incentives', 'Overhead Allocation & Apportionment'] },
      { code: 'ACC 301', title: 'Advanced Financial Accounting I', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Financial Accounting Standards (Kieso, Weygandt & Warfield)', coreTopics: ['Partnership Dissolution & Goodwill', 'Company Accounts (Shares & Debentures)', 'IFRS Presentation Standards'] },
      { code: 'ACC 305', title: 'Auditing and Assurance I', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Principles of Auditing (Rick Hayes et al.)', coreTopics: ['Audit Evidence & Documentation', 'Internal Control Evaluation', 'Statutory Auditor Duties in Nigeria (CAMA 2020)'] },
    ],
  },
  BFN: {
    prefix: 'BFN',
    department: 'Banking and Finance',
    faculty: 'Administration & Management Sciences',
    discipline: 'Administration & Management Sciences',
    typicalInstitutions: ['UNILAG', 'UNN', 'OOU', 'ABU', 'Covenant', 'State & Private Varsities'],
    description: 'Banking regulations, corporate finance, and financial markets prefix.',
    commonCourses: [
      { code: 'BFN 201', title: 'Principles of Finance', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Principles of Corporate Finance (Brealey, Myers & Allen)', coreTopics: ['Time Value of Money (NPV, IRR)', 'Risk and Return (CAPM)', 'Sources of Corporate Capital', 'Working Capital Policy'] },
      { code: 'BFN 301', title: 'Nigerian Financial System', units: 3, level: '300L', semester: 1, prescribedTextbook: 'The Nigerian Banking & Financial Environment (Prof. Anyanwu)', coreTopics: ['Central Bank of Nigeria (CBN) Monetary Roles', 'Deposit Money Banks', 'Nigerian Exchange Group (NGX)', 'Treasury Bills & Sukuk Bonds'] },
    ],
  },
  BUS: {
    prefix: 'BUS',
    department: 'Business Administration',
    faculty: 'Administration & Management Sciences',
    discipline: 'Administration & Management Sciences',
    typicalInstitutions: ['All Universities across Nigeria'],
    description: 'Business administration, leadership, and corporate strategy prefix.',
    commonCourses: [
      { code: 'BUS 101', title: 'Introduction to Business', units: 3, level: '100L', semester: 1, prescribedTextbook: 'Management (Stephen Robbins & Mary Coulter)', coreTopics: ['Forms of Business Ownership in Nigeria', 'Organizational Structure', 'Marketing Mix (4 Ps)', 'Business Ethics'] },
      { code: 'BUS 301', title: 'Organizational Behavior', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Organizational Behavior (Fred Luthans)', coreTopics: ['Motivation Theories (Maslow, Herzberg)', 'Group Dynamics', 'Conflict Resolution', 'Corporate Culture'] },
    ],
  },

  // ===================== SOCIAL SCIENCES =====================
  ECO: {
    prefix: 'ECO',
    department: 'Economics',
    faculty: 'Faculty of Social Sciences',
    discipline: 'Social Sciences',
    typicalInstitutions: ['All 256 Universities across Nigeria'],
    description: 'Economics microeconomic, macroeconomic, and econometric theory prefix.',
    commonCourses: [
      { code: 'ECO 101', title: 'Principles of Economics I (Microeconomics)', units: 3, level: '100L', semester: 1, prescribedTextbook: 'Principles of Microeconomics (N. Gregory Mankiw)', coreTopics: ['Scarcity, Choice & Opportunity Cost', 'Demand and Supply Elasticities', 'Consumer Utility (Cardinal & Ordinal)', 'Production Possibility Frontier (PPF)'] },
      { code: 'ECO 201', title: 'Principles of Microeconomics II', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Intermediate Microeconomics: A Modern Approach (Hal R. Varian)', coreTopics: ['Perfect Competition vs Monopoly', 'Oligopoly (Cournot, Bertrand, Stackelberg)', 'Game Theory & Nash Equilibrium', 'Monopolistic Competition'] },
      { code: 'ECO 203', title: 'Applied Statistics for Economists', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Statistics for Business and Economics (Anderson, Sweeney & Williams)', coreTopics: ['Probability Distributions (Normal, Binomial, Poisson)', 'Sampling Distributions', 'Confidence Intervals', 'Hypothesis Testing'] },
      { code: 'ECO 209', title: 'Structure of the Nigerian Economy', units: 2, level: '200L', semester: 1, prescribedTextbook: 'The Structure of the Nigerian Economy (Prof. J.C. Anyanwu et al.)', coreTopics: ['Pre-colonial & Colonial Economic Structure', 'Oil Boom & Dutch Disease', 'Structural Adjustment Programme (SAP 1986)', 'Monetary Policy & Inflation Dynamics'] },
      { code: 'ECO 301', title: 'Intermediate Microeconomic Theory', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Modern Microeconomics (A. Koutsoyiannis)', coreTopics: ['Slutsky Equation (Income & Substitution Effects)', 'Cost Function Derivation', 'General Equilibrium Analysis', 'Welfare Economics'] },
      { code: 'ECO 305', title: 'Introductory Econometrics', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Basic Econometrics (Damodar N. Gujarati & Dawn C. Porter)', coreTopics: ['Classical Linear Regression Model (CLRM)', 'Ordinary Least Squares (OLS) Derivation', 'Gauss-Markov Theorem (BLUE)', 'Heteroscedasticity & Autocorrelation Tests'] },
    ],
  },
  POL: {
    prefix: 'POL',
    department: 'Political Science',
    faculty: 'Faculty of Social Sciences',
    discipline: 'Social Sciences',
    typicalInstitutions: ['All Universities with Social Sciences (UI, UNILAG, ABU, UNN, OAU, OOU)'],
    description: 'Political theory, comparative politics, and international relations prefix.',
    commonCourses: [
      { code: 'POL 101', title: 'Introduction to Political Science', units: 3, level: '100L', semester: 1, prescribedTextbook: 'Elements of Politics (Remi Anifowose & Francis C. Enemuo)', coreTopics: ['Nature & Scope of Politics', 'Concepts of Power, Authority & Legitimacy', 'Sovereignty & Statehood', 'Political Ideologies (Liberalism, Socialism, Fascism)'] },
      { code: 'POL 201', title: 'Nigerian Constitutional Development & Politics', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Constitutional Developments in Nigeria (Kalu Ezera)', coreTopics: ['Clifford Constitution 1922', 'Richards Constitution 1946', 'Macpherson 1951 & Lyttelton 1954', 'First Republic Collapse & Military Regimes'] },
    ],
  },
  MAC: {
    prefix: 'MAC',
    department: 'Mass Communication',
    faculty: 'Communication & Media Studies / Social Sciences',
    discipline: 'Communication & Media Studies',
    typicalInstitutions: ['UNILAG', 'UNN', 'OOU', 'LASU', 'Covenant', 'Babcock', 'Federal & State Varsities'],
    description: 'Journalism, broadcasting, public relations, and digital media prefix.',
    commonCourses: [
      { code: 'MAC 101', title: 'Introduction to Mass Communication', units: 3, level: '100L', semester: 1, prescribedTextbook: 'Mass Communication: Living in a Media World (Ralph E. Hanson)', coreTopics: ['Communication Models (Shannon-Weaver, Lasswell, Berlo)', 'Print, Radio, Television & Digital Media', 'Gatekeeping Theory'] },
      { code: 'MAC 201', title: 'News Writing and Reporting Techniques', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Reporting for the Media (John R. Bender et al.)', coreTopics: ['The Inverted Pyramid Style', 'The 5 Ws and H Lead Writing', 'Hard News vs Feature Articles', 'Sourcing & Verification'] },
      { code: 'MAC 205', title: 'Media Law and Ethics in Nigeria', units: 2, level: '200L', semester: 1, prescribedTextbook: 'Mass Media Laws and Ethics in Nigeria (Prof. Ralph Akinfeleye)', coreTopics: ['Defamation (Libel vs Slander)', 'Contempt of Court', 'Copyright Act & Plagiarism', 'Official Secrets Act', 'NBC Broadcasting Code'] },
    ],
  },

  // ===================== PURE & APPLIED SCIENCES =====================
  MTH: {
    prefix: 'MTH',
    department: 'Mathematics & Statistics',
    faculty: 'Faculty of Science',
    discipline: 'Pure & Applied Sciences',
    typicalInstitutions: ['All 256 Universities across Nigeria'],
    description: 'Mathematics curriculum taken by all STEM, physical science, and engineering students in 100L.',
    commonCourses: [
      { code: 'MTH 101', title: 'Elementary Mathematics I (Algebra & Trigonometry)', units: 3, level: '100L', semester: 1, prescribedTextbook: 'College Algebra and Trigonometry (Murray Spiegel / Schaum\'s Outline)', coreTopics: ['Set Theory & Real Numbers', 'Surds, Indices & Logarithms', 'Quadratic Equations & Roots', 'Binomial Theorem', 'Trigonometric Identities'] },
      { code: 'MTH 102', title: 'Elementary Mathematics II (Calculus & Coordinate Geometry)', units: 3, level: '100L', semester: 2, prescribedTextbook: 'Calculus: Early Transcendentals (James Stewart)', coreTopics: ['Limits & Continuity', 'Derivatives from First Principles', 'Techniques of Integration (Substitution, Parts)', 'Equation of Straight Lines & Circles'] },
      { code: 'MTH 201', title: 'Mathematical Analysis I', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Principles of Mathematical Analysis (Walter Rudin)', coreTopics: ['Real Number Completeness', 'Sequences & Series Convergence Tests', 'Bolzano-Weierstrass Theorem', 'Riemann Integration'] },
    ],
  },
  PHY: {
    prefix: 'PHY',
    department: 'Physics',
    faculty: 'Faculty of Science',
    discipline: 'Pure & Applied Sciences',
    typicalInstitutions: ['All 256 Universities across Nigeria'],
    description: 'Foundational physics taken by all science, engineering, and medical students.',
    commonCourses: [
      { code: 'PHY 101', title: 'General Physics I (Mechanics & Thermal Physics)', units: 3, level: '100L', semester: 1, prescribedTextbook: 'Fundamentals of Physics (Halliday, Resnick & Walker) / Nelkon & Parker', coreTopics: ['Vectors & Kinematics', 'Newton\'s Laws of Motion', 'Conservation of Momentum & Energy', 'Rotational Dynamics', 'Thermal Expansion & Heat Transfer'] },
      { code: 'PHY 102', title: 'General Physics II (Electricity, Magnetism & Optics)', units: 3, level: '100L', semester: 2, prescribedTextbook: 'Fundamentals of Physics (Halliday & Resnick)', coreTopics: ['Coulomb\'s Law & Electric Fields', 'Gauss\'s Law', 'Ampere\'s Law & Magnetic Induction', 'Geometric Optics & Wave Interference'] },
      { code: 'PHY 107', title: 'General Physics Practical Laboratory I', units: 1, level: '100L', semester: 1, prescribedTextbook: 'Laboratory Manual of Practical Physics (Nelkon & Ogborn)', coreTopics: ['Simple Pendulum Experiment', 'Determination of Young\'s Modulus', 'Calorimetry & Specific Heat Capacity', 'Error Analysis & Graph Plotting'] },
    ],
  },
  CHM: {
    prefix: 'CHM',
    department: 'Chemistry',
    faculty: 'Faculty of Science',
    discipline: 'Pure & Applied Sciences',
    typicalInstitutions: ['All 256 Universities across Nigeria'],
    description: 'Foundational physical, inorganic, and organic chemistry taken by all science & health students.',
    commonCourses: [
      { code: 'CHM 101', title: 'General Chemistry I (Physical & Inorganic Chemistry)', units: 3, level: '100L', semester: 1, prescribedTextbook: 'Chemistry: The Central Science (Brown, LeMay & Bursten) / Raymond Chang', coreTopics: ['Stoichiometry & Mole Concept', 'Atomic Structure & Quantum Numbers', 'Periodic Trends', 'Chemical Bonding (Ionic, Covalent, Metallic)', 'Chemical Kinetics & Equilibrium'] },
      { code: 'CHM 102', title: 'General Chemistry II (Organic Chemistry Basics)', units: 3, level: '100L', semester: 2, prescribedTextbook: 'Organic Chemistry (Morrison & Boyd)', coreTopics: ['IUPAC Nomenclature', 'Alkanes, Alkenes & Alkynes', 'Functional Groups', 'Stereochemistry Basics', 'Substitution & Elimination Reactions'] },
    ],
  },
  BIO: {
    prefix: 'BIO',
    department: 'Biological Sciences',
    faculty: 'Faculty of Science',
    discipline: 'Pure & Applied Sciences',
    typicalInstitutions: ['All 256 Universities across Nigeria'],
    description: 'Foundational biology for science, agriculture, and medical students.',
    commonCourses: [
      { code: 'BIO 101', title: 'General Biology I (Cell Biology & Genetics)', units: 3, level: '100L', semester: 1, prescribedTextbook: 'Campbell Biology (Urry, Cain, Wasserman et al.)', coreTopics: ['Prokaryotic vs Eukaryotic Cells', 'Cell Organelles & Membrane Transport', 'Mitosis and Meiosis', 'Mendelian Genetics & Inheritance Patterns'] },
      { code: 'BIO 102', title: 'General Biology II (Plant & Animal Diversity)', units: 3, level: '100L', semester: 2, prescribedTextbook: 'Biology: A Functional Approach (M.B.V. Roberts)', coreTopics: ['Five Kingdom Classification', 'Plant Phyla & Alternation of Generations', 'Invertebrate & Vertebrate Zoology', 'Ecosystem Ecology'] },
    ],
  },
  MCB: {
    prefix: 'MCB',
    department: 'Microbiology',
    faculty: 'Faculty of Science',
    discipline: 'Pure & Applied Sciences',
    typicalInstitutions: ['All Science Faculties across Nigeria'],
    description: 'Microbiology, virology, immunology, and industrial fermentation prefix.',
    commonCourses: [
      { code: 'MCB 201', title: 'General Microbiology I', units: 3, level: '200L', semester: 1, prescribedTextbook: 'Prescott\'s Microbiology (Willey, Sandman & Wood)', coreTopics: ['Bacterial Morphology & Gram Staining', 'Culture Media & Pure Culture Techniques', 'Microbial Growth Curves', 'Sterilization & Disinfection Methods'] },
      { code: 'MCB 301', title: 'Microbial Genetics & Molecular Biology', units: 3, level: '300L', semester: 1, prescribedTextbook: 'Microbial Genetics (Stanley R. Maloy)', coreTopics: ['Bacterial Conjugation, Transformation & Transduction', 'Plasmids & Operons (Lac Operon)', 'Recombinant DNA Technology'] },
    ],
  },

  // ===================== VETERINARY MEDICINE =====================
  VET: {
    prefix: 'VET',
    department: 'Veterinary Medicine General',
    faculty: 'Faculty of Veterinary Medicine',
    discipline: 'Veterinary Medicine',
    typicalInstitutions: ['ABU Zaria', 'UI Ibadan', 'UNN Nsukka', 'UDUS Sokoto', 'FUNAAB', 'UNIMAID', 'UNIABUJA'],
    description: 'Veterinary medical education (DVM - 6-year professional program).',
    commonCourses: [
      { code: 'VAN 201', title: 'Veterinary Gross Anatomy I (Carnivores & Equine)', units: 4, level: '200L', semester: 1, prescribedTextbook: 'Miller\'s Anatomy of the Dog (Evans & de Lahunta)', coreTopics: ['Canine Osteology', 'Equine Musculoskeletal Locomotion', 'Comparative Mammalian Organs'] },
      { code: 'VPP 301', title: 'Veterinary Pharmacology & Therapeutics', units: 4, level: '300L', semester: 1, prescribedTextbook: 'Veterinary Pharmacology and Therapeutics (Jim E. Riviere)', coreTopics: ['Anthelmintics in Livestock', 'Antibiotic Dosing in Ruminants', 'Toxicology of Tropical Range Plants'] },
      { code: 'VPA 301', title: 'Veterinary Parasitology & Entomology', units: 4, level: '300L', semester: 1, prescribedTextbook: 'Veterinary Parasitology (M.A. Taylor et al.)', coreTopics: ['Tsetse Fly & Trypanosomiasis in Cattle', 'Ticks & Babesiosis', 'Helminthiasis Management'] },
    ],
  },

  // ===================== FACULTY OF EDUCATION =====================
  EDU: {
    prefix: 'EDU',
    department: 'Educational Foundations & Management',
    faculty: 'Faculty of Education',
    discipline: 'Education',
    typicalInstitutions: ['TASUED (Nigeria\'s 1st University of Education)', 'AFUED Ondo', 'AIFUE Owerri', 'FUEZ Zaria', 'All Federal & State Universities with Education'],
    description: 'Educational psychology, curriculum planning, and teaching methods.',
    commonCourses: [
      { code: 'EDU 101', title: 'Introduction to Foundations of Education', units: 2, level: '100L', semester: 1, prescribedTextbook: 'Foundations of Education (Fafunwa / Taiwo)', coreTopics: ['Historical Evolution of Western & Indigenous Education in Nigeria', 'Philosophical Thought in Education', 'Sociology of Teaching'] },
      { code: 'EDU 201', title: 'Educational Psychology & Learning Theories', units: 2, level: '200L', semester: 1, prescribedTextbook: 'Psychology of Learning in African Classrooms', coreTopics: ['Behaviorism (Skinner, Pavlov)', 'Constructivism (Piaget, Vygotsky)', 'Cognitive Development & Memory Retention'] },
      { code: 'EDU 301', title: 'Curriculum Studies & Educational Technology', units: 2, level: '300L', semester: 1, prescribedTextbook: 'Curriculum Development in Nigeria', coreTopics: ['Curriculum Design Models', 'Instructional Media', 'Lesson Plan Formulation', 'Teaching Practice Preparation'] },
    ],
  },
};

// 2. Helper to resolve any Course Code in Nigeria (e.g. "MTH 101", "CSC 301", "PUL 201", "CPP 201")
export function lookupNigerianCourseCode(courseCode: string): {
  prefix: string;
  found: boolean;
  definition?: CourseCodeDefinition;
  specificCourse?: CourseCodeDefinition['commonCourses'][0];
} {
  const clean = courseCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = clean.match(/^([A-Z]{3,4})(\d{3})$/);

  if (!match) {
    // Try prefix search
    const prefixOnly = clean.replace(/[0-9]/g, '');
    const def = MASTER_COURSE_PREFIX_REGISTRY[prefixOnly];
    if (def) {
      return { prefix: prefixOnly, found: true, definition: def };
    }
    return { prefix: prefixOnly, found: false };
  }

  const prefix = match[1];
  const number = match[2];
  const fullCode = `${prefix} ${number}`;
  const def = MASTER_COURSE_PREFIX_REGISTRY[prefix];

  if (!def) {
    return { prefix, found: false };
  }

  const specificCourse = def.commonCourses.find((c) => c.code.replace(/\s+/g, '') === fullCode.replace(/\s+/g, ''));

  return {
    prefix,
    found: true,
    definition: def,
    specificCourse,
  };
}

// 3. Helper to get all course codes associated with any department or institution category
export function getCourseCodesForDepartment(departmentName: string): CourseCodeDefinition[] {
  const norm = departmentName.toLowerCase();
  const results: CourseCodeDefinition[] = [];

  for (const def of Object.values(MASTER_COURSE_PREFIX_REGISTRY)) {
    if (
      def.department.toLowerCase().includes(norm) ||
      norm.includes(def.department.toLowerCase()) ||
      def.faculty.toLowerCase().includes(norm) ||
      def.discipline.toLowerCase().includes(norm)
    ) {
      results.push(def);
    }
  }

  // Always include GST for Nigerian universities
  if (results.length === 0 || !results.some((r) => r.prefix === 'GST')) {
    results.unshift(MASTER_COURSE_PREFIX_REGISTRY.GST);
  }

  return results;
}
