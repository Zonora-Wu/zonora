"use client";

import { useEffect, useState } from "react";
import AppLoadingMark from "@/components/AppLoadingMark";
import { waitForViewportReadiness } from "@/components/viewportReadiness";

const MIN_VISIBLE_MS = 900;
const MAX_WAIT_MS = 7000;
const EXIT_ANIMATION_MS = 600;

export default function InitialPageLoader() {
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const startedAt = performance.now();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minVisible = reducedMotion ? 120 : MIN_VISIBLE_MS;
    const exitDuration = reducedMotion ? 80 : EXIT_ANIMATION_MS;
    const timeouts: number[] = [];

    const fontReady = "fonts" in document
      ? document.fonts.ready.catch(() => undefined)
      : Promise.resolve();

    const viewportReady = waitForViewportReadiness({ timeoutMs: MAX_WAIT_MS });

    const finish = () => {
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, minVisible - elapsed);

      timeouts.push(window.setTimeout(() => {
        setLeaving(true);
        timeouts.push(window.setTimeout(() => {
          setMounted(false);
        }, exitDuration));
      }, remaining));
    };

    Promise.all([fontReady, viewportReady]).then(() => {
      requestAnimationFrame(() => requestAnimationFrame(finish));
    });

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, []);

  if (!mounted) return null;

  return (
    <AppLoadingMark
      id="zonora-initial-loader"
      initial
      leaving={leaving}
      hidden={leaving}
    />
  );
}
