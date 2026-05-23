import { courseMap } from "../data/courses";
import type { PlannerSemester, Term } from "../types";

const STORAGE_KEY = "ru-ce-course-track-plan";
const STORAGE_VERSION = 1;

export interface PersistedPlan {
  version: number;
  semesters: PlannerSemester[];
  activeSemesterId: string;
  availableTerm: Term;
  plannerWidth: number;
  electivesHeight: number;
}

export function defaultSemesters(): PlannerSemester[] {
  return [
    {
      id: "sem-default-fall-2025",
      name: "Fall 2025",
      term: "fall",
      slots: [],
    },
    {
      id: "sem-default-spring-2026",
      name: "Spring 2026",
      term: "spring",
      slots: [],
    },
    {
      id: "sem-default-fall-2026",
      name: "Fall 2026",
      term: "fall",
      slots: [],
    },
  ];
}

export function defaultPersistedPlan(): PersistedPlan {
  const semesters = defaultSemesters();
  return {
    version: STORAGE_VERSION,
    semesters,
    activeSemesterId: semesters[0].id,
    availableTerm: "fall",
    plannerWidth: 300,
    electivesHeight: 200,
  };
}

function isTerm(value: unknown): value is Term {
  return value === "fall" || value === "spring";
}

function sanitizeSemesters(raw: unknown): PlannerSemester[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const semesters: PlannerSemester[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id.trim() : "";
    const name = typeof row.name === "string" ? row.name.trim() : "";
    if (!id || !name || !isTerm(row.term)) continue;

    const slots: PlannerSemester["slots"] = [];
    const seenSlots = new Set<string>();
    if (Array.isArray(row.slots)) {
      for (const slot of row.slots) {
        if (!slot || typeof slot !== "object") continue;
        const s = slot as Record<string, unknown>;
        const slotId = typeof s.slotId === "string" ? s.slotId : "";
        const chosenId = typeof s.chosenId === "string" ? s.chosenId : "";
        if (!slotId || !chosenId || seenSlots.has(slotId)) continue;
        if (!courseMap[slotId] || !courseMap[chosenId]) continue;
        seenSlots.add(slotId);
        slots.push({
          slotId,
          chosenId,
          overridden: s.overridden === true,
        });
      }
    }

    semesters.push({ id, name, term: row.term, slots });
  }

  return semesters.length > 0 ? semesters : null;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function loadPersistedPlan(): PersistedPlan | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const data = parsed as Record<string, unknown>;
    const semesters = sanitizeSemesters(data.semesters);
    if (!semesters) return null;

    const activeRaw =
      typeof data.activeSemesterId === "string"
        ? data.activeSemesterId
        : semesters[0].id;
    const activeSemesterId = semesters.some((s) => s.id === activeRaw)
      ? activeRaw
      : semesters[0].id;

    const defaults = defaultPersistedPlan();

    return {
      version: STORAGE_VERSION,
      semesters,
      activeSemesterId,
      availableTerm: isTerm(data.availableTerm)
        ? data.availableTerm
        : defaults.availableTerm,
      plannerWidth: clampNumber(data.plannerWidth, 220, 560, defaults.plannerWidth),
      electivesHeight: clampNumber(
        data.electivesHeight,
        100,
        800,
        defaults.electivesHeight,
      ),
    };
  } catch {
    return null;
  }
}

export function savePersistedPlan(plan: PersistedPlan): void {
  if (typeof window === "undefined") return;

  try {
    const payload: PersistedPlan = {
      ...plan,
      version: STORAGE_VERSION,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota exceeded or private mode */
  }
}
