"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { Color } from "three";

type ThemeColors = {
  wall: string;
  line: string;
  glow: string;
};

function readThemeColors(): ThemeColors {
  if (typeof window === "undefined") {
    return { wall: "#0a0a0a", line: "#ededed", glow: "#6366f1" };
  }

  const styles = getComputedStyle(document.documentElement);
  const bg = styles.getPropertyValue("--bg").trim() || "#0a0a0a";
  const fg = styles.getPropertyValue("--fg").trim() || "#ededed";
  const accent = styles.getPropertyValue("--accent").trim() || "#6366f1";

  return { wall: bg, line: fg, glow: accent };
}

function useThemeColors() {
  const [colors, setColors] = useState<ThemeColors>(() => readThemeColors());

  useEffect(() => {
    const updateColors = () => setColors(readThemeColors());
    const observer = new MutationObserver(updateColors);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    updateColors();

    return () => observer.disconnect();
  }, []);

  return colors;
}

function SceneInvalidator({ colors }: { colors: ThemeColors }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [colors, invalidate]);

  return null;
}

function MuseumWall() {
  const colors = useThemeColors();
  const wallColor = useMemo(() => new Color(colors.wall), [colors.wall]);
  const lineColor = useMemo(() => new Color(colors.line), [colors.line]);
  const glowColor = useMemo(() => new Color(colors.glow), [colors.glow]);

  return (
    <>
      <SceneInvalidator colors={colors} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[0, 4, 7]} intensity={0.55} color={lineColor} />

      <mesh position={[0, 0, -2.8]}>
        <planeGeometry args={[18, 6.2]} />
        <meshBasicMaterial color={wallColor} transparent opacity={0.2} />
      </mesh>

      <mesh position={[0, 1.35, -2.68]}>
        <boxGeometry args={[18, 0.012, 0.012]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.16} />
      </mesh>
      <mesh position={[0, -1.2, -2.68]}>
        <boxGeometry args={[18, 0.012, 0.012]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, -2.55, -2.66]}>
        <boxGeometry args={[18, 0.01, 0.01]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.08} />
      </mesh>

      <mesh position={[-3.4, 0.7, -2.62]} rotation={[0, 0, -0.08]}>
        <planeGeometry args={[4.4, 2.6]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <mesh position={[3.2, -0.6, -2.62]} rotation={[0, 0, 0.09]}>
        <planeGeometry args={[4.8, 2.8]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.045} depthWrite={false} />
      </mesh>

      {[-6.5, -3.25, 0, 3.25, 6.5].map((x) => (
        <mesh key={x} position={[x, 2.3, -2.55]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.44, 1.55, 32, 1, true]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.035} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

export default function ArtWallScene({ className }: { className?: string }) {
  return (
    <div className={className ?? "art-wall-scene"} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4.7], fov: 42 }}
        frameloop="demand"
        dpr={[1, 1.25]}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      >
        <MuseumWall />
      </Canvas>
    </div>
  );
}
