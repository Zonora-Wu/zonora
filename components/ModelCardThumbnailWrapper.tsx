"use client";

import { assetPath } from "@/lib/sitePaths";

export default function ModelCardThumbnailWrapper({ modelPath }: { modelPath: string }) {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a1035 0%, #0d0d2b 100%)",
    }}>
      <img
        src={assetPath(modelPath)}
        alt="ROG 幻14"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          padding: "8px",
        }}
      />
    </div>
  );
}
