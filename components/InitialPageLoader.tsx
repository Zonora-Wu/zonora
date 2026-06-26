"use client";

import { useEffect, useState } from "react";
import AppLoadingMark from "@/components/AppLoadingMark";

const MIN_VISIBLE_MS = 900;
const MAX_WAIT_MS = 5000;
const EXIT_ANIMATION_MS = 600;

/**
 * Waits until all images currently in the DOM have either loaded or errored.
 * Returns a Promise that resolves when every <img> on the page has settled.
 */
function waitForAllImages(timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(), timeoutMs);

    const check = () => {
      const images = document.querySelectorAll("img:not([data-loader-watched])");

      if (images.length === 0) {
        // No new unwatched images — are there any still loading?
        const allImages = document.querySelectorAll("img");
        const pending = Array.from(allImages).filter((img) => !img.complete).length;
        if (pending === 0) {
          clearTimeout(timeout);
          resolve();
        }
        return;
      }

      // Tag and listen on newly discovered images
      images.forEach((img) => {
        img.setAttribute("data-loader-watched", "1");
        img.addEventListener("load", scheduleCheck, { once: true });
        img.addEventListener("error", scheduleCheck, { once: true });
      });

      // Also check immediately in case these were already complete
      scheduleCheck();
    };

    let checkTimer: number | null = null;
    const scheduleCheck = () => {
      if (checkTimer !== null) return;
      checkTimer = window.setTimeout(() => {
        checkTimer = null;
        check();
      }, 60);
    };

    // Kick off
    check();

    return () => clearTimeout(timeout);
  });
}

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

    const imagesReady = waitForAllImages(MAX_WAIT_MS);

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

    Promise.all([fontReady, imagesReady]).then(() => {
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
