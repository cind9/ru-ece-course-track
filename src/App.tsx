import { useCallback, useEffect, useMemo, useState } from "react";
import { useUndoable } from "./hooks/useUndoable";
import { Flowchart } from "./components/Flowchart";
import type { PendingOverride } from "./components/CourseSlot";
import { ElectivesPanel } from "./components/ElectivesPanel";
import { PlannerPanel } from "./components/PlannerPanel";
import { ResizablePanel } from "./components/ResizablePanel";
import { ScenarioTabs } from "./components/ScenarioTabs";
import { TrackProvider } from "./context/TrackContext";
import type { DegreeTrack } from "./data/tracks";
import { getTrack, TRACK_ORDER } from "./data/tracks";
import type { PlannerSemester, PlanScenario, Term } from "./types";
import {
  defaultPersistedPlan,
  defaultScenario,
  defaultSemesters,
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

  // ── Scenario state ──────────────────────────────────────────────────────────
  const [scenarios, setScenarios] = useState<PlanScenario[]>(initialPlan.scenarios);
  const [activeScenarioId, setActiveScenarioId] = useState(initialPlan.activeScenarioId);

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) ?? scenarios[0];

  const [semesters, setSemesters, undoSemesters, redoSemesters, resetSemesters, canUndo, canRedo] =
    useUndoable<PlannerSemester[]>(activeScenario.semesters);
  const [activeSemesterId, setActiveSemesterId] = useState(activeScenario.activeSemesterId);
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
  const [mobilePlannerOpen, setMobilePlannerOpen] = useState(false);
  const [mobileElectivesOpen, setMobileElectivesOpen] = useState(false);
  const [mobileSemPickerOpen, setMobileSemPickerOpen] = useState(false);
  const isMobile = viewportWidth <= 768;

  useEffect(() => {
    if (!isMobile) {
      setMobilePlannerOpen(false);
      setMobileElectivesOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile && (mobilePlannerOpen || mobileElectivesOpen)) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
    return () => document.body.classList.remove("drawer-open");
  }, [isMobile, mobilePlannerOpen, mobileElectivesOpen]);

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
      if (!isMod) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undoSemesters();
      } else if (e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redoSemesters();
      } else if (e.key === "y") {
        e.preventDefault();
        redoSemesters();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undoSemesters, redoSemesters]);

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
      version: 3,
      scenarios: scenarios.map((s) =>
        s.id === activeScenarioId
          ? { ...s, semesters, activeSemesterId }
          : s,
      ),
      activeScenarioId,
      availableTerm,
      plannerWidth,
      electivesHeight,
    }),
    [scenarios, activeScenarioId, semesters, activeSemesterId, availableTerm, plannerWidth, electivesHeight],
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

  // ── Scenario handlers ───────────────────────────────────────────────────────
  const switchScenario = useCallback(
    (id: string) => {
      if (id === activeScenarioId) return;
      // Flush current semesters into scenarios before switching
      setScenarios((prev) =>
        prev.map((s) =>
          s.id === activeScenarioId ? { ...s, semesters, activeSemesterId } : s,
        ),
      );
      const target = scenarios.find((s) => s.id === id);
      if (!target) return;
      setActiveScenarioId(id);
      resetSemesters(target.semesters);
      setActiveSemesterId(target.activeSemesterId);
    },
    [activeScenarioId, scenarios, semesters, activeSemesterId, resetSemesters],
  );

  const addScenario = useCallback(() => {
    // Flush current first
    setScenarios((prev) =>
      prev.map((s) =>
        s.id === activeScenarioId ? { ...s, semesters, activeSemesterId } : s,
      ),
    );
    const n = scenarios.length + 1;
    const scenario = defaultScenario(`Plan ${n}`);
    setScenarios((prev) => [...prev, scenario]);
    setActiveScenarioId(scenario.id);
    resetSemesters(scenario.semesters);
    setActiveSemesterId(scenario.activeSemesterId);
  }, [activeScenarioId, scenarios, semesters, activeSemesterId, resetSemesters]);

  const removeScenario = useCallback(
    (id: string) => {
      if (scenarios.length <= 1) return;
      const next = scenarios.filter((s) => s.id !== id);
      setScenarios(next);
      if (id === activeScenarioId) {
        const target = next[0];
        setActiveScenarioId(target.id);
        resetSemesters(target.semesters);
        setActiveSemesterId(target.activeSemesterId);
      }
    },
    [scenarios, activeScenarioId, resetSemesters],
  );

  const renameScenario = useCallback((id: string, name: string) => {
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }, []);

  const reorderScenarios = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      setScenarios((prev) => {
        if (
          fromIndex < 0 || fromIndex >= prev.length ||
          toIndex < 0 || toIndex >= prev.length
        ) return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    [],
  );

  /**
   * Copy a semester from the active scenario into another scenario.
   * Skips any slots whose course is already planned in the target plan to
   * avoid duplicating a course across two semesters in the same plan.
   */
  const copySemesterToScenario = useCallback(
    (semesterId: string, targetScenarioId: string) => {
      if (targetScenarioId === activeScenarioId) return;
      const sourceSem = semesters.find((s) => s.id === semesterId);
      const targetScenario = scenarios.find((s) => s.id === targetScenarioId);
      if (!sourceSem || !targetScenario) return;

      const targetPlannedSlots = new Set<string>();
      for (const sem of targetScenario.semesters) {
        for (const slot of sem.slots) targetPlannedSlots.add(slot.slotId);
      }

      const newSem: PlannerSemester = {
        id: `sem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: sourceSem.name,
        term: sourceSem.term,
        slots: sourceSem.slots.filter((s) => !targetPlannedSlots.has(s.slotId)),
      };

      setScenarios((prev) =>
        prev.map((sc) =>
          sc.id === targetScenarioId
            ? { ...sc, semesters: [...sc.semesters, newSem] }
            : sc,
        ),
      );
    },
    [activeScenarioId, semesters, scenarios],
  );

  const moveSemesterToScenario = useCallback(
    (semesterId: string, targetScenarioId: string) => {
      if (targetScenarioId === activeScenarioId) return;
      copySemesterToScenario(semesterId, targetScenarioId);
      setSemesters((prev) => {
        const next = prev.filter((s) => s.id !== semesterId);
        const final = next.length > 0 ? next : defaultSemesters();
        if (activeSemesterId === semesterId) {
          setActiveSemesterId(final[0].id);
        }
        return final;
      });
    },
    [activeScenarioId, activeSemesterId, copySemesterToScenario, setSemesters],
  );

  // ── Semester handlers ────────────────────────────────────────────────────────
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

  const setSlotCustomName = useCallback(
    (semesterId: string, slotId: string, name: string) => {
      const trimmed = name.trim();
      setSemesters((prev) =>
        prev.map((sem) => {
          if (sem.id !== semesterId) return sem;
          return {
            ...sem,
            slots: sem.slots.map((s) =>
              s.slotId === slotId
                ? trimmed
                  ? { ...s, customName: trimmed }
                  : (({ customName: _drop, ...rest }) => rest)(s)
                : s,
            ),
          };
        }),
      );
    },
    [setSemesters],
  );

  const reorderSemesters = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setSemesters((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleActiveSemesterChange = useCallback(
    (id: string) => {
      setActiveSemesterId(id);
      if (isMobile) setMobilePlannerOpen(false);
    },
    [isMobile],
  );

  const activeSemester = semesters.find((s) => s.id === activeSemesterId);

  const addSemester = () => {
    const n = semesters.length + 1;
    const sem = newSemester(`Semester ${n}`);
    setSemesters((prev) => [...prev, sem]);
    setActiveSemesterId(sem.id);
  };

  const removeSemester = (id: string) => {
    setSemesters((prev) => {
      const next = prev.filter((s) => s.id !== id);
      const final = next.length > 0 ? next : defaultSemesters();
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
        <ScenarioTabs
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onSwitchScenario={switchScenario}
          onAddScenario={addScenario}
          onRemoveScenario={removeScenario}
          onRenameScenario={renameScenario}
          onReorderScenarios={reorderScenarios}
        />
      </header>

      {isMobile && (
        <div className="mobile-toolbar">
          <div className="mobile-active-sem-wrap">
            <button
              type="button"
              className="mobile-active-sem"
              onClick={() => setMobileSemPickerOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={mobileSemPickerOpen}
            >
              <span className="mobile-active-sem-prefix">Adding to:</span>
              <span className="mobile-active-sem-name">
                {activeSemester?.name ?? "—"}
              </span>
              <span className="mobile-active-sem-caret" aria-hidden>
                ▾
              </span>
            </button>
            {mobileSemPickerOpen && (
              <>
                <button
                  type="button"
                  className="mobile-sem-picker-scrim"
                  aria-label="Close semester picker"
                  onClick={() => setMobileSemPickerOpen(false)}
                />
                <div className="mobile-sem-picker" role="menu">
                  {semesters.map((sem) => (
                    <button
                      key={sem.id}
                      type="button"
                      role="menuitem"
                      className={`mobile-sem-picker-item${sem.id === activeSemesterId ? " mobile-sem-picker-item--active" : ""}`}
                      onClick={() => {
                        setActiveSemesterId(sem.id);
                        setMobileSemPickerOpen(false);
                      }}
                    >
                      <span className="mobile-sem-picker-item-name">
                        {sem.name}
                      </span>
                      <span className="mobile-sem-picker-item-count">
                        {sem.slots.length} course{sem.slots.length === 1 ? "" : "s"}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            className={`mobile-toggle${mobilePlannerOpen ? " mobile-toggle--active" : ""}`}
            onClick={() => {
              setMobilePlannerOpen((v) => !v);
              setMobileElectivesOpen(false);
            }}
            aria-pressed={mobilePlannerOpen}
          >
            Plan
          </button>
          <button
            type="button"
            className={`mobile-toggle${mobileElectivesOpen ? " mobile-toggle--active" : ""}`}
            onClick={() => {
              setMobileElectivesOpen((v) => !v);
              setMobilePlannerOpen(false);
            }}
            aria-pressed={mobileElectivesOpen}
          >
            Elec
          </button>
        </div>
      )}

      <main
        className={`app-main${mobilePlannerOpen ? " app-main--planner-open" : ""}${mobileElectivesOpen ? " app-main--electives-open" : ""}`}
      >
        {isMobile && (mobilePlannerOpen || mobileElectivesOpen) && (
          <button
            type="button"
            className="mobile-drawer-scrim"
            aria-label="Close panel"
            onClick={() => {
              setMobilePlannerOpen(false);
              setMobileElectivesOpen(false);
            }}
          />
        )}
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
              onActiveChange={handleActiveSemesterChange}
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
              onRedo={redoSemesters}
              canRedo={canRedo}
              otherScenarios={scenarios.filter((s) => s.id !== activeScenarioId)}
              onCopySemesterToScenario={copySemesterToScenario}
              onMoveSemesterToScenario={moveSemesterToScenario}
              onSetSlotCustomName={setSlotCustomName}
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
