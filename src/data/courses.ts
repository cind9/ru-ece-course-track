import type { Course } from "../types";

/** Primary track courses + separate alternative boxes (0 residency). */
export const courses: Course[] = [
  // Year 1 Fall
  {
    id: "math-151",
    label: "MATH 151/153/191",
    title: "Calculus I",
    credits: 4,
    residencyCredits: 0,
    category: "non-ece",
    year: 1,
    term: "fall",
    row: 0,
    prereqs: [],
    offered: "both",
  },
  {
    id: "chem-159",
    label: "CHEM 159 + 171",
    title: "General Chemistry for Engineers + Lab",
    credits: 4,
    residencyCredits: 0,
    category: "non-ece",
    year: 1,
    term: "fall",
    row: 1,
    prereqs: [],
    offered: "both",
  },
  {
    id: "writing-101",
    label: "Writing 101",
    title: "Expository Writing",
    credits: 3,
    residencyCredits: 0,
    category: "non-ece",
    year: 1,
    term: "fall",
    row: 2,
    prereqs: [],
    offered: "both",
  },
  {
    id: "phy-123",
    label: "PHY 123",
    title: "Analytical Physics IA",
    credits: 2,
    residencyCredits: 0,
    category: "non-ece",
    year: 1,
    term: "fall",
    row: 3,
    prereqs: [],
    offered: "both",
  },
  {
    id: "idea-1",
    label: "IDEA I",
    title: "Intro. to Data-Driven Design for Eng. Appl.",
    credits: 2,
    residencyCredits: 0,
    category: "non-ece",
    year: 1,
    term: "fall",
    row: 4,
    prereqs: [],
    offered: "both",
  },
  {
    id: "hss-1a",
    label: "100 or above",
    title: "Humanities or Social Science",
    credits: 3,
    residencyCredits: 0,
    category: "non-ece",
    year: 1,
    term: "fall",
    row: 5,
    prereqs: [],
    offered: "both",
  },

  // Year 1 Spring
  {
    id: "math-152",
    label: "MATH 152/154/192",
    title: "Calculus II",
    credits: 4,
    residencyCredits: 0,
    category: "non-ece",
    year: 1,
    term: "spring",
    row: 0,
    prereqs: ["math-151"],
    offered: "both",
  },
  {
    id: "eng-221",
    label: "ENG 221",
    title: "Engineering Mechanics: Statics",
    credits: 3,
    residencyCredits: 0,
    category: "non-ece",
    year: 1,
    term: "spring",
    row: 1,
    prereqs: ["math-151", "phy-123"],
    offered: "both",
  },
  {
    id: "physics-124",
    label: "PHYSICS 124/116/201…",
    title: "Analytical Physics IB",
    credits: 2,
    residencyCredits: 0,
    category: "non-ece",
    year: 1,
    term: "spring",
    row: 2,
    prereqs: ["phy-123"],
    offered: "both",
  },
  {
    id: "idea-2",
    label: "IDEA II",
    title: "Integrated Data-Driven Design for Eng. Appl.",
    credits: 2,
    residencyCredits: 0,
    category: "non-ece",
    year: 1,
    term: "spring",
    row: 3,
    prereqs: ["idea-1"],
    offered: "both",
  },
  {
    id: "hss-1b",
    label: "100 or above",
    title: "Humanities or Social Science",
    credits: 3,
    residencyCredits: 0,
    category: "non-ece",
    year: 1,
    term: "spring",
    row: 4,
    prereqs: [],
    offered: "both",
  },

  // Year 2 Fall
  {
    id: "math-251",
    label: "MATH 251/291",
    title: "Multivariable Calculus",
    credits: 4,
    residencyCredits: 0,
    category: "non-ece",
    year: 2,
    term: "fall",
    row: 0,
    prereqs: ["math-152"],
    offered: "both",
  },
  {
    id: "ece-221-223",
    label: "ECE 221 + ECE 223",
    title: "Principles of EE I",
    credits: 4,
    residencyCredits: 4,
    category: "ece",
    year: 2,
    term: "fall",
    row: 1,
    prereqs: ["math-152", "physics-124"],
    offered: "both",
  },
  {
    id: "phy-227",
    label: "PHY 227 + 229",
    title: "Physics IIA",
    credits: 4,
    residencyCredits: 0,
    category: "non-ece",
    year: 2,
    term: "fall",
    row: 2,
    prereqs: ["physics-124"],
    offered: "both",
  },
  {
    id: "ece-231-233",
    label: "ECE 231 + ECE 233",
    title: "Digital Logic Design",
    credits: 4,
    residencyCredits: 4,
    category: "ece",
    year: 2,
    term: "fall",
    row: 3,
    prereqs: ["math-152", "phy-123"],
    offered: "both",
  },

  // Year 2 Spring
  {
    id: "math-244",
    label: "MATH 244",
    title: "Differential Equations",
    credits: 4,
    residencyCredits: 0,
    category: "non-ece",
    year: 2,
    term: "spring",
    row: 0,
    prereqs: ["math-251"],
    offered: "both",
  },
  {
    id: "ece-226",
    label: "226",
    title: "Probability and Random Processes",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 2,
    term: "spring",
    row: 1,
    prereqs: ["math-251"],
    offered: "fall",
    note: "Fall only",
  },
  {
    id: "ece-206",
    label: "CS 206",
    title: "Discrete Structures II",
    credits: 4,
    residencyCredits: 0,
    category: "non-ece",
    year: 2,
    term: "spring",
    row: 1,
    prereqs: ["math-152", "cs-111"],
    offered: "both",
    replacesMain: "ece-226",
    note: "Catalog: CS 205 + calc II; CS 111 path shown",
  },
  {
    id: "ece-477",
    label: "MATH 477",
    title: "Mathematical Theory of Probability",
    credits: 3,
    residencyCredits: 0,
    category: "non-ece",
    year: 2,
    term: "spring",
    row: 1,
    prereqs: ["math-251"],
    offered: "both",
    replacesMain: "ece-226",
    note: "Fall & spring; no credit with 226 or CS 206",
  },
  {
    id: "ece-222-224",
    label: "ECE 222 + ECE 224",
    title: "Principles of EE II",
    credits: 4,
    residencyCredits: 4,
    category: "ece",
    year: 2,
    term: "spring",
    row: 2,
    prereqs: ["ece-221-223", "math-251"],
    offered: "both",
  },
  {
    id: "ece-252",
    label: "PM1",
    title: "ECE 252 — Programming Methodology I",
    credits: 4,
    residencyCredits: 4,
    category: "ece",
    year: 2,
    term: "spring",
    row: 3,
    prereqs: ["idea-2"],
    offered: "both",
  },
  {
    id: "cs-111",
    label: "CS 111",
    title: "Intro to Computer Science",
    credits: 4,
    residencyCredits: 0,
    category: "non-ece",
    year: 2,
    term: "spring",
    row: 3,
    prereqs: ["math-151"],
    offered: "both",
    replacesMain: "ece-252",
  },

  // Year 3 Fall
  {
    id: "ece-345",
    label: "345",
    title: "Linear Systems and Signals",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 3,
    term: "fall",
    row: 0,
    prereqs: ["math-244", "ece-222-224"],
    offered: "both",
  },
  {
    id: "ece-351",
    label: "PM2",
    title: "ECE 351 — Programming Methodology II",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 3,
    term: "fall",
    row: 1,
    prereqs: ["ece-252"],
    offered: "fall",
    note: "Fall only",
  },
  {
    id: "cs-112",
    label: "CS 112",
    title: "Data Structures",
    credits: 4,
    residencyCredits: 0,
    category: "non-ece",
    year: 3,
    term: "fall",
    row: 1,
    prereqs: ["cs-111"],
    offered: "both",
    replacesMain: "ece-351",
  },
  {
    id: "ece-331-333",
    label: "ECE 331 + ECE 333",
    title: "Computer Architecture",
    credits: 4,
    residencyCredits: 4,
    category: "ece",
    year: 3,
    term: "fall",
    row: 2,
    prereqs: ["ece-231-233"],
    offered: "both",
  },
  {
    id: "ece-361",
    label: "361",
    title: "Electronic Devices",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 3,
    term: "fall",
    row: 3,
    prereqs: ["ece-222-224"],
    offered: "both",
    note: "Pick one of 361 / 346 / 322",
  },
  {
    id: "ece-346",
    label: "346",
    title: "Digital Signal Processing",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 3,
    term: "fall",
    row: 3,
    prereqs: ["ece-345"],
    offered: "spring",
    replacesMain: "ece-361",
    note: "Spring only · 345",
  },
  {
    id: "ece-322",
    label: "322",
    title: "Principles of Communication Systems",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 3,
    term: "fall",
    row: 3,
    prereqs: ["ece-226"],
    offered: "spring",
    replacesMain: "ece-361",
    note: "Spring only · 226",
  },
  {
    id: "hss-2a",
    label: "200 or above",
    title: "Humanities or Social Science",
    credits: 3,
    residencyCredits: 0,
    category: "non-ece",
    year: 3,
    term: "fall",
    row: 4,
    prereqs: [],
    offered: "both",
  },

  // Year 3 Spring
  {
    id: "ece-312",
    label: "312",
    title: "Discrete Mathematics",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 3,
    term: "spring",
    row: 0,
    prereqs: ["math-251"],
    offered: "both",
  },
  {
    id: "ece-205",
    label: "CS 205",
    title: "Discrete Structures I",
    credits: 4,
    residencyCredits: 0,
    category: "non-ece",
    year: 3,
    term: "spring",
    row: 0,
    prereqs: ["cs-111", "math-152"],
    offered: "both",
    replacesMain: "ece-312",
  },
  {
    id: "ece-300",
    label: "MATH 300",
    title: "Mathematical Reasoning",
    credits: 3,
    residencyCredits: 0,
    category: "non-ece",
    year: 3,
    term: "spring",
    row: 0,
    prereqs: ["math-251"],
    offered: "both",
    replacesMain: "ece-312",
  },
  {
    id: "ece-434",
    label: "434",
    title: "Intro to Comp Systems",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 3,
    term: "spring",
    row: 1,
    prereqs: ["ece-331-333", "ece-351"],
    offered: "both",
  },
  {
    id: "ece-452",
    label: "452",
    title: "Software Engineering",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 3,
    term: "spring",
    row: 2,
    prereqs: ["ece-351"],
    offered: "both",
  },
  {
    id: "ece-393",
    label: "393",
    title: "Professionalism/Ethics",
    credits: 1,
    residencyCredits: 1,
    category: "ece",
    year: 3,
    term: "spring",
    row: 3,
    prereqs: [],
    offered: "spring",
    note: "Spring only",
  },
  {
    id: "ise-343",
    label: "ISE 343",
    title: "Engineering Economics",
    credits: 3,
    residencyCredits: 0,
    category: "non-ece",
    year: 3,
    term: "spring",
    row: 4,
    prereqs: [],
    offered: "both",
  },
  {
    id: "tech-elective-1",
    label: "Technical Elective",
    title: "Technical Elective (see dept list)",
    credits: 3,
    residencyCredits: 3,
    category: "elective",
    year: 3,
    term: "spring",
    row: 5,
    prereqs: [],
    offered: "both",
  },

  // Year 4 Fall
  {
    id: "comp-elective-1",
    label: "Computer Elective 1",
    title: "Computer Elective (see dept list)",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 4,
    term: "fall",
    row: 0,
    prereqs: [],
    offered: "both",
  },
  {
    id: "ece-449",
    label: "449",
    title: "Intro To Capstone",
    credits: 1,
    residencyCredits: 1,
    category: "ece",
    year: 4,
    term: "fall",
    row: 1,
    prereqs: [],
    offered: "both",
  },
  {
    id: "ece-437",
    label: "437",
    title: "Digital Systems Design",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 4,
    term: "fall",
    row: 2,
    prereqs: ["ece-331-333", "ece-351"],
    offered: "fall",
    note: "Fall only; catalog: (331 or CS 211) and (351 or CS 112)",
  },
  {
    id: "comp-elective-2",
    label: "Computer Elective 2",
    title: "Computer Elective (see dept list)",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 4,
    term: "fall",
    row: 3,
    prereqs: [],
    offered: "both",
  },
  {
    id: "hss-2b",
    label: "200 or above",
    title: "Humanities or Social Science",
    credits: 3,
    residencyCredits: 0,
    category: "non-ece",
    year: 4,
    term: "fall",
    row: 4,
    prereqs: [],
    offered: "both",
  },
  {
    id: "sci-elective",
    label: "Sci / Math / Eng Elective",
    title: "Science, Math, or Engineering Elective",
    credits: 3,
    residencyCredits: 0,
    category: "elective",
    year: 4,
    term: "fall",
    row: 5,
    prereqs: [],
    offered: "both",
  },

  // Year 4 Spring
  {
    id: "general-elective",
    label: "General Elective",
    title: "General Elective (see dept list)",
    credits: 3,
    residencyCredits: 0,
    category: "elective",
    year: 4,
    term: "spring",
    row: 0,
    prereqs: [],
    offered: "both",
  },
  {
    id: "ece-448",
    label: "448",
    title: "Capstone Design",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 4,
    term: "spring",
    row: 1,
    prereqs: ["ece-449", "ece-345"],
    offered: "both",
  },
  {
    id: "comp-elective-3",
    label: "Computer Elective 3",
    title: "Computer Elective (see dept list)",
    credits: 3,
    residencyCredits: 3,
    category: "ece",
    year: 4,
    term: "spring",
    row: 2,
    prereqs: [],
    offered: "both",
  },
  {
    id: "tech-elective-2",
    label: "Technical Elective",
    title: "Technical Elective (see dept list)",
    credits: 3,
    residencyCredits: 3,
    category: "elective",
    year: 4,
    term: "spring",
    row: 3,
    prereqs: [],
    offered: "both",
  },
];

