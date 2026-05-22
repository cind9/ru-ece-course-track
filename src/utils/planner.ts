import {
  courseMap,
  courses,
  getMainSlotId,
  isPrereqSatisfied,
} from "../data/courses";
import type { Course } from "../types";
import type { PlannerSemester, Term } from "../types";

/** ECE residency credits required for CE degree (planned total). */
export const ECE_RESIDENCY_REQUIRED = 51;

export function sumCredits(chosenIds: string[]) {
  let credits = 0;
  let residency = 0;
  for (const id of chosenIds) {
    const c = courseMap[id];
    if (c) {
      credits += c.credits;
      residency += c.residencyCredits;
    }
  }
  return { credits, residency };
}

export function allChosenIds(semesters: PlannerSemester[]): string[] {
  return semesters.flatMap((s) => s.slots.map((sl) => sl.chosenId));
}

export function allPlannedSlotIds(semesters: PlannerSemester[]): string[] {
  return semesters.flatMap((s) => s.slots.map((sl) => sl.slotId));
}

export function plannedSlotIdSet(semesters: PlannerSemester[]): Set<string> {
  return new Set(allPlannedSlotIds(semesters));
}

export function completedIdsFromSlots(semesters: PlannerSemester[]): Set<string> {
  return new Set(allChosenIds(semesters));
}

export function getSlotIdForCourse(courseId: string): string {
  return getMainSlotId(courseId);
}

export function getUnmetPrereqs(
  courseId: string,
  completedIds: Set<string>,
): Course[] {
  const course = courseMap[courseId];
  if (!course) return [];
  return course.prereqs
    .filter((p) => !isPrereqSatisfied(p, completedIds))
    .map((p) => courseMap[p])
    .filter((c): c is Course => Boolean(c));
}

export function formatPrereqError(missing: Course[]): string {
  if (missing.length === 0) return "";
  const names = missing.map((c) => c.label).join(", ");
  return missing.length === 1
    ? `${names} is required`
    : `${names} are required`;
}

export function getAvailableCourses(
  completedIds: Set<string>,
  plannedSlotIds: Set<string>,
  targetTerm: Term,
): Course[] {
  return courses.filter((c) => {
    if (c.replacesMain) return false;
    const slotId = c.id;
    if (plannedSlotIds.has(slotId)) return false;
    if (completedIds.has(c.id)) return false;
    if (c.category === "elective" && c.label.startsWith("See")) return false;
    const prereqsMet = c.prereqs.every((p) =>
      isPrereqSatisfied(p, completedIds),
    );
    const termOk = c.offered === "both" || c.offered === targetTerm;
    return prereqsMet && termOk;
  });
}

export function isSlotOverridden(
  semesters: PlannerSemester[],
  slotId: string,
): boolean {
  for (const sem of semesters) {
    const slot = sem.slots.find((s) => s.slotId === slotId);
    if (slot?.overridden) return true;
  }
  return false;
}
