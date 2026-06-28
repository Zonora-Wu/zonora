"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

type GlobeSceneProps = {
  onReady?: () => void;
};

const mousePos = { x: 0, y: 0 };
let lastMouseTime = 0;

function Globe() {
  const groupRef = useRef<THREE.Group>(null);
  const targetRot = useRef({ x: 0, y: 0 });
  const baseRotationY = useRef(0);

  // 标签页切换回来后重置 idle 计时器，避免动画突然跳转
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        lastMouseTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const particles = useMemo(() => {
    const count = 2800;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const x = Math.cos(theta) * Math.sin(phi);
      const y = Math.cos(phi);
      const z = Math.sin(theta) * Math.sin(phi);

      const r = 2.2 + (Math.random() - 0.5) * 0.12;
      pos[i * 3] = x * r;
      pos[i * 3 + 1] = y * r;
      pos[i * 3 + 2] = z * r;

      const mix = (y + 1) / 2;
      col[i * 3] = 0.3 + mix * 0.35;
      col[i * 3 + 1] = 0.45 + mix * 0.3;
      col[i * 3 + 2] = 0.7 + mix * 0.3;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // 限制 delta 防止切换标签页回来后出现剧烈跳变
    const cappedDelta = Math.min(delta, 0.1);

    const idle = performance.now() - lastMouseTime > 2400;
    if (idle) {
      targetRot.current.x += (0 - targetRot.current.x) * 0.012;
      targetRot.current.y += (0 - targetRot.current.y) * 0.012;
    } else {
      targetRot.current.x += (mousePos.y * 0.5 - targetRot.current.x) * 0.032;
      targetRot.current.y += (mousePos.x * 0.5 - targetRot.current.y) * 0.032;
    }

    baseRotationY.current += cappedDelta * 0.018;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRot.current.x * 0.33, 0.022);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, baseRotationY.current + targetRot.current.y, 0.022);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[2.18, 48, 36]} />
        <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.06} />
      </mesh>
      <points geometry={particles}>
        <pointsMaterial size={0.022} vertexColors transparent opacity={0.65} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.55, 0.012, 16, 120]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function StarField() {
  const geo = useMemo(() => {
    const count = 500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  return (
    <points geometry={geo}>
      <pointsMaterial size={0.018} color="#a5b4fc" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function FirstFrameReady({ onReady }: GlobeSceneProps) {
  const frameCount = useRef(0);
  const hasReported = useRef(false);

  useFrame(() => {
    if (hasReported.current) return;
    frameCount.current += 1;

    if (frameCount.current >= 2) {
      hasReported.current = true;
      onReady?.();
    }
  });

  return null;
}

export default function GlobeScene({ onReady }: GlobeSceneProps) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
      lastMouseTime = performance.now();
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.5, 4.5], fov: 50 }}
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.3} />
      <Globe />
      <StarField />
      <FirstFrameReady onReady={onReady} />
    </Canvas>
  );
}
