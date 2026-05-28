import { useCallback, useEffect, useMemo, useState } from "react";
import { useUndoable } from "./hooks/useUndoable";
import { Flowchart } from "./components/Flowchart";
import type { PendingOverride } from "./components/CourseSlot";
import { ElectivesPanel } from "./components/ElectivesPanel";
import { PlannerPanel } from "./components/PlannerPanel";
import { ResizablePanel } from "./components/ResizablePanel";
import { TrackProvider } from "./context/TrackContext";
import type { DegreeTrack } from "./data/tracks";
import { getTrack, TRACK_ORDER } from "./data/tracks";
import type { PlannerSemester, Term } from "./types";
import {
  defaultPersistedPlan,
  loadActiveTrack,
  loadPersistedPlan,
  saveActiveTrack,
  savePersistedPlan,
  type PersistedPlan,
} from "./utils/planStorage";
import { useTrackContext } from "./context/TrackContext";
import "./App.css";

function newSemester(name: string, term: Term = "fall"): PlannerSemester {
  return {
    id: `sem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    term,
    slots: [],
  };
}

function AppContent({
  degreeTrack,
  onDegreeTrackChange,
  initialPlan,
}: {
  degreeTrack: DegreeTrack;
  onDegreeTrackChange: (track: DegreeTrack) => void;
  initialPlan: PersistedPlan;
}) {
  const { track, planner } = useTrackContext();
  const [semesters, setSemesters, undoSemesters, canUndo] = useUndoable<PlannerSemester[]>(
    initialPlan.semesters,
  );
  const [activeSemesterId, setActiveSemesterId] = useState(
    initialPlan.activeSemesterId,
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [availableTerm, setAvailableTerm] = useState<Term>(
    initialPlan.availableTerm,
  );
  const [pendingOverride, setPendingOverride] =
    useState<PendingOverride | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [plannerWidth, setPlannerWidth] = useState(initialPlan.plannerWidth);
  const [electivesHeight, setElectivesHeight] = useState(
    initialPlan.electivesHeight,
  );
  const [viewportHeight, setViewportHeight] = useState(
    () => (typeof window !== "undefined" ? window.innerHeight : 800),
  );
  const [viewportWidth, setViewportWidth] = useState(
    () => (typeof window !== "undefined" ? window.innerWidth : 1200),
  );

  useEffect(() => {
    const onResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "z" && !e.shiftKey) {
        // Don't intercept when the user is typing in an input/textarea
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        undoSemesters();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undoSemesters]);

  const electivesMaxHeight = useMemo(
    () => Math.round(viewportHeight * 0.72),
    [viewportHeight],
  );
  const plannerMaxWidth = useMemo(() => {
    const cap = Math.round(viewportWidth * 0.48);
    return Math.min(560, Math.max(220, cap));
  }, [viewportWidth]);

  useEffect(() => {
    setElectivesHeight((h) => Math.min(h, electivesMaxHeight));
  }, [electivesMaxHeight]);

  useEffect(() => {
    setPlannerWidth((w) => Math.min(w, plannerMaxWidth));
  }, [plannerMaxWidth]);

  const currentPlan = useMemo(
    (): PersistedPlan => ({
      version: 2,
      semesters,
      activeSemesterId,
      availableTerm,
      plannerWidth,
      electivesHeight,
    }),
    [
      semesters,
      activeSemesterId,
      availableTerm,
      plannerWidth,
      electivesHeight,
    ],
  );

  useEffect(() => {
    const save = () => savePersistedPlan(degreeTrack, currentPlan);
    const timer = window.setTimeout(save, 250);
    window.addEventListener("beforeunload", save);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeunload", save);
    };
  }, [degreeTrack, currentPlan]);

  const plannedSlotIds = useMemo(
    () => planner.plannedSlotIdSet(semesters),
    [planner, semesters],
  );
  const activePlannedSlotIds = useMemo(() => {
    const active = semesters.find((s) => s.id === activeSemesterId);
    return new Set(active?.slots.map((s) => s.slotId) ?? []);
  }, [semesters, activeSemesterId]);
  const activeChosenIds = useMemo(() => {
    const active = semesters.find((s) => s.id === activeSemesterId);
    return new Set(active?.slots.map((s) => s.chosenId) ?? []);
  }, [semesters, activeSemesterId]);
  const completedIds = useMemo(
    () => planner.completedIdsFromSlots(semesters),
    [planner, semesters],
  );
  const chosenIdsList = useMemo(
    () => planner.allChosenIds(semesters),
    [planner, semesters],
  );

  const overriddenSlotIds = useMemo(() => {
    const ids = new Set<string>();
    for (const slotId of planner.allPlannedSlotIds(semesters)) {
      if (planner.isSlotOverridden(semesters, slotId)) ids.add(slotId);
    }
    return ids;
  }, [planner, semesters]);

  const addSlotToActiveSemester = useCallback(
    (slotId: string, chosenId: string, overridden = false) => {
      setSemesters((prev) =>
        prev.map((sem) => {
          if (sem.id !== activeSemesterId) return sem;
          return {
            ...sem,
            slots: [...sem.slots, { slotId, chosenId, overridden }],
          };
        }),
      );
      setPendingOverride(null);
      setAddError(null);
    },
    [activeSemesterId],
  );

  const removeSlotFromActiveSemester = useCallback((slotId: string) => {
    setSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id !== activeSemesterId) return sem;
        return {
          ...sem,
          slots: sem.slots.filter((s) => s.slotId !== slotId),
        };
      }),
    );
    setPendingOverride(null);
    setAddError(null);
  }, [activeSemesterId]);

  const requestSlot = useCallback(
    (slotId: string, chosenId: string) => {
      const activeSem = semesters.find((s) => s.id === activeSemesterId);
      const existing = activeSem?.slots.find((s) => s.slotId === slotId);

      if (existing) {
        removeSlotFromActiveSemester(slotId);
        return;
      }

      if (plannedSlotIds.has(slotId)) {
        return;
      }

      const missing = planner.getUnmetPrereqs(chosenId, completedIds);
      if (missing.length === 0) {
        addSlotToActiveSemester(slotId, chosenId, false);
        return;
      }

      setAddError(planner.formatPrereqError(missing));
      setPendingOverride({ slotId, chosenId });
    },
    [
      semesters,
      activeSemesterId,
      completedIds,
      addSlotToActiveSemester,
      removeSlotFromActiveSemester,
      plannedSlotIds,
      planner,
    ],
  );

  const confirmOverride = useCallback(() => {
    if (!pendingOverride) return;
    addSlotToActiveSemester(
      pendingOverride.slotId,
      pendingOverride.chosenId,
      true,
    );
  }, [pendingOverride, addSlotToActiveSemester]);

  const cancelOverride = useCallback(() => {
    setPendingOverride(null);
    setAddError(null);
  }, []);

  const removeSlotFromSemester = (semesterId: string, slotId: string) => {
    setSemesters((prev) =>
      prev.map((sem) =>
        sem.id === semesterId
          ? { ...sem, slots: sem.slots.filter((s) => s.slotId !== slotId) }
          : sem,
      ),
    );
    setPendingOverride(null);
    setAddError(null);
  };

  const reorderSemesters = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setSemesters((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const addSemester = () => {
    const n = semesters.length + 1;
    const sem = newSemester(`Semester ${n}`);
    setSemesters((prev) => [...prev, sem]);
    setActiveSemesterId(sem.id);
  };

  const removeSemester = (id: string) => {
    setSemesters((prev) => {
      const next = prev.filter((s) => s.id !== id);
      const final =
        next.length > 0 ? next : defaultPersistedPlan().semesters;
      if (activeSemesterId === id) {
        setActiveSemesterId(final[0].id);
      }
      return final;
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1>{track.title}</h1>
          <div className="degree-tabs" role="tablist" aria-label="Degree track">
            {TRACK_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={degreeTrack === id}
                className={`degree-tab${degreeTrack === id ? " degree-tab--active" : ""}`}
                onClick={() => onDegreeTrackChange(id)}
              >
                {getTrack(id).label}
              </button>
            ))}
          </div>
        </div>
        <p className="subtitle">{track.subtitle}</p>
        <p className="flowchart-ref">
          Official flowchart:{" "}
          <a href={track.flowchartRef} target="_blank" rel="noreferrer">
            Rutgers ECE {track.label} curriculum
          </a>
        </p>
      </header>

      <main className="app-main">
        <div className="app-main-center">
          <Flowchart
            hoveredId={hoveredId}
            plannedSlotIds={plannedSlotIds}
            activePlannedSlotIds={activePlannedSlotIds}
            activeChosenIds={activeChosenIds}
            overriddenSlotIds={overriddenSlotIds}
            completedIds={completedIds}
            pendingOverride={pendingOverride}
            addError={addError}
            onHover={setHoveredId}
            onRequestSlot={requestSlot}
            onConfirmOverride={confirmOverride}
            onCancelOverride={cancelOverride}
          />
          <ResizablePanel
            edge="left"
            className="planner-panel-wrap"
            size={plannerWidth}
            minSize={220}
            maxSize={plannerMaxWidth}
            onSizeChange={setPlannerWidth}
            resizeLabel="Resize semester planner — drag the left edge"
          >
            <PlannerPanel
              semesters={semesters}
              activeSemesterId={activeSemesterId}
              onActiveChange={setActiveSemesterId}
              onAddSemester={addSemester}
              onRemoveSemester={removeSemester}
              onRenameSemester={(id, name) =>
                setSemesters((prev) =>
                  prev.map((s) => (s.id === id ? { ...s, name } : s)),
                )
              }
              onRemoveSlotFromSemester={removeSlotFromSemester}
              onReorderSemesters={reorderSemesters}
              availableTerm={availableTerm}
              onAvailableTermChange={setAvailableTerm}
              allChosenIds={chosenIdsList}
              plannedSlotIds={plannedSlotIds}
              onUndo={undoSemesters}
              canUndo={canUndo}
            />
          </ResizablePanel>
        </div>
        <ResizablePanel
          edge="top"
          className="electives-panel-wrap"
          size={electivesHeight}
          minSize={100}
          maxSize={electivesMaxHeight}
          onSizeChange={setElectivesHeight}
          resizeLabel={`Resize ${track.electives.panelTitle} — drag the top edge`}
        >
          <ElectivesPanel />
        </ResizablePanel>
      </main>
    </div>
  );
}

function App() {
  const [degreeTrack, setDegreeTrack] = useState<DegreeTrack>(() =>
    loadActiveTrack(),
  );

  const handleDegreeTrackChange = (next: DegreeTrack) => {
    if (next === degreeTrack) return;
    saveActiveTrack(next);
    setDegreeTrack(next);
  };

  const initialPlan =
    loadPersistedPlan(degreeTrack) ?? defaultPersistedPlan();

  return (
    <TrackProvider track={getTrack(degreeTrack)}>
      <AppContent
        key={degreeTrack}
        degreeTrack={degreeTrack}
        onDegreeTrackChange={handleDegreeTrackChange}
        initialPlan={initialPlan}
      />
    </TrackProvider>
  );
}

export default App;
