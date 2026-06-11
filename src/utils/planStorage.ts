import type { DegreeTrack } from "../data/tracks";
import { getTrack } from "../data/tracks";
import type { PlannerSemester, PlanScenario, Term } from "../types";

const STORAGE_VERSION = 3;
const LEGACY_KEY = "ru-ce-course-track-plan";
const planKey = (track: DegreeTrack) => `ru-ce-course-track-plan-${track}`;
const TRACK_KEY = "ru-ce-course-track-active";

export interface PersistedPlan {
  version: number;
  scenarios: PlanScenario[];
  activeScenarioId: string;
  availableTerm: Term;
  plannerWidth: number;
  electivesHeight: number;
}

export function defaultSemesters(): PlannerSemester[] {
  return [
    { id: "sem-default-fall-2025",   name: "Fall 2025",   term: "fall",   slots: [] },
    { id: "sem-default-spring-2026", name: "Spring 2026", term: "spring", slots: [] },
    { id: "sem-default-fall-2026",   name: "Fall 2026",   term: "fall",   slots: [] },
  ];
}

export function defaultScenario(name = "My Plan"): PlanScenario {
  const semesters = defaultSemesters();
  return {
    id: `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    semesters,
    activeSemesterId: semesters[0].id,
  };
}

export function defaultPersistedPlan(): PersistedPlan {
  const scenario = defaultScenario();
  return {
    version: STORAGE_VERSION,
    scenarios: [scenario],
    activeScenarioId: scenario.id,
    availableTerm: "fall",
    plannerWidth: 300,
    electivesHeight: 200,
  };
}

function isTerm(value: unknown): value is Term {
  return value === "fall" || value === "spring";
}

function isDegreeTrack(value: unknown): value is DegreeTrack {
  return value === "ce" || value === "ee";
}

function sanitizeSemesters(
  raw: unknown,
  track: DegreeTrack,
): PlannerSemester[] | null {
  const courseMap = getTrack(track).catalog.courseMap;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const semesters: PlannerSemester[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id   = typeof row.id   === "string" ? row.id.trim()   : "";
    const name = typeof row.name === "string" ? row.name.trim() : "";
    if (!id || !name || !isTerm(row.term)) continue;

    const slots: PlannerSemester["slots"] = [];
    const seenSlots = new Set<string>();
    if (Array.isArray(row.slots)) {
      for (const slot of row.slots) {
        if (!slot || typeof slot !== "object") continue;
        const s = slot as Record<string, unknown>;
        const slotId   = typeof s.slotId   === "string" ? s.slotId   : "";
        const chosenId = typeof s.chosenId === "string" ? s.chosenId : "";
        if (!slotId || !chosenId || seenSlots.has(slotId)) continue;
        if (!courseMap[slotId] || !courseMap[chosenId]) continue;
        seenSlots.add(slotId);
        const customName =
          typeof s.customName === "string" && s.customName.trim().length > 0
            ? s.customName.trim().slice(0, 80)
            : undefined;
        slots.push({
          slotId,
          chosenId,
          overridden: s.overridden === true,
          ...(customName ? { customName } : {}),
        });
      }
    }
    semesters.push({ id, name, term: row.term, slots });
  }
  return semesters.length > 0 ? semesters : null;
}

function sanitizeScenario(
  raw: unknown,
  track: DegreeTrack,
  fallbackName: string,
): PlanScenario | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id   = typeof r.id   === "string" ? r.id.trim()   : "";
  const name = typeof r.name === "string" ? r.name.trim() : fallbackName;
  if (!id) return null;

  const semesters = sanitizeSemesters(r.semesters, track);
  if (!semesters) return null;

  const activeRaw = typeof r.activeSemesterId === "string" ? r.activeSemesterId : "";
  const activeSemesterId = semesters.some((s) => s.id === activeRaw)
    ? activeRaw
    : semesters[0].id;

  return { id, name, semesters, activeSemesterId };
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function parsePlan(data: Record<string, unknown>, track: DegreeTrack): PersistedPlan | null {
  const defaults = defaultPersistedPlan();

  // v3 format: scenarios array
  if (Array.isArray(data.scenarios) && data.scenarios.length > 0) {
    const scenarios: PlanScenario[] = [];
    for (let i = 0; i < data.scenarios.length; i++) {
      const s = sanitizeScenario(data.scenarios[i], track, `Plan ${i + 1}`);
      if (s) scenarios.push(s);
    }
    if (scenarios.length === 0) return null;

    const activeRaw = typeof data.activeScenarioId === "string" ? data.activeScenarioId : "";
    const activeScenarioId = scenarios.some((s) => s.id === activeRaw)
      ? activeRaw
      : scenarios[0].id;

    return {
      version: STORAGE_VERSION,
      scenarios,
      activeScenarioId,
      availableTerm: isTerm(data.availableTerm) ? data.availableTerm : defaults.availableTerm,
      plannerWidth:    clampNumber(data.plannerWidth,    220, 560, defaults.plannerWidth),
      electivesHeight: clampNumber(data.electivesHeight, 100, 800, defaults.electivesHeight),
    };
  }

  // v2 migration: top-level semesters → wrap in a single scenario
  if (Array.isArray(data.semesters)) {
    const semesters = sanitizeSemesters(data.semesters, track);
    if (!semesters) return null;

    const activeSemRaw = typeof data.activeSemesterId === "string" ? data.activeSemesterId : "";
    const activeSemesterId = semesters.some((s) => s.id === activeSemRaw)
      ? activeSemRaw
      : semesters[0].id;

    const scenario: PlanScenario = {
      id: `scenario-migrated-${track}`,
      name: "My Plan",
      semesters,
      activeSemesterId,
    };

    return {
      version: STORAGE_VERSION,
      scenarios: [scenario],
      activeScenarioId: scenario.id,
      availableTerm: isTerm(data.availableTerm) ? data.availableTerm : defaults.availableTerm,
      plannerWidth:    clampNumber(data.plannerWidth,    220, 560, defaults.plannerWidth),
      electivesHeight: clampNumber(data.electivesHeight, 100, 800, defaults.electivesHeight),
    };
  }

  return null;
}

function migrateLegacyCePlan(): PersistedPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const plan = parsePlan(parsed as Record<string, unknown>, "ce");
    if (plan) {
      window.localStorage.setItem(planKey("ce"), JSON.stringify(plan));
      window.localStorage.removeItem(LEGACY_KEY);
    }
    return plan;
  } catch {
    return null;
  }
}

export function loadActiveTrack(): DegreeTrack {
  if (typeof window === "undefined") return "ce";
  try {
    const raw = window.localStorage.getItem(TRACK_KEY);
    return isDegreeTrack(raw) ? raw : "ce";
  } catch {
    return "ce";
  }
}

export function saveActiveTrack(track: DegreeTrack): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TRACK_KEY, track);
  } catch { /* ignore */ }
}

export function loadPersistedPlan(track: DegreeTrack): PersistedPlan | null {
  if (typeof window === "undefined") return null;
  try {
    let raw = window.localStorage.getItem(planKey(track));
    if (!raw && track === "ce") {
      const legacy = migrateLegacyCePlan();
      if (legacy) return legacy;
      raw = window.localStorage.getItem(planKey("ce"));
    }
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsePlan(parsed as Record<string, unknown>, track);
  } catch {
    return null;
  }
}

export function savePersistedPlan(track: DegreeTrack, plan: PersistedPlan): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(planKey(track), JSON.stringify({ ...plan, version: STORAGE_VERSION }));
  } catch { /* quota exceeded or private mode */ }
}
