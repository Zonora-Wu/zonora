"use client";

import dynamic from "next/dynamic";
import { useDeferredWebGLMount } from "@/components/useDeferredWebGLMount";

const KaliLaptopShowcase = dynamic(
  () => import("@/components/LaptopShowcase").then((mod) => ({ default: mod.KaliLaptopShowcase })),
  { ssr: false }
);

const WEBGL_MOUNT_DELAY = 200;

export default function LaptopShowcaseWrapper() {
  const shouldMount = useDeferredWebGLMount(WEBGL_MOUNT_DELAY);

  if (!shouldMount) {
    return <div className="webgl-deferred-placeholder webgl-deferred-placeholder--laptop" aria-hidden="true" />;
  }

  return <KaliLaptopShowcase />;
}
