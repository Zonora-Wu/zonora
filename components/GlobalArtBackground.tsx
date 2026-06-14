"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useDeferredWebGLMount } from "@/components/useDeferredWebGLMount";

const WEBGL_MOUNT_DELAY = 200;
const ArtWallScene = dynamic(() => import("@/components/ArtWallScene"), { ssr: false });

export default function GlobalArtBackground() {
  const pathname = usePathname();
  const shouldMount = useDeferredWebGLMount(WEBGL_MOUNT_DELAY);

  if (pathname === "/" || pathname === "/home") return null;

  if (!shouldMount) {
    return <div className="global-art-bg global-art-bg--placeholder" aria-hidden="true" />;
  }

  return (
    <div className="global-art-bg" aria-hidden="true">
      <ArtWallScene className="global-art-bg__canvas" />
    </div>
  );
}
