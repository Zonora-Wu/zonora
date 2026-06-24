"use client";

import { useEffect, useState } from "react";
import GlobeScene from "@/components/GlobeScene";

function GlobeSceneLoading() {
  return <div className="webgl-deferred-placeholder webgl-deferred-placeholder--home" aria-hidden="true" />;
}

export default function GlobeSceneWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <GlobeSceneLoading />;
  }

  return <GlobeScene />;
}
