import { useState, useRef, useEffect, useCallback } from "react";
import { useAutoHideScrollbar } from "../hooks/useAutoHideScrollbar";
import { useTrackContext } from "../context/TrackContext";
import type { PlannerSemester, PlanScenario, Term } from "../types";

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
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  otherScenarios: PlanScenario[];
  onCopySemesterToScenario: (semesterId: string, targetScenarioId: string) => void;
  onMoveSemesterToScenario: (semesterId: string, targetScenarioId: string) => void;
  onSetSlotCustomName: (semesterId: string, slotId: string, name: string) => void;
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
  onUndo,
  canUndo,
  onRedo,
  canRedo,
  otherScenarios,
  onCopySemesterToScenario,
  onMoveSemesterToScenario,
  onSetSlotCustomName,
}: PlannerPanelProps) {
  const [openMenuSemId, setOpenMenuSemId] = useState<string | null>(null);
  const [editingSlotKey, setEditingSlotKey] = useState<string | null>(null);
  const { planner } = useTrackContext();
  const { courseMap } = useTrackContext().track.catalog;
  const residencyRequired = planner.residencyRequired;

  // Desktop drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Touch / long-press drag state
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const [touchDropIndex, setTouchDropIndex] = useState<number | null>(null);
  const touchDragActiveRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const panelScrollRef = useAutoHideScrollbar<HTMLElement>();

  const globalTotals = planner.sumCredits(allChosenIds);
  const available = planner.getAvailableCourses(
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

  // Non-passive touchmove listener attached to document while touch-drag is active,
  // so we can call preventDefault() to suppress scroll during drag.
  const handleDocTouchMove = useCallback((e: TouchEvent) => {
    if (!touchDragActiveRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;
    const boxEl = el.closest<HTMLElement>("[data-sem-index]");
    if (boxEl) {
      const idx = parseInt(boxEl.dataset.semIndex ?? "", 10);
      if (!isNaN(idx)) setTouchDropIndex(idx);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("touchmove", handleDocTouchMove, {
      passive: false,
    });
    return () =>
      document.removeEventListener("touchmove", handleDocTouchMove);
  }, [handleDocTouchMove]);

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    // Don't interfere with taps on the ×-remove button
    if ((e.target as HTMLElement).closest(".btn-icon")) return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

    longPressTimerRef.current = setTimeout(() => {
      touchDragActiveRef.current = true;
      // Blur any focused input so the keyboard closes during drag
      (document.activeElement as HTMLElement | null)?.blur();
      if (navigator.vibrate) navigator.vibrate(40);
      setTouchDragIndex(index);
      setTouchDropIndex(index);
    }, 450);
  };

  const handleTouchMovePre = (e: React.TouchEvent) => {
    if (touchDragActiveRef.current) return; // handled by document listener
    if (!touchStartPosRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPosRef.current.x;
    const dy = touch.clientY - touchStartPosRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 8) cancelLongPress();
  };

  const handleTouchEnd = () => {
    cancelLongPress();
    if (
      touchDragActiveRef.current &&
      touchDragIndex !== null &&
      touchDropIndex !== null &&
      touchDragIndex !== touchDropIndex
    ) {
      onReorderSemesters(touchDragIndex, touchDropIndex);
    }
    touchDragActiveRef.current = false;
    setTouchDragIndex(null);
    setTouchDropIndex(null);
    touchStartPosRef.current = null;
  };

  return (
    <aside ref={panelScrollRef} className="planner-panel auto-hide-scrollbar">
      <header className="planner-header">
        <div>
          <h2>Semester planner</h2>
        </div>
        <div className="planner-header-actions">
          <button
            type="button"
            className="btn-icon-undo"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl/Cmd+Z)"
            aria-label="Undo"
          >
            ↩
          </button>
          <button
            type="button"
            className="btn-icon-undo"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl/Cmd+Shift+Z)"
            aria-label="Redo"
            style={{ transform: "scaleX(-1)" }}
          >
            ↩
          </button>
          <button type="button" className="btn-primary" onClick={onAddSemester}>
            + Add semester
          </button>
        </div>
      </header>

      <p className="planner-help">
        Drag a semester box to reorder (long-press on mobile). Select one, then
        click courses on the chart.
      </p>

      <div className="semester-boxes">
        {semesters.map((sem, index) => {
          const isActive = sem.id === activeSemesterId;
          const chosen = sem.slots.map((s) => s.chosenId);
          const boxTotals = planner.sumCredits(chosen);
          const isDragging =
            dragIndex === index || touchDragIndex === index;
          const isDropTarget =
            (dropIndex === index && dragIndex !== null && dragIndex !== index) ||
            (touchDropIndex === index &&
              touchDragIndex !== null &&
              touchDragIndex !== index);

          return (
            <div
              key={sem.id}
              data-sem-index={index}
              className={`semester-box ${isActive ? "active" : ""} ${isDragging ? "dragging" : ""} ${isDropTarget ? "drop-target" : ""} ${touchDragIndex === index ? "touch-dragging" : ""}`}
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
              onTouchStart={(e) => handleTouchStart(index, e)}
              onTouchMove={handleTouchMovePre}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              onContextMenu={(e) => e.preventDefault()}
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
                {otherScenarios.length > 0 && (
                  <div className="sem-menu-wrap">
                    <button
                      type="button"
                      className="btn-icon"
                      title="Copy or move to another plan"
                      aria-haspopup="menu"
                      aria-expanded={openMenuSemId === sem.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuSemId((cur) =>
                          cur === sem.id ? null : sem.id,
                        );
                      }}
                    >
                      ⋯
                    </button>
                    {openMenuSemId === sem.id && (
                      <>
                        <button
                          type="button"
                          className="sem-menu-scrim"
                          aria-label="Close menu"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuSemId(null);
                          }}
                        />
                        <div
                          className="sem-menu"
                          role="menu"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="sem-menu-section">
                            <p className="sem-menu-label">Copy to plan</p>
                            {otherScenarios.map((sc) => (
                              <button
                                key={`copy-${sc.id}`}
                                type="button"
                                role="menuitem"
                                className="sem-menu-item"
                                onClick={() => {
                                  onCopySemesterToScenario(sem.id, sc.id);
                                  setOpenMenuSemId(null);
                                }}
                              >
                                {sc.name}
                              </button>
                            ))}
                          </div>
                          <div className="sem-menu-section">
                            <p className="sem-menu-label">Move to plan</p>
                            {otherScenarios.map((sc) => (
                              <button
                                key={`move-${sc.id}`}
                                type="button"
                                role="menuitem"
                                className="sem-menu-item"
                                onClick={() => {
                                  onMoveSemesterToScenario(sem.id, sc.id);
                                  setOpenMenuSemId(null);
                                }}
                              >
                                {sc.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
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
                    const isElective = c.category === "elective";
                    const slotKey = `${sem.id}:${sl.slotId}`;
                    const isEditingName = editingSlotKey === slotKey;
                    const displayTitle = sl.customName || c.title;
                    return (
                      <li key={sl.slotId}>
                        <span className="planned-course-text">
                          {isEditingName ? (
                            <input
                              className="planned-course-name-input"
                              defaultValue={sl.customName ?? ""}
                              placeholder={c.title}
                              autoFocus
                              maxLength={80}
                              onClick={(e) => e.stopPropagation()}
                              onBlur={(e) => {
                                onSetSlotCustomName(
                                  sem.id,
                                  sl.slotId,
                                  e.target.value,
                                );
                                setEditingSlotKey(null);
                              }}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === "Enter")
                                  (e.target as HTMLInputElement).blur();
                                if (e.key === "Escape")
                                  setEditingSlotKey(null);
                              }}
                            />
                          ) : (
                            <strong
                              className={`planned-course-title${sl.customName ? " planned-course-title--custom" : ""}`}
                              title={
                                sl.customName
                                  ? `Filling: ${c.title}`
                                  : c.title
                              }
                            >
                              {displayTitle}
                            </strong>
                          )}
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
                        {isElective && !isEditingName && (
                          <button
                            type="button"
                            className="btn-icon btn-icon--name"
                            title={
                              sl.customName
                                ? "Edit custom name"
                                : "Name this elective"
                            }
                            aria-label="Edit elective name"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSlotKey(slotKey);
                            }}
                          >
                            ✎
                          </button>
                        )}
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
                    {boxTotals.residency >= residencyRequired && (
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
          <strong className="residency-count">{residencyRequired}</strong>{" "}
          credits required
          {globalTotals.residency >= residencyRequired ? (
            <span className="residency-met-badge">Requirement met</span>
          ) : (
            <span className="residency-remaining">
              ({residencyRequired - globalTotals.residency} credits still
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
