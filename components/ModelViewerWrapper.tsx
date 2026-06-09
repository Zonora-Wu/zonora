"use client";

import dynamic from "next/dynamic";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), { ssr: false });

export default function ModelViewerWrapper({
  modelPath,
  height,
}: {
  modelPath: string;
  height?: string;
}) {
  return <ModelViewer modelPath={modelPath} height={height} />;
}
