import { useCallback, useRef, type ReactNode } from "react";

type ResizeEdge = "left" | "top";

interface ResizablePanelProps {
  edge: ResizeEdge;
  size: number;
  minSize: number;
  maxSize: number;
  onSizeChange: (size: number) => void;
  className?: string;
  resizeLabel?: string;
  children: ReactNode;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ResizablePanel({
  edge,
  size,
  minSize,
  maxSize,
  onSizeChange,
  className = "",
  resizeLabel,
  children,
}: ResizablePanelProps) {
  const dragRef = useRef({ pointer: 0, size: 0 });

  const endResize = useCallback(() => {
    document.body.classList.remove("resizing-col", "resizing-row");
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = {
        pointer: edge === "left" ? e.clientX : e.clientY,
        size,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      document.body.classList.add(
        edge === "left" ? "resizing-col" : "resizing-row",
      );
    },
    [edge, size],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      const { pointer: startPtr, size: startSize } = dragRef.current;
      const current = edge === "left" ? e.clientX : e.clientY;
      const delta = startPtr - current;
      onSizeChange(clamp(startSize + delta, minSize, maxSize));
    },
    [edge, minSize, maxSize, onSizeChange],
  );

  const panelStyle =
    edge === "left"
      ? { width: size, minWidth: minSize, maxWidth: maxSize }
      : { height: size, minHeight: minSize, maxHeight: maxSize };

  return (
    <div
      className={`resizable-panel resizable-panel--${edge} ${className}`.trim()}
      style={panelStyle}
    >
      <div
        className={`panel-resize-edge panel-resize-edge--${edge}`}
        role="separator"
        aria-orientation={edge === "left" ? "vertical" : "horizontal"}
        aria-valuenow={size}
        aria-valuemin={minSize}
        aria-valuemax={maxSize}
        aria-label={
          resizeLabel ??
          (edge === "left"
            ? "Resize panel — drag along the left edge"
            : "Resize panel — drag along the top edge")
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endResize}
        onPointerCancel={endResize}
        onLostPointerCapture={endResize}
      />
      {children}
    </div>
  );
}
