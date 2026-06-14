"use client";

import dynamic from "next/dynamic";
import { useDeferredWebGLMount } from "@/components/useDeferredWebGLMount";

const WEBGL_MOUNT_DELAY = 200;
const ArtWallScene = dynamic(() => import("@/components/ArtWallScene"), { ssr: false });

export default function ArtWallSceneWrapper() {
  const shouldMount = useDeferredWebGLMount(WEBGL_MOUNT_DELAY);

  if (!shouldMount) {
    return <div className="art-wall-scene art-wall-scene--placeholder" aria-hidden="true" />;
  }

  return <ArtWallScene />;
}