export const courseMap = Object.fromEntries(
  courses.map((c) => [c.id, c]),
) as Record<string, Course>;

/** Main slot id (primary course for this requirement). */
export function getMainSlotId(id: string): string {
  const c = courseMap[id];
  return c?.replacesMain ?? id;
}

/** All course ids that satisfy the same slot as this course. */
export function getSlotIds(id: string): string[] {
  const main = getMainSlotId(id);
  const alts = courses
    .filter((c) => c.replacesMain === main)
    .map((c) => c.id);
  return [main, ...alts];
}

export function isPrereqSatisfied(
  prereqId: string,
  completedIds: Set<string>,
): boolean {
  const slot = getSlotIds(prereqId);
  return slot.some((sid) => completedIds.has(sid));
}

/** Direct next courses (primary boxes only). */
export function getUnlocks(id: string): Course[] {
  const slots = new Set(getSlotIds(id));
  return courses.filter(
    (c) =>
      !c.replacesMain &&
      c.prereqs.some((p) => slots.has(p)),
  );
}

export function edgeKey(from: string, to: string): string {
  return `${from}->${to}`;
}

/** Prereq arrow keys to highlight on hover (incoming + outgoing). */
export function getHighlightedEdgeKeys(hoveredId: string | null): Set<string> {
  if (!hoveredId) return new Set();
  const hoveredSlot = getMainSlotId(hoveredId);
  const fromSlots = new Set(getSlotIds(hoveredId));
  const keys = new Set<string>();
  for (const { from, to } of getPrereqEdges()) {
    if (fromSlots.has(from) || to === hoveredSlot) {
      keys.add(edgeKey(from, to));
    }
  }
  return keys;
}

