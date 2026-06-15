"use client";

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { stripBasePath } from "@/lib/sitePaths";

const EXIT_DURATION = 480;
const ENTER_DURATION = 820;
const ROUTE_ORDER = ["/home", "/blog", "/projects", "/models", "/art", "/photo", "/contact"];

type TransitionPhase = "entering" | "idle" | "exiting";
type TransitionDirection = "forward" | "backward";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isPlainLeftClick(event: MouseEvent) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function routeIndex(path: string) {
  const matched = ROUTE_ORDER.findIndex((route) => path === route || path.startsWith(`${route}/`));
  return matched === -1 ? 0 : matched;
}

function getDirection(fromPath: string, toPath: string): TransitionDirection {
  return routeIndex(toPath) >= routeIndex(fromPath) ? "forward" : "backward";
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = stripBasePath(usePathname());
  const router = useRouter();
  const [phase, setPhase] = useState<TransitionPhase>("entering");
  const [direction, setDirection] = useState<TransitionDirection>("forward");
  const exitingTo = useRef<string | null>(null);
  const transitionTimer = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    if (phase === "idle") {
      root.removeAttribute("data-route-transition-phase");
    } else {
      root.dataset.routeTransitionPhase = phase;
    }

    return () => {
      root.removeAttribute("data-route-transition-phase");
    };
  }, [phase]);

  const clearTransitionTimer = () => {
    if (transitionTimer.current) {
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
  };

  useLayoutEffect(() => {
    clearTransitionTimer();

    exitingTo.current = null;

    if (prefersReducedMotion()) {
      setPhase("idle");
      window.dispatchEvent(new CustomEvent("route-transition-idle"));
      return;
    }

    setPhase("entering");
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    transitionTimer.current = window.setTimeout(() => {
      setPhase("idle");
      window.dispatchEvent(new CustomEvent("route-transition-idle"));
      transitionTimer.current = null;
    }, ENTER_DURATION);

    return () => {
      clearTransitionTimer();
    };
  }, [pathname]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!isPlainLeftClick(event) || event.defaultPrevented) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const currentPath = stripBasePath(window.location.pathname);
      const nextPath = stripBasePath(destination.pathname);
      const currentRoute = `${currentPath}${window.location.search}`;
      const nextRoute = `${nextPath}${destination.search}`;
      if (nextRoute === currentRoute) return;

      event.preventDefault();

      const href = `${nextRoute}${destination.hash}`;
      if (prefersReducedMotion()) {
        router.push(href);
        return;
      }

      if (exitingTo.current === href) return;
      clearTransitionTimer();
      exitingTo.current = href;
      setDirection(getDirection(currentPath, nextPath));
      router.prefetch(href);
      setPhase("exiting");

      transitionTimer.current = window.setTimeout(() => {
        if (exitingTo.current === href) {
          router.push(href);
        }
        transitionTimer.current = null;
      }, EXIT_DURATION);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [router]);

  return (
    <main
      className="container page-transition-stage"
      data-transition-phase={phase}
      data-transition-direction={direction}
    >
      <div className={`page-transition-view ${pathname === "/home" ? "page-transition-view--home" : ""}`} key={pathname}>
        {children}
      </div>
    </main>
  );
}
