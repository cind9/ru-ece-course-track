/** Official lists: ece.rutgers.edu/computer-engineering-electives & technical-electives */

export type ElectiveKind = "computer" | "technical" | "restricted";

export interface SocTopicEntry {
  code: string;
  topic: string;
  seniorOnly?: boolean;
}

export interface ElectiveOption {
  id: string;
  code: string;
  title: string;
  kind: ElectiveKind;
  credits: number;
  prereqs?: string[];
  offered?: "fall" | "spring" | "both" | "irregular";
  note?: string;
}

export const computerElectives: ElectiveOption[] = [
  { id: "ece-322", code: "14:332:322", title: "Principles of Communication Systems", kind: "computer", credits: 3, offered: "spring" },
  { id: "ece-346", code: "14:332:346", title: "Digital Signal Processing", kind: "computer", credits: 3, offered: "spring" },
  { id: "ece-361", code: "14:332:361", title: "Electronic Devices", kind: "computer", credits: 3, offered: "both" },
  { id: "ece-376", code: "14:332:376", title: "Virtual Reality", kind: "computer", credits: 3, note: "14:332:378 co-req", offered: "spring" },
  { id: "ece-402", code: "14:332:402", title: "Sustainable Energy", kind: "computer", credits: 3, offered: "fall" },
  { id: "ece-415", code: "14:332:415", title: "Introduction to Automatic Control Theory", kind: "computer", credits: 3, offered: "irregular" },
  { id: "ece-417", code: "14:332:417", title: "Control System Design", kind: "computer", credits: 3, offered: "fall" },
  { id: "ece-421", code: "14:332:421", title: "Wireless Communication Systems", kind: "computer", credits: 3, prereqs: ["14:332:322"], offered: "fall" },
  { id: "ece-423", code: "14:332:423", title: "Computer and Communication Networks", kind: "computer", credits: 3, offered: "spring" },
  { id: "ece-424", code: "14:332:424", title: "Introduction to Information and Network Security", kind: "computer", credits: 3, offered: "fall" },
  { id: "ece-435", code: "14:332:435", title: "Topics in ECE", kind: "computer", credits: 3, offered: "both" },
  { id: "ece-436", code: "14:332:436", title: "Topics in ECE", kind: "computer", credits: 3, offered: "both" },
  { id: "ece-443", code: "14:332:443", title: "Machine Learning for Engineers", kind: "computer", credits: 3, offered: "fall" },
  { id: "ece-445", code: "14:332:445", title: "Topics in ECE", kind: "computer", credits: 3, offered: "both" },
  { id: "ece-446", code: "14:332:446", title: "Topics in ECE", kind: "computer", credits: 3, offered: "both" },
  { id: "ece-447", code: "14:332:447", title: "Introduction to Digital Signal Processing Design", kind: "computer", credits: 3 },
  { id: "ece-451", code: "14:332:451", title: "Introduction to Parallel and Distributed Programming", kind: "computer", credits: 3, offered: "fall" },
  { id: "ece-453", code: "14:332:453", title: "Mobile App Engineering and User Experience", kind: "computer", credits: 3 },
  { id: "ece-456", code: "14:332:456", title: "Network-Centric Programming", kind: "computer", credits: 3, offered: "spring", note: "Alternate years" },
  { id: "ece-472", code: "14:332:472", title: "Robotics and Computer Vision", kind: "computer", credits: 3, offered: "fall" },
  { id: "ece-474", code: "14:332:474", title: "Intro to Computer Graphics", kind: "computer", credits: 3, offered: "irregular", note: "01:198:428 may substitute" },
  { id: "ece-479", code: "14:332:479", title: "VLSI Design", kind: "computer", credits: 3, offered: "fall" },
  { id: "ece-482", code: "14:332:482", title: "Deep Submicron VLSI Design", kind: "computer", credits: 3 },
  { id: "ece-491", code: "14:332:491", title: "Special Problems / Independent Study", kind: "computer", credits: 3, offered: "both" },
  { id: "ece-493", code: "14:332:493", title: "Topics in ECE (computer-related)", kind: "computer", credits: 3, offered: "both", note: "e.g. Embedded Systems I (spring)" },
  { id: "ece-494", code: "14:332:494", title: "Topics in ECE (computer-related)", kind: "computer", credits: 3, offered: "both" },
  { id: "cs-334", code: "01:198:334", title: "Introduction to Imaging and Multimedia", kind: "computer", credits: 4 },
  { id: "cs-336", code: "01:198:336", title: "Principles of Information and Data Management", kind: "computer", credits: 4 },
  { id: "cs-344", code: "01:198:344", title: "Design and Analysis of Computer Algorithms", kind: "computer", credits: 4 },
  { id: "cs-440", code: "01:198:440", title: "Introduction to Artificial Intelligence", kind: "computer", credits: 4 },
];

