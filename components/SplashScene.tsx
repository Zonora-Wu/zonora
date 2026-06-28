"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import type * as THREE from "three";

/* ---- 星云粒子环 ---- */
function NebulaRing({
  radius,
  count,
  color,
  speed,
}: {
  radius: number;
  count: number;
  color: string;
  speed: number;
}) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 2.5;
      const y = (Math.random() - 0.5) * 1.2;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return pos;
  }, [count, radius]);

  useFrame((_, delta) => {
    const capped = Math.min(delta, 0.1);
    ref.current.rotation.y += capped * speed;
    ref.current.rotation.x += capped * speed * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.06}
        transparent
        opacity={0.7}
        blending={2} // AdditiveBlending
        depthWrite={false}
      />
    </points>
  );
}

/* ---- 中央发光球体 ---- */
function CoreGlow() {
  const ref = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    const capped = Math.min(delta, 0.1);
    ref.current.rotation.y += capped * 0.15;
    ref.current.rotation.x += capped * 0.08;
    if (glowRef.current) {
      const s = 1 + Math.sin(Date.now() * 0.001) * 0.06;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      {/* 内核 */}
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.55, 2]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#7c3aed"
          emissiveIntensity={2}
          roughness={0.2}
          metalness={0.1}
          wireframe
        />
      </mesh>
      {/* 光晕 */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ---- 远距离星尘 ---- */
function DistantStars() {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 18 + Math.random() * 30;
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      pos[i * 3 + 2] = Math.cos(phi) * r;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    const capped = Math.min(delta, 0.1);
    ref.current.rotation.y += capped * 0.015;
    ref.current.rotation.x += capped * 0.005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={1200}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#c4b5fd"
        size={0.08}
        transparent
        opacity={0.8}
        blending={2}
        depthWrite={false}
      />
    </points>
  );
}

/* ---- 主场景 ---- */
export default function SplashScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 8], fov: 55 }}
      style={{ background: "radial-gradient(ellipse at center, #0f0a24 0%, #02000a 70%)" }}
      gl={{ antialias: true }}
    >
      {/* 雾气 */}
      <fog attach="fog" args={["#0f0a24", 12, 50]} />

      {/* 灯光 */}
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#8b5cf6" distance={10} />

      {/* 星空背景 */}
      <Stars radius={40} depth={60} count={3000} factor={4} saturation={0} fade speed={0.3} />

      {/* 远距离星尘 */}
      <DistantStars />

      {/* 星云环 */}
      <NebulaRing radius={4} count={600} color="#7c3aed" speed={0.12} />
      <NebulaRing radius={6} count={400} color="#6366f1" speed={-0.08} />
      <NebulaRing radius={5.2} count={300} color="#a78bfa" speed={0.06} />

      {/* 中央发光体 */}
      <CoreGlow />
    </Canvas>
  );
}
