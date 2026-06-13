"use client";

import { useState, useEffect } from "react";
import GlobeSceneWrapper from "@/components/GlobeSceneWrapper";
import TypewriterTitle from "@/components/TypewriterTitle";

export default function HomePage() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (revealed) return;
    const reveal = () => setRevealed(true);
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "F5" || e.key === "F12") return;
      e.preventDefault();
      reveal();
    };
    window.addEventListener("keydown", keyHandler);
    window.addEventListener("click", reveal);
    return () => {
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("click", reveal);
    };
  }, [revealed]);

  return (
    <div className="home-page">
      <GlobeSceneWrapper />
      <div className="home-content">
        <TypewriterTitle />
        <p className="home-subtitle">
          探索未知 · 记录创造
        </p>

        {!revealed && (
          <div className="home-prompt-wrap">
            <span className="home-prompt">
              PRESS ANY KEY
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
