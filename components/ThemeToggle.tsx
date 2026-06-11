"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--fg)",
        fontSize: "1.15rem",
        opacity: 0.7,
        transition: "opacity 0.2s",
        padding: "4px",
        lineHeight: 1,
      }}
      title={theme === "dark" ? "切换亮色模式" : "切换暗色模式"}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
    >
      {theme === "dark" ? "☀" : "🌙"}
    </button>
  );
}
