import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Course } from "../types";
import { getUnmetPrereqs } from "../utils/planner";

export interface PendingOverride {
  slotId: string;
  chosenId: string;
}

interface CourseSlotProps {
  primary: Course;
  alternatives: Course[];
  hoveredId: string | null;
  unlockHighlightIds: Set<string>;
  slotPlanned: boolean;
  /** Planned in the active semester — click removes; otherwise locked. */
  removableFromActive: boolean;
  slotOverridden: boolean;
  completedIds: Set<string>;
  pendingOverride: PendingOverride | null;
  onHover: (id: string | null) => void;
  onRequestSlot: (slotId: string, chosenId: string) => void;
  onConfirmOverride: () => void;
  onCancelOverride: () => void;
}

export function CourseSlot({
  primary,
  alternatives,
  hoveredId,
  unlockHighlightIds,
  slotPlanned,
  removableFromActive,
  slotOverridden,
  completedIds,
  pendingOverride,
  onHover,
  onRequestSlot,
  onConfirmOverride,
  onCancelOverride,
}: CourseSlotProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(
    null,
  );

  const halves = [primary, ...alternatives];
  const slotId = primary.id;
  const showOverridePopup =
    pendingOverride?.slotId === slotId && pendingOverride !== null;

  const missingForPending = showOverridePopup
    ? getUnmetPrereqs(pendingOverride.chosenId, completedIds)
    : [];

  useLayoutEffect(() => {
    if (!showOverridePopup || !slotRef.current) {
      setPopupPos(null);
      return;
    }

    const place = () => {
      const rect = slotRef.current!.getBoundingClientRect();
      setPopupPos({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    };

    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [showOverridePopup, pendingOverride?.chosenId]);

  const slotHasHover =
    hoveredId !== null && halves.some((c) => c.id === hoveredId);

  const popup =
    showOverridePopup && popupPos
      ? createPortal(
          <div
            className="override-popup override-popup--portal"
            style={{
              position: "fixed",
              top: popupPos.top,
              left: popupPos.left,
              transform: "translate(-50%, calc(-100% - 8px))",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Prerequisite override"
          >
            <p className="override-popup-title">Prerequisites not met</p>
            <p className="override-popup-missing">
              {missingForPending.map((c) => c.label).join(", ")} required
            </p>
            <p className="override-popup-question">Do you have an override?</p>
            <div className="override-popup-actions">
              <button
                type="button"
                className="btn-override-yes"
                onClick={onConfirmOverride}
              >
                Yes, add anyway
              </button>
              <button
                type="button"
                className="btn-override-no"
                onClick={onCancelOverride}
              >
                Cancel
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        ref={slotRef}
        className={`course-slot ${slotPlanned ? "planned" : ""} ${slotOverridden ? "overridden" : ""} ${halves.length > 1 ? "split" : ""} ${slotHasHover ? "slot-has-hover" : ""} ${showOverridePopup ? "has-prereq-popup" : ""}`}
        data-slot-id={slotId}
        onMouseLeave={() => onHover(null)}
      >
        {halves.map((course) => {
          const notReady =
            !slotPlanned &&
            getUnmetPrereqs(course.id, completedIds).length > 0;
          const isHovered = hoveredId === course.id;
          const isSiblingDim =
            halves.length > 1 && slotHasHover && !isHovered;
          const plannedLocked = slotPlanned && !removableFromActive;
          return (
            <button
              key={course.id}
              type="button"
              disabled={plannedLocked}
              className={`slot-half category-${course.category} ${notReady ? "not-ready" : ""} ${isHovered ? "hovered" : ""} ${isSiblingDim ? "sibling-dim" : ""} ${unlockHighlightIds.has(course.id) ? "unlock-highlight" : ""} ${plannedLocked ? "planned-locked" : ""}`}
              onMouseEnter={() => !plannedLocked && onHover(course.id)}
              onClick={() => {
                if (plannedLocked) return;
                onRequestSlot(slotId, course.id);
              }}
              title={
                plannedLocked
                  ? `${course.title} — already planned (select that semester to change)`
                  : course.title
              }
              data-course-id={course.id}
            >
              <span className="slot-label">{course.label}</span>
              {course.offered === "fall" && (
                <span className="slot-term-tag">Fall only</span>
              )}
              {course.offered === "spring" && (
                <span className="slot-term-tag">Spring only</span>
              )}
              <span className="slot-title">{course.title}</span>
              <span className="slot-credits">{course.credits} cr</span>
              {course.residencyCredits > 0 && (
                <span className="slot-residency-credits">
                  {course.residencyCredits} ECE res.
                </span>
              )}
            </button>
          );
        })}
      </div>
      {popup}
    </>
  );
}