export const technicalElectives: ElectiveOption[] = [
  { id: "ece-382", code: "14:332:382", title: "Electromagnetic Fields", kind: "technical", credits: 3, offered: "spring" },
  { id: "ece-463", code: "14:332:463", title: "Analog Electronics", kind: "technical", credits: 3, offered: "fall" },
  { id: "ece-465", code: "14:332:465", title: "Physical Electronics", kind: "technical", credits: 3, offered: "fall" },
  { id: "ece-466", code: "14:332:466", title: "Opto-Electronic Devices", kind: "technical", credits: 3 },
  { id: "ece-481", code: "14:332:481", title: "Electromagnetic Waves", kind: "technical", credits: 3 },
  { id: "math-250", code: "01:640:250", title: "Introductory Linear Algebra", kind: "technical", credits: 3 },
  { id: "math-350", code: "01:640:350", title: "Linear Algebra", kind: "technical", credits: 3 },
  { id: "cs-214", code: "01:198:214", title: "Systems Programming", kind: "technical", credits: 4 },
  { id: "cs-314", code: "01:198:314", title: "Principles of Programming Languages", kind: "technical", credits: 4 },
  { id: "cs-417", code: "01:198:417", title: "Distributed Systems", kind: "technical", credits: 4 },
  { id: "cs-439", code: "01:198:439", title: "Introduction to Data Science", kind: "technical", credits: 4 },
  { id: "cs-440-tech", code: "01:198:440", title: "Introduction to Artificial Intelligence", kind: "technical", credits: 4 },
  { id: "mech-291", code: "14:650:291", title: "Mechanics of Materials", kind: "technical", credits: 3 },
  { id: "ise-210", code: "14:540:210", title: "Engineering Probability", kind: "technical", credits: 3 },
];

/** Snapshot from classes.rutgers.edu SOC — refresh via scripts/fetch-soc.mjs */
export const socOfferingsSnapshot = {
  fall2025: [
    "14:332:402", "14:332:417", "14:332:421", "14:332:424", "14:332:435", "14:332:436",
    "14:332:437", "14:332:443", "14:332:445", "14:332:446", "14:332:451", "14:332:472",
    "14:332:479", "14:332:493", "14:332:494",
  ],
  spring2026: [
    "14:332:226", "14:332:252", "14:332:312", "14:332:322", "14:332:346", "14:332:376",
    "14:332:382", "14:332:393", "14:332:423", "14:332:434", "14:332:435", "14:332:448",
    "14:332:452", "14:332:456", "14:332:493",
  ],
  fall2026: [
    "14:332:402", "14:332:417", "14:332:421", "14:332:424", "14:332:435", "14:332:436",
    "14:332:437", "14:332:443", "14:332:445", "14:332:446", "14:332:451", "14:332:472",
    "14:332:479", "14:332:463", "14:332:465", "14:332:481", "14:332:493", "14:332:494",
  ],
  topicsSpring2026: [
    { code: "14:332:435", topic: "Biosensing and Bioelectronics" },
    { code: "14:332:435", topic: "Introduction to Deep Learning", seniorOnly: true },
    { code: "14:332:445", topic: "Digital Communication Systems", seniorOnly: true },
    {
      code: "14:332:445",
      topic: "Recent Advances in High-Performance Computing",
      seniorOnly: true,
    },
    { code: "14:332:493", topic: "Embedded Systems I" },
    {
      code: "14:332:493",
      topic: "Quantum Computing and Information Systems",
      seniorOnly: true,
    },
  ] satisfies SocTopicEntry[],
  topicsFall2025: [
    {
      code: "14:332:435",
      topic: "Computing Principles for Mobile Embedded Systems",
      seniorOnly: true,
    },
    { code: "14:332:445", topic: "Reinforcement Learning for Engineers" },
    { code: "14:332:446", topic: "Distributed Deep Learning" },
    { code: "14:332:493", topic: "Introduction to Quantum Information Science" },
    { code: "14:332:493", topic: "Machine Learning for IoT" },
    {
      code: "14:332:493",
      topic: "Embedded Systems II: Application Development",
      seniorOnly: true,
    },
    { code: "14:332:494", topic: "Cloud Computing", seniorOnly: true },
    { code: "14:332:494", topic: "Semiconductors for AI" },
  ] satisfies SocTopicEntry[],
  topicsFall2026: [
    {
      code: "14:332:435",
      topic: "Computing Principles for Mobile Embedded Systems",
      seniorOnly: true,
    },
    { code: "14:332:445", topic: "Reinforcement Learning for Engineers" },
    { code: "14:332:446", topic: "Distributed Deep Learning" },
    {
      code: "14:332:493",
      topic: "Quantum Computing and Communications Algorithms",
    },
    { code: "14:332:493", topic: "Machine Learning for IoT" },
    {
      code: "14:332:493",
      topic: "Embedded Systems II: Application Development",
      seniorOnly: true,
    },
    { code: "14:332:494", topic: "Cloud Computing", seniorOnly: true },
    { code: "14:332:494", topic: "Semiconductors for AI" },
  ] satisfies SocTopicEntry[],
} as const;
