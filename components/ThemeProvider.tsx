"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

const THEME_TRANSITION_MS = 620;

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "dark", toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("zonora-theme");
  return stored === "light" || stored === "dark" ? stored : null;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  // Initialize
  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored ?? getSystemTheme());
  }, []);

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-theme");
    const shouldAnimate = currentTheme === "light" || currentTheme === "dark";
    let transitionTimer: number | null = null;

    if (shouldAnimate && currentTheme !== theme) {
      root.dataset.themeTransitioning = theme;
      transitionTimer = window.setTimeout(() => {
        delete root.dataset.themeTransitioning;
      }, THEME_TRANSITION_MS);
    }

    root.setAttribute("data-theme", theme);
    localStorage.setItem("zonora-theme", theme);

    return () => {
      if (transitionTimer !== null) {
        window.clearTimeout(transitionTimer);
        delete root.dataset.themeTransitioning;
      }
    };
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e: MediaQueryListEvent) => {
      if (!getStoredTheme()) {
        setTheme(e.matches ? "light" : "dark");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
