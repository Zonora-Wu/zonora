"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float } from "@react-three/drei";
import type * as THREE from "three";
import type { Mesh } from "three";

/* ---- 单个几何体 ---- */
function Shape({
  geometry,
  color,
  position,
  speed = 1,
}: {
  geometry: "box" | "torus" | "sphere" | "cone";
  color: string;
  position: [number, number, number];
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  const geom = useMemo(() => {
    const map: Record<string, React.ReactNode> = {
      box: <boxGeometry args={[1, 1, 1]} />,
      torus: <torusGeometry args={[1, 0.35, 16, 32]} />,
      sphere: <sphereGeometry args={[0.65, 32, 32]} />,
      cone: <coneGeometry args={[0.7, 1.2, 32]} />,
    };
    return map[geometry];
  }, [geometry]);

  useFrame((_, delta) => {
    ref.current.rotation.x += delta * 0.3 * speed;
    ref.current.rotation.y += delta * 0.5 * speed;
  });

  return (
    <mesh ref={ref} position={position}>
      {geom}
      <meshStandardMaterial
        color={color}
        roughness={0.25}
        metalness={0.1}
      />
    </mesh>
  );
}

/* ---- 主场景 ---- */
export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ background: "transparent" }}
    >
      {/* 灯光 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {/* 浮动几何体 */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
        <Shape geometry="box" color="#6366f1" position={[-2.2, 0.5, 0]} speed={0.7} />
      </Float>
      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.6}>
        <Shape geometry="torus" color="#ec4899" position={[0, -0.3, 0]} speed={0.9} />
      </Float>
      <Float speed={1.3} rotationIntensity={0.5} floatIntensity={0.7}>
        <Shape geometry="sphere" color="#14b8a6" position={[2.2, 0.5, 0]} speed={1.1} />
      </Float>

      {/* HDR 环境光 */}
      <Environment preset="city" />

      {/* 拖拽旋转 */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
