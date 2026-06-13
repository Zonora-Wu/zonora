"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const WEBGL_MOUNT_DELAY = 200;

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), { ssr: false });

export default function ModelViewerWrapper({
  modelPath,
  height,
}: {
  modelPath: string;
  height?: string;
}) {
  const [shouldMount, setShouldMount] = useState(false);
  const resolvedHeight = height ?? "70vh";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShouldMount(true);
    }, WEBGL_MOUNT_DELAY);

    return () => window.clearTimeout(timer);
  }, []);

  if (!shouldMount) {
    return (
      <div
        className="webgl-deferred-placeholder webgl-deferred-placeholder--viewer"
        style={{ height: resolvedHeight }}
      >
        <div className="spinner" />
        <span>加载模型中...</span>
      </div>
    );
  }

  return <ModelViewer modelPath={modelPath} height={height} />;
}
