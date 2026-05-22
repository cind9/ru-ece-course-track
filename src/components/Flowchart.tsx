import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAutoHideScrollbar } from "../hooks/useAutoHideScrollbar";
import {
  edgeKey,
  getHighlightedEdgeKeys,
  getUnlockCourseIds,
  getPrereqEdges,
  groupCoursesByRow,
} from "../data/courses";
import { CourseSlot, type PendingOverride } from "./CourseSlot";

const YEARS = [1, 2, 3, 4] as const;
const TERMS = ["fall", "spring"] as const;

export interface DrawnEdge {
  key: string;
  from: string;
  to: string;
  d: string;
}

interface FlowchartProps {
  hoveredId: string | null;
  plannedSlotIds: Set<string>;
  activePlannedSlotIds: Set<string>;
  overriddenSlotIds: Set<string>;
  completedIds: Set<string>;
  pendingOverride: PendingOverride | null;
  addError: string | null;
  onHover: (id: string | null) => void;
  onRequestSlot: (slotId: string, chosenId: string) => void;
  onConfirmOverride: () => void;
  onCancelOverride: () => void;
}

function getSlotAnchor(
  slotEl: HTMLElement,
  container: HTMLElement,
  side: "left" | "right",
): { x: number; y: number } {
  const er = slotEl.getBoundingClientRect();
  const cr = container.getBoundingClientRect();
  return {
    x:
      side === "right"
        ? er.right - cr.left - 1
        : er.left - cr.left + 1,
    y: er.top + er.height / 2 - cr.top,
  };
}

function buildStraightPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

export function Flowchart({
  hoveredId,
  plannedSlotIds,
  activePlannedSlotIds,
  overriddenSlotIds,
  completedIds,
  pendingOverride,
  addError,
  onHover,
  onRequestSlot,
  onConfirmOverride,
  onCancelOverride,
}: FlowchartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useAutoHideScrollbar<HTMLDivElement>();
  const [edges, setEdges] = useState<DrawnEdge[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const highlightedEdgeKeys = getHighlightedEdgeKeys(hoveredId);
  const unlockCourseIds = useMemo(
    () => getUnlockCourseIds(hoveredId),
    [hoveredId],
  );

  const drawArrows = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.offsetWidth;
    const h = container.offsetHeight;
    setSvgSize({ w, h });

    const drawn: DrawnEdge[] = [];
    for (const { from, to } of getPrereqEdges()) {
      const fromEl = container.querySelector(
        `[data-slot-id="${from}"]`,
      ) as HTMLElement | null;
      const toEl = container.querySelector(
        `[data-slot-id="${to}"]`,
      ) as HTMLElement | null;
      if (!fromEl || !toEl) continue;

      const start = getSlotAnchor(fromEl, container, "right");
      const end = getSlotAnchor(toEl, container, "left");
      if (end.x <= start.x) continue;

      drawn.push({
        key: edgeKey(from, to),
        from,
        to,
        d: buildStraightPath(start, end),
      });
    }
    setEdges(drawn);
  }, []);

  useEffect(() => {
    drawArrows();
    const container = containerRef.current;
    const scrollEl = scrollRef.current;
    if (!container) return;

    const onResize = () => drawArrows();
    const ro = new ResizeObserver(onResize);
    ro.observe(container);
    scrollEl?.addEventListener("scroll", onResize, { passive: true });
    window.addEventListener("resize", onResize);
    const timers = [50, 300, 800].map((ms) => setTimeout(drawArrows, ms));

    return () => {
      ro.disconnect();
      scrollEl?.removeEventListener("scroll", onResize);
      window.removeEventListener("resize", onResize);
      timers.forEach(clearTimeout);
    };
  }, [drawArrows]);

  const renderColumn = (year: number, term: "fall" | "spring") => {
    const rows = groupCoursesByRow(year, term);
    return (
      <div className="semester-column" key={`${year}-${term}`}>
        <div className="semester-label">
          {term === "fall" ? "Fall" : "Spring"}
        </div>
        <div className="semester-courses">
          {rows.map(({ primary, alternatives }) => (
            <CourseSlot
              key={primary.id}
              primary={primary}
              alternatives={alternatives}
              hoveredId={hoveredId}
              unlockHighlightIds={unlockCourseIds}
              slotPlanned={plannedSlotIds.has(primary.id)}
              removableFromActive={activePlannedSlotIds.has(primary.id)}
              slotOverridden={overriddenSlotIds.has(primary.id)}
              completedIds={completedIds}
              pendingOverride={pendingOverride}
              onHover={onHover}
              onRequestSlot={onRequestSlot}
              onConfirmOverride={onConfirmOverride}
              onCancelOverride={onCancelOverride}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flowchart-wrapper">
      <div className="flowchart-legend">
        <span className="legend-item">
          <span className="swatch non-ece" /> Non-ECE / alternative
        </span>
        <span className="legend-item">
          <span className="swatch ece" /> ECE
        </span>
        <span className="legend-item">
          <span className="swatch elective" /> Elective
        </span>
        <span className="legend-hint">
          Hover: orange arrows = prereqs & next courses; orange outline = next only.
        </span>
      </div>

      {addError && <p className="planner-error-banner">{addError}</p>}

      <div
        className="flowchart-scroll auto-hide-scrollbar"
        ref={scrollRef}
      >
        <div className="year-headers">
          {YEARS.map((y) => (
            <div key={y} className="year-header">
              Year {y}
            </div>
          ))}
        </div>
        <div className="flowchart-grid" ref={containerRef}>
          <svg
            className="arrow-layer"
            width={svgSize.w}
            height={svgSize.h}
            viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
            aria-hidden
          >
            <defs>
              <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
              </marker>
              <marker
                id="arrowhead-active"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
              </marker>
            </defs>
            {edges.map((edge) => {
              const active = highlightedEdgeKeys.has(edge.key);
              return (
                <path
                  key={edge.key}
                  d={edge.d}
                  className={`prereq-arrow ${active ? "active" : ""}`}
                  markerEnd={
                    active
                      ? "url(#arrowhead-active)"
                      : "url(#arrowhead)"
                  }
                />
              );
            })}
          </svg>
          {YEARS.map((year) => (
            <div key={year} className="year-column">
              {TERMS.map((term) => renderColumn(year, term))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
