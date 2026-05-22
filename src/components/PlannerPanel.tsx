import { useState } from "react";
import { useAutoHideScrollbar } from "../hooks/useAutoHideScrollbar";
import { courseMap } from "../data/courses";
import type { PlannerSemester, Term } from "../types";
import {
  ECE_RESIDENCY_REQUIRED,
  getAvailableCourses,
  sumCredits,
} from "../utils/planner";

interface PlannerPanelProps {
  semesters: PlannerSemester[];
  activeSemesterId: string;
  onActiveChange: (id: string) => void;
  onAddSemester: () => void;
  onRemoveSemester: (id: string) => void;
  onRenameSemester: (id: string, name: string) => void;
  onRemoveSlotFromSemester: (semesterId: string, slotId: string) => void;
  onReorderSemesters: (fromIndex: number, toIndex: number) => void;
  availableTerm: Term;
  onAvailableTermChange: (term: Term) => void;
  allChosenIds: string[];
  plannedSlotIds: Set<string>;
}

export function PlannerPanel({
  semesters,
  activeSemesterId,
  onActiveChange,
  onAddSemester,
  onRemoveSemester,
  onRenameSemester,
  onRemoveSlotFromSemester,
  onReorderSemesters,
  availableTerm,
  onAvailableTermChange,
  allChosenIds,
  plannedSlotIds,
}: PlannerPanelProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const panelScrollRef = useAutoHideScrollbar<HTMLElement>();

  const globalTotals = sumCredits(allChosenIds);
  const available = getAvailableCourses(
    new Set(allChosenIds),
    plannedSlotIds,
    availableTerm,
  );

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDropIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      onReorderSemesters(dragIndex, index);
    }
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const isDragHandleTarget = (target: EventTarget) => {
    const el = target as HTMLElement;
    return Boolean(el.closest("input, button, .btn-icon"));
  };

  return (
    <aside ref={panelScrollRef} className="planner-panel auto-hide-scrollbar">
      <header className="planner-header">
        <div>
          <h2>Semester planner</h2>
        </div>
        <button type="button" className="btn-primary" onClick={onAddSemester}>
          + Add semester
        </button>
      </header>

      <p className="planner-help">
        Drag a semester box to reorder. Select one, then click courses on the
        chart.
      </p>

      <div className="semester-boxes">
        {semesters.map((sem, index) => {
          const isActive = sem.id === activeSemesterId;
          const chosen = sem.slots.map((s) => s.chosenId);
          const boxTotals = sumCredits(chosen);
          const isDragging = dragIndex === index;
          const isDropTarget =
            dropIndex === index && dragIndex !== null && dragIndex !== index;

          return (
            <div
              key={sem.id}
              className={`semester-box ${isActive ? "active" : ""} ${isDragging ? "dragging" : ""} ${isDropTarget ? "drop-target" : ""}`}
              draggable
              onDragStart={(e) => {
                if (isDragHandleTarget(e.target)) {
                  e.preventDefault();
                  return;
                }
                handleDragStart(index);
              }}
              onClick={() => onActiveChange(sem.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") onActiveChange(sem.id);
              }}
            >
              <div className="semester-box-header">
                <span
                  className="drag-handle"
                  aria-hidden
                  title="Drag anywhere on this box to reorder"
                >
                  ⠿
                </span>
                <input
                  className="semester-name-input"
                  value={sem.name}
                  onChange={(e) => onRenameSemester(sem.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                {semesters.length > 1 && (
                  <button
                    type="button"
                    className="btn-icon"
                    title="Remove semester"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSemester(sem.id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              <ul className="planned-course-list">
                {sem.slots.length === 0 ? (
                  <li className="empty-hint">Click courses to add here</li>
                ) : (
                  sem.slots.map((sl) => {
                    const c = courseMap[sl.chosenId];
                    if (!c) return null;
                    return (
                      <li key={sl.slotId}>
                        <span className="planned-course-text">
                          <strong className="planned-course-title">
                            {c.title}
                          </strong>
                          <span className="planned-course-meta">
                            {c.label} · {c.credits} credits
                            {sl.overridden ? " · advisor override" : ""}
                            {c.residencyCredits > 0 && (
                              <span className="planner-residency-tag">
                                {c.residencyCredits} ECE residency credit
                                {c.residencyCredits === 1 ? "" : "s"}
                              </span>
                            )}
                          </span>
                        </span>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveSlotFromSemester(sem.id, sl.slotId);
                          }}
                        >
                          ×
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
              <div className="box-totals">
                <span>{boxTotals.credits} total credits this semester</span>
                {boxTotals.residency > 0 && (
                  <span className="residency-total-line">
                    <span className="planner-residency-tag">
                      {boxTotals.residency} ECE residency credit
                      {boxTotals.residency === 1 ? "" : "s"} this semester
                    </span>
                    {boxTotals.residency >= ECE_RESIDENCY_REQUIRED && (
                      <span className="residency-met"> · requirement met</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="global-totals">
        <h3>All planned courses</h3>
        <p>
          <strong>{globalTotals.credits}</strong> total credits
        </p>
        <p className="global-residency">
          <span className="planner-residency-tag">ECE residency</span>{" "}
          <strong className="residency-count">{globalTotals.residency}</strong> of{" "}
          <strong className="residency-count">{ECE_RESIDENCY_REQUIRED}</strong>{" "}
          credits required
          {globalTotals.residency >= ECE_RESIDENCY_REQUIRED ? (
            <span className="residency-met-badge">Requirement met</span>
          ) : (
            <span className="residency-remaining">
              ({ECE_RESIDENCY_REQUIRED - globalTotals.residency} credits still
              needed)
            </span>
          )}
        </p>
      </div>

      <div className="available-section">
        <h3>Courses you can take next</h3>
        <label className="term-filter">
          For term:
          <select
            value={availableTerm}
            onChange={(e) =>
              onAvailableTermChange(e.target.value as Term)
            }
          >
            <option value="fall">Fall</option>
            <option value="spring">Spring</option>
          </select>
        </label>
        {available.length === 0 ? (
          <p className="empty-hint">
            Complete more prerequisites, or all eligible courses are already
            planned.
          </p>
        ) : (
          <ul className="available-list">
            {available.map((c) => (
              <li key={c.id}>
                <strong className="available-course-title">{c.title}</strong>
                <span className="available-course-meta">
                  {c.label} · {c.credits} credits
                  {c.offered !== "both" &&
                    ` · offered ${c.offered === "fall" ? "fall" : "spring"} only`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
