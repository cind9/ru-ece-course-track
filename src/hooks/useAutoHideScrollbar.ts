import { useEffect, useRef } from "react";

const HIDE_DELAY_MS = 700;

/** Shows scrollbar while scrolling; hides shortly after scroll stops. */
export function useAutoHideScrollbar<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      el.classList.add("is-scrolling");
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        el.classList.remove("is-scrolling");
      }, HIDE_DELAY_MS);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (hideTimer) clearTimeout(hideTimer);
      el.classList.remove("is-scrolling");
    };
  }, []);

  return ref;
}
