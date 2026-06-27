"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useDeferredWebGLMount } from "@/components/useDeferredWebGLMount";
import { preloadLaptopShowcaseAssets } from "@/components/laptopShowcaseAssets";

const KaliLaptopShowcase = dynamic(
  () => import("@/components/LaptopShowcase").then((mod) => ({ default: mod.KaliLaptopShowcase })),
  { ssr: false }
);

const WEBGL_MOUNT_DELAY = 200;

export default function LaptopShowcaseWrapper() {
  const shouldMount = useDeferredWebGLMount(WEBGL_MOUNT_DELAY);

  useEffect(() => {
    preloadLaptopShowcaseAssets();
  }, []);

  if (!shouldMount) {
    return (
      <div
        className="webgl-deferred-placeholder webgl-deferred-placeholder--laptop"
        data-loader-pending="laptop-showcase"
        aria-hidden="true"
      />
    );
  }

  return <KaliLaptopShowcase />;
}
