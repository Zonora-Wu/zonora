"use client";

import { useState, useEffect, useCallback } from "react";
import GlobeSceneWrapper from "@/components/GlobeSceneWrapper";
import TypewriterTitle from "@/components/TypewriterTitle";

export default function HomePage() {
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(() => setRevealed(true), []);

  // NavHeader 通过 nav-revealed 事件通知 HomePage 同步隐藏提示
  // 从其他页面返回时 NavHeader 已 reveal，会立即派发事件
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
