import { useCallback, useEffect, useRef, useState } from "react";
import type { PlanScenario } from "../types";

interface ScenarioTabsProps {
  scenarios: PlanScenario[];
  activeScenarioId: string;
  onSwitchScenario: (id: string) => void;
  onAddScenario: () => void;
  onRemoveScenario: (id: string) => void;
  onRenameScenario: (id: string, name: string) => void;
  onReorderScenarios: (fromIndex: number, toIndex: number) => void;
}

export function ScenarioTabs({
  scenarios,
  activeScenarioId,
  onSwitchScenario,
  onAddScenario,
  onRemoveScenario,
  onRenameScenario,
  onReorderScenarios,
}: ScenarioTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Desktop HTML5 drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Mobile long-press touch-drag state
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const [touchDropIndex, setTouchDropIndex] = useState<number | null>(null);
  const touchDragActiveRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleDocTouchMove = useCallback((e: TouchEvent) => {
    if (!touchDragActiveRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;
    const tabEl = el.closest<HTMLElement>("[data-scenario-index]");
    if (tabEl) {
      const idx = parseInt(tabEl.dataset.scenarioIndex ?? "", 10);
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
    const target = e.target as HTMLElement;
    // Don't start drag from interactive controls
    if (target.closest("button.scenario-tab-close, button.scenario-tab-edit, input"))
      return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    longPressTimerRef.current = setTimeout(() => {
      touchDragActiveRef.current = true;
      (document.activeElement as HTMLElement | null)?.blur();
      if (navigator.vibrate) navigator.vibrate(40);
      setTouchDragIndex(index);
      setTouchDropIndex(index);
    }, 450);
  };

  const handleTouchMovePre = (e: React.TouchEvent) => {
    if (touchDragActiveRef.current) return;
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
      onReorderScenarios(touchDragIndex, touchDropIndex);
    }
    touchDragActiveRef.current = false;
    setTouchDragIndex(null);
    setTouchDropIndex(null);
    touchStartPosRef.current = null;
  };

  return (
    <div
      className="scenario-tabs scenario-tabs--top"
      role="tablist"
      aria-label="Plan scenarios"
    >
      {scenarios.map((sc, index) => {
        const isActive = sc.id === activeScenarioId;
        const isEditing = editingId === sc.id;
        const isDragging =
          dragIndex === index || touchDragIndex === index;
        const isDropTarget =
          (dropIndex === index && dragIndex !== null && dragIndex !== index) ||
          (touchDropIndex === index &&
            touchDragIndex !== null &&
            touchDragIndex !== index);
        return (
          <div
            key={sc.id}
            data-scenario-index={index}
            className={`scenario-tab${isActive ? " scenario-tab--active" : ""}${isDragging ? " scenario-tab--dragging" : ""}${isDropTarget ? " scenario-tab--drop-target" : ""}`}
            role="tab"
            aria-selected={isActive}
            draggable={!isEditing}
            onDragStart={(e) => {
              if (isEditing) {
                e.preventDefault();
                return;
              }
              const t = e.target as HTMLElement;
              if (t.closest("button, input")) {
                e.preventDefault();
                return;
              }
              setDragIndex(index);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              if (dragIndex === null) return;
              e.preventDefault();
              setDropIndex(index);
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              if (dragIndex !== null && dragIndex !== index) {
                e.preventDefault();
                onReorderScenarios(dragIndex, index);
              }
              setDragIndex(null);
              setDropIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setDropIndex(null);
            }}
            onTouchStart={(e) => handleTouchStart(index, e)}
            onTouchMove={handleTouchMovePre}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {isEditing ? (
              <input
                className="scenario-tab-input"
                defaultValue={sc.name}
                autoFocus
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v) onRenameScenario(sc.id, v);
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") setEditingId(null);
                  e.stopPropagation();
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <button
                type="button"
                className="scenario-tab-label"
                onClick={() => onSwitchScenario(sc.id)}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  setEditingId(sc.id);
                }}
                title={
                  isActive
                    ? "Double-click to rename · drag to reorder"
                    : "Click to switch · drag to reorder"
                }
              >
                {sc.name}
              </button>
            )}
            {!isEditing && (
              <button
                type="button"
                className="scenario-tab-edit"
                aria-label={`Rename ${sc.name}`}
                title="Rename plan"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(sc.id);
                }}
              >
                ✎
              </button>
            )}
            {scenarios.length > 1 && (
              <button
                type="button"
                className="scenario-tab-close"
                aria-label={`Remove ${sc.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveScenario(sc.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        );
      })}
      <button
        type="button"
        className="scenario-tab-add"
        onClick={onAddScenario}
        title="Create new graduation plan"
      >
        <span className="scenario-tab-add-icon" aria-hidden>
          +
        </span>
        <span className="scenario-tab-add-text">New plan</span>
      </button>
    </div>
  );
}
