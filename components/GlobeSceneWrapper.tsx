"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const WEBGL_MOUNT_DELAY = 200;

const GlobeScene = dynamic(() => import("@/components/GlobeScene"), { ssr: false });

export default function GlobeSceneWrapper() {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShouldMount(true);
    }, WEBGL_MOUNT_DELAY);

    return () => window.clearTimeout(timer);
  }, []);

  if (!shouldMount) {
    return <div className="webgl-deferred-placeholder webgl-deferred-placeholder--home" aria-hidden="true" />;
  }

  return <GlobeScene />;
}
