"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GlobeSceneWrapper from "@/components/GlobeSceneWrapper";
import TypewriterTitle from "@/components/TypewriterTitle";

export default function HomePage() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <GlobeSceneWrapper />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", pointerEvents: "none" }}>
        <TypewriterTitle />
        <p style={{ color: "var(--muted)", fontSize: "clamp(1rem, 2vw, 1.3rem)", letterSpacing: "0.05em" }}>
          探索未知 · 记录创造
        </p>
      </div>
    </div>
  );
}
