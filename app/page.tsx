"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const SplashScene = dynamic(() => import("@/components/SplashScene"), { ssr: false });

export default function SplashPage() {
  const router = useRouter();
  const [fadeIn, setFadeIn] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 淡入动画
    const t = setTimeout(() => setFadeIn(true), 300);

    const handleKey = (e: KeyboardEvent) => {
      // 忽略功能键
      if (e.key === "F5" || e.key === "F12") return;
      e.preventDefault();
      setVisible(false);
      setTimeout(() => router.push("/home"), 800);
    };

    const handleClick = () => {
      setVisible(false);
      setTimeout(() => router.push("/home"), 800);
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("click", handleClick);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("click", handleClick);
    };
  }, [router]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease-out",
        cursor: "pointer",
      }}
    >
      <SplashScene />

      {/* 标题覆盖层 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: fadeIn ? 1 : 0,
          transition: "opacity 1.2s ease-out",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(3rem, 8vw, 7rem)",
            fontWeight: 900,
            letterSpacing: "0.15em",
            color: "#f5f3ff",
            textShadow: "0 0 80px rgba(139, 92, 246, 0.6), 0 0 160px rgba(99, 102, 241, 0.35)",
            marginBottom: "0.15em",
            userSelect: "none",
          }}
        >
          ZONORA
        </h1>
        <p
          style={{
            fontSize: "clamp(0.85rem, 1.8vw, 1.25rem)",
            color: "#a78bfa",
            letterSpacing: "0.35em",
            userSelect: "none",
            marginBottom: "3rem",
          }}
        >
          探索未知 · 记录创造
        </p>

        {/* 按键提示 */}
        <div
          style={{
            animation: "pulse 2.2s ease-in-out infinite",
            userSelect: "none",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "0.9rem",
              letterSpacing: "0.2em",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "0.6rem 2rem",
              borderRadius: "4px",
            }}
          >
            PRESS ANY KEY
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.45;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
