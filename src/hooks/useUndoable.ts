import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 50;

/**
 * Like useState but keeps past/future stacks for undo and redo.
 * Every call to `set` clears the redo stack (new branch of history).
 */
export function useUndoable<T>(initial: T) {
  const [state, setStateRaw] = useState<T>(initial);
  const [counts, setCounts] = useState({ past: 0, future: 0 });
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);

  const syncCounts = () =>
    setCounts({ past: pastRef.current.length, future: futureRef.current.length });

  const set = useCallback((updater: T | ((prev: T) => T)) => {
    setStateRaw((prev) => {
      const next =
        typeof updater === "function"
          ? (updater as (p: T) => T)(prev)
          : updater;
      pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), prev];
      futureRef.current = []; // new action clears redo stack
      syncCounts();
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    setStateRaw((current) => {
      const prev = pastRef.current[pastRef.current.length - 1];
      pastRef.current = pastRef.current.slice(0, -1);
      futureRef.current = [current, ...futureRef.current.slice(0, MAX_HISTORY - 1)];
      syncCounts();
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    setStateRaw((current) => {
      const next = futureRef.current[0];
      futureRef.current = futureRef.current.slice(1);
      pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), current];
      syncCounts();
      return next;
    });
  }, []);

  return [state, set, undo, redo, counts.past > 0, counts.future > 0] as const;
}
