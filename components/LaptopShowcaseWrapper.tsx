"use client";

import dynamic from "next/dynamic";

const KaliLaptopShowcase = dynamic(
  () => import("@/components/LaptopShowcase").then((mod) => ({ default: mod.KaliLaptopShowcase })),
  { ssr: false }
);

export default function LaptopShowcaseWrapper() {
  return <KaliLaptopShowcase />;
}
