"use client";

import { useState, useEffect, useCallback } from "react";
import GlobeSceneWrapper from "@/components/GlobeSceneWrapper";
import TypewriterTitle from "@/components/TypewriterTitle";

export default function HomePage() {
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(() => setRevealed(true), []);

  // 从其他页面返回首页时，NavHeader 会派发 nav-revealed 事件通知
  useEffect(() => {
    if (revealed) return;

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "F5" || e.key === "F12") return;
      e.preventDefault();
      reveal();
    };
    const onHeaderRevealed = () => reveal();

    window.addEventListener("keydown", keyHandler);
    window.addEventListener("click", reveal);
    window.addEventListener("nav-revealed", onHeaderRevealed);
    return () => {
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("click", reveal);
      window.removeEventListener("nav-revealed", onHeaderRevealed);
    };
  }, [revealed, reveal]);

  return (
    <div className="home-page">
      <GlobeSceneWrapper />
      <div className="home-content">
        <TypewriterTitle />

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
