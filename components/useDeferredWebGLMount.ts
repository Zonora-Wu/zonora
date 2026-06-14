"use client";

import { useEffect, useState } from "react";

const ROUTE_TRANSITION_IDLE_EVENT = "route-transition-idle";
const TRANSITION_FALLBACK_DELAY = 1400;

export function useDeferredWebGLMount(delay = 180) {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    let mountTimer: number | null = null;
    let fallbackTimer: number | null = null;
    let scheduled = false;
    let cancelled = false;

    const scheduleMount = () => {
      if (scheduled || cancelled) return;
      scheduled = true;
      mountTimer = window.setTimeout(() => {
        if (!cancelled) {
          setShouldMount(true);
        }
      }, delay);
    };

    const routeTransitionActive =
      document.documentElement.hasAttribute("data-route-transition-phase") ||
      document.querySelector('.page-transition-stage[data-transition-phase]:not([data-transition-phase="idle"])');

    if (routeTransitionActive) {
      window.addEventListener(ROUTE_TRANSITION_IDLE_EVENT, scheduleMount, { once: true });
      fallbackTimer = window.setTimeout(scheduleMount, TRANSITION_FALLBACK_DELAY);
    } else {
      scheduleMount();
    }

    return () => {
      cancelled = true;
      window.removeEventListener(ROUTE_TRANSITION_IDLE_EVENT, scheduleMount);
      if (mountTimer) window.clearTimeout(mountTimer);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
    };
  }, [delay]);

  return shouldMount;
}
