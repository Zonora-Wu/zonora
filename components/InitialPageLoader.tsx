"use client";

import { useEffect, useState } from "react";
import AppLoadingMark from "@/components/AppLoadingMark";

const MIN_VISIBLE_MS = 760;
const MAX_ASSET_WAIT_MS = 1400;
const EXIT_ANIMATION_MS = 420;

export default function InitialPageLoader() {
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const startedAt = performance.now();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minVisible = reducedMotion ? 120 : MIN_VISIBLE_MS;
    const exitDuration = reducedMotion ? 80 : EXIT_ANIMATION_MS;
    const timeouts: number[] = [];

    const waitForFonts = "fonts" in document
      ? Promise.race([
          document.fonts.ready.catch(() => undefined),
          new Promise((resolve) => {
            timeouts.push(window.setTimeout(resolve, MAX_ASSET_WAIT_MS));
          }),
        ])
      : Promise.resolve();

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

    waitForFonts.then(() => {
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
