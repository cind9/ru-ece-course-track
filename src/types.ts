export type Term = "fall" | "spring";
export type SemesterOffered = "fall" | "spring" | "both";
export type CourseCategory = "non-ece" | "ece" | "elective";

export interface Course {
  id: string;
  label: string;
  title: string;
  credits: number;
  residencyCredits: number;
  category: CourseCategory;
  year: 1 | 2 | 3 | 4;
  term: Term;
  row: number;
  prereqs: string[];
  offered: SemesterOffered;
  /** Alternative fulfills the same requirement slot as this primary course. */
  replacesMain?: string;
  note?: string;
}

export interface PlannedSlot {
  slotId: string;
  chosenId: string;
  /** Added without prerequisites (advisor override). */
  overridden?: boolean;
}

export interface PlannerSemester {
  id: string;
  name: string;
  term: Term;
  slots: PlannedSlot[];
}
