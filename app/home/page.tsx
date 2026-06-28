"use client";

import { useState, useEffect, useCallback } from "react";
import GlobeSceneWrapper from "@/components/GlobeSceneWrapper";
import TypewriterTitle from "@/components/TypewriterTitle";
import { isNavRevealed } from "@/components/NavHeader";

export default function HomePage() {
  const [revealed, setRevealed] = useState(() => isNavRevealed());

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
      </div>
      <footer className="home-footer">
        <p>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ pointerEvents: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            渝ICP备2026008425号-2
          </a>
        </p>
      </footer>
    </div>
  );
}