/** Course ids unlocked next on hover (per option in split boxes). */
export function getUnlockCourseIds(hoveredId: string | null): Set<string> {
  if (!hoveredId) return new Set();
  const fromSlots = new Set(getSlotIds(hoveredId));
  const ids = new Set<string>();
  for (const c of courses) {
    if (c.prereqs.some((p) => fromSlots.has(getMainSlotId(p)))) {
      ids.add(c.id);
    }
  }
  return ids;
}

export function getPrereqEdges(): { from: string; to: string }[] {
  const edges: { from: string; to: string }[] = [];
  for (const c of courses) {
    const to = getMainSlotId(c.id);
    for (const p of c.prereqs) {
      const from = getMainSlotId(p);
      if (courseMap[from]) edges.push({ from, to });
    }
  }
  return edges;
}

export function groupCoursesByRow(
  year: number,
  term: "fall" | "spring",
): { row: number; primary: Course; alternatives: Course[] }[] {
  const cell = courses.filter((c) => c.year === year && c.term === term);
  const byRow = new Map<number, { primary: Course; alternatives: Course[] }>();
  for (const c of cell) {
    if (c.replacesMain) {
      const row = byRow.get(c.row);
      if (row) row.alternatives.push(c);
      else {
        const main = courseMap[c.replacesMain];
        if (main) {
          byRow.set(c.row, { primary: main, alternatives: [c] });
        }
      }
    } else if (!byRow.has(c.row)) {
      byRow.set(c.row, { primary: c, alternatives: [] });
    } else {
      byRow.get(c.row)!.primary = c;
    }
  }
  return [...byRow.entries()]
    .sort(([a], [b]) => a - b)
    .map(([row, g]) => ({ row, ...g }));
}
