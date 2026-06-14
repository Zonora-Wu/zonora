"use client";

import dynamic from "next/dynamic";
import { useDeferredWebGLMount } from "@/components/useDeferredWebGLMount";

const WEBGL_MOUNT_DELAY = 200;

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), { ssr: false });

export default function ModelViewerWrapper({
  modelPath,
  height,
}: {
  modelPath: string;
  height?: string;
}) {
  const shouldMount = useDeferredWebGLMount(WEBGL_MOUNT_DELAY);
  const resolvedHeight = height ?? "70vh";

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
