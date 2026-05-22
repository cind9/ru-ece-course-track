import { useCallback, useEffect, useMemo, useState } from "react";
import { Flowchart } from "./components/Flowchart";
import type { PendingOverride } from "./components/CourseSlot";
import { ElectivesPanel } from "./components/ElectivesPanel";
import { PlannerPanel } from "./components/PlannerPanel";
import { ResizablePanel } from "./components/ResizablePanel";
import type { PlannerSemester, Term } from "./types";
import {
  allChosenIds,
  allPlannedSlotIds,
  completedIdsFromSlots,
  formatPrereqError,
  getUnmetPrereqs,
  isSlotOverridden,
  plannedSlotIdSet,
} from "./utils/planner";
import "./App.css";

function newSemester(name: string, term: Term = "fall"): PlannerSemester {
  return {
    id: `sem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    term,
    slots: [],
  };
}

function App() {
  const [semesters, setSemesters] = useState<PlannerSemester[]>([
    newSemester("Fall 2025", "fall"),
    newSemester("Spring 2026", "spring"),
    newSemester("Fall 2026", "fall"),
  ]);
  const [activeSemesterId, setActiveSemesterId] = useState(semesters[0].id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [availableTerm, setAvailableTerm] = useState<Term>("fall");
  const [pendingOverride, setPendingOverride] =
    useState<PendingOverride | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [plannerWidth, setPlannerWidth] = useState(300);
  const [electivesHeight, setElectivesHeight] = useState(200);
  const [viewportHeight, setViewportHeight] = useState(
    () => (typeof window !== "undefined" ? window.innerHeight : 800),
  );

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const electivesMaxHeight = useMemo(
    () => Math.round(viewportHeight * 0.72),
    [viewportHeight],
  );

  useEffect(() => {
    setElectivesHeight((h) => Math.min(h, electivesMaxHeight));
  }, [electivesMaxHeight]);

  const plannedSlotIds = useMemo(
    () => plannedSlotIdSet(semesters),
    [semesters],
  );
  const activePlannedSlotIds = useMemo(() => {
    const active = semesters.find((s) => s.id === activeSemesterId);
    return new Set(active?.slots.map((s) => s.slotId) ?? []);
  }, [semesters, activeSemesterId]);
  const completedIds = useMemo(
    () => completedIdsFromSlots(semesters),
    [semesters],
  );
  const chosenIdsList = useMemo(() => allChosenIds(semesters), [semesters]);

  const overriddenSlotIds = useMemo(() => {
    const ids = new Set<string>();
    for (const slotId of allPlannedSlotIds(semesters)) {
      if (isSlotOverridden(semesters, slotId)) ids.add(slotId);
    }
    return ids;
  }, [semesters]);

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

      const missing = getUnmetPrereqs(chosenId, completedIds);
      if (missing.length === 0) {
        addSlotToActiveSemester(slotId, chosenId, false);
        return;
      }

      setAddError(formatPrereqError(missing));
      setPendingOverride({ slotId, chosenId });
    },
    [
      semesters,
      activeSemesterId,
      completedIds,
      addSlotToActiveSemester,
      removeSlotFromActiveSemester,
      plannedSlotIds,
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
        next.length > 0 ? next : [newSemester("Fall 2025", "fall")];
      if (activeSemesterId === id) {
        setActiveSemesterId(final[0].id);
      }
      return final;
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Rutgers CE Degree Planner</h1>
        <p className="subtitle">
          Computer Engineering — 4-year flowchart and semester planning
        </p>
      </header>

      <main className="app-main">
        <div className="app-main-center">
          <Flowchart
            hoveredId={hoveredId}
            plannedSlotIds={plannedSlotIds}
            activePlannedSlotIds={activePlannedSlotIds}
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
            minSize={240}
            maxSize={560}
            onSizeChange={setPlannerWidth}
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
        >
          <ElectivesPanel />
        </ResizablePanel>
      </main>
    </div>
  );
}

export default App;
