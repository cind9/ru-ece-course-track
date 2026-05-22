/** Expand SOC subtitle abbreviations and normalize casing for display. */
const TOPIC_EXPANSIONS: Record<string, string> = {
  "COMPUTING PRINCIPLE FOR MOBILE EMBEDDED":
    "Computing Principles for Mobile Embedded Systems",
  "EMBEDDED SYSTEMS II: APPLICATION DEVELOP":
    "Embedded Systems II: Application Development",
  "RECENT ADVANCES IN HIGH-PERFORMANCE COM":
    "Recent Advances in High-Performance Computing",
  "INTRO TO QUANTUM INFORMATION SCIENCE":
    "Introduction to Quantum Information Science",
  "QUANTUM COMPUTING AND INFORMATION SYSTEM":
    "Quantum Computing and Information Systems",
  "MACHINE LEARNING FOR IOT": "Machine Learning for IoT",
  "EMBEDDED SYSTEMS I": "Embedded Systems I",
  "EMBEDDED SYSTEMS II: APPLICATION DEVELOPMENT":
    "Embedded Systems II: Application Development",
  "REINFORCEMENT LEARNING FOR ENGINEERS":
    "Reinforcement Learning for Engineers",
  "DISTRIBUTED DEEP LEARNING": "Distributed Deep Learning",
  "CLOUD COMPUTING": "Cloud Computing",
  "SEMICONDUCTORS FOR AI": "Semiconductors for AI",
  "INTRODUCTION TO DEEP LEARNING": "Introduction to Deep Learning",
  "DIGITAL COMMUNICATION SYSTEMS": "Digital Communication Systems",
  "QUANTUM COMPUTING AND COMMUNICATIONS ALG":
    "Quantum Computing and Communications Algorithms",
};

export function formatTopicTitle(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  const key = trimmed.toUpperCase();
  if (TOPIC_EXPANSIONS[key]) return TOPIC_EXPANSIONS[key];
  if (trimmed !== key && trimmed !== trimmed.toLowerCase()) return trimmed;
  return trimmed
    .toLowerCase()
    .replace(/\b([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function isSeniorOnlySection(sectionEligibility?: string): boolean {
  return (sectionEligibility ?? "").trim().toUpperCase() === "SENIORS ONLY";
}
