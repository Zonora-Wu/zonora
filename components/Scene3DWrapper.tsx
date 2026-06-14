"use client";

import dynamic from "next/dynamic";
import { useDeferredWebGLMount } from "@/components/useDeferredWebGLMount";

const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false });

const WEBGL_MOUNT_DELAY = 200;

export default function Scene3DWrapper() {
  const shouldMount = useDeferredWebGLMount(WEBGL_MOUNT_DELAY);

  if (!shouldMount) {
    return <div className="webgl-deferred-placeholder canvas-container" aria-hidden="true" />;
  }

  return <Scene3D />;
}
