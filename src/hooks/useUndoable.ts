import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 50;

/**
 * Like useState but keeps a history stack so callers can undo.
 * Only exposes a push-based setter — every call to `set` saves
 * the current value before applying the update.
 */
export function useUndoable<T>(initial: T) {
  const [state, setStateRaw] = useState<T>(initial);
  const [historyLen, setHistoryLen] = useState(0);
  const historyRef = useRef<T[]>([]);

  const set = useCallback((updater: T | ((prev: T) => T)) => {
    setStateRaw((prev) => {
      const next =
        typeof updater === "function"
          ? (updater as (p: T) => T)(prev)
          : updater;
      historyRef.current = [
        ...historyRef.current.slice(-(MAX_HISTORY - 1)),
        prev,
      ];
      setHistoryLen(historyRef.current.length);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    const history = historyRef.current;
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    historyRef.current = history.slice(0, -1);
    setHistoryLen(historyRef.current.length);
    setStateRaw(prev);
  }, []);

  return [state, set, undo, historyLen > 0] as const;
}
