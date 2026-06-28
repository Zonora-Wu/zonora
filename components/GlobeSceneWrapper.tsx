"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const GlobeScene = dynamic(() => import("@/components/GlobeScene"), { ssr: false });

export default function GlobeSceneWrapper() {
  const [isReady, setIsReady] = useState(false);
  const [showFade, setShowFade] = useState(false);

  useEffect(() => {
    if (isReady && !showFade) {
      // 给 React 一次渲染机会，确保 Canvas 已在 DOM 中后再添加动画类
      requestAnimationFrame(() => setShowFade(true));
    }
  }, [isReady, showFade]);

  return (
    <div
      className="home-globe-shell"
      aria-hidden="true"
    >
      {/* Canvas 始终挂载（保持布局稳定），但无内容直到 WebGL 初始化 */}
      <div className={showFade ? "home-globe-fade" : "home-globe-hidden"}>
        <GlobeScene onReady={() => setIsReady(true)} />
      </div>
    </div>
  );
}
