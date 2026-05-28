import { useState } from "react";
import type { PlanScenario } from "../types";

interface ScenarioTabsProps {
  scenarios: PlanScenario[];
  activeScenarioId: string;
  onSwitchScenario: (id: string) => void;
  onAddScenario: () => void;
  onRemoveScenario: (id: string) => void;
  onRenameScenario: (id: string, name: string) => void;
}

export function ScenarioTabs({
  scenarios,
  activeScenarioId,
  onSwitchScenario,
  onAddScenario,
  onRemoveScenario,
  onRenameScenario,
}: ScenarioTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div
      className="scenario-tabs scenario-tabs--top"
      role="tablist"
      aria-label="Plan scenarios"
    >
      {scenarios.map((sc) => {
        const isActive = sc.id === activeScenarioId;
        const isEditing = editingId === sc.id;
        return (
          <div
            key={sc.id}
            className={`scenario-tab${isActive ? " scenario-tab--active" : ""}`}
            role="tab"
            aria-selected={isActive}
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
                    ? "Double-click to rename"
                    : "Click to switch · double-click to rename"
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
