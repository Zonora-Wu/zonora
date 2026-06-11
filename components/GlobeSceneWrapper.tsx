"use client";

import dynamic from "next/dynamic";

const GlobeScene = dynamic(() => import("@/components/GlobeScene"), { ssr: false });

export default function GlobeSceneWrapper() {
  return <GlobeScene />;
}
