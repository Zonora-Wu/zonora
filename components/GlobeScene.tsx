"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

const mousePos = { x: 0, y: 0 };

function Globe() {
  const groupRef = useRef<THREE.Group>(null);
  const targetRot = useRef({ x: 0, y: 0 });

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

    targetRot.current.x += (mousePos.y * 0.5 - targetRot.current.x) * 0.04;
    targetRot.current.y += (mousePos.x * 0.5 - targetRot.current.y) * 0.04;

    groupRef.current.rotation.y += delta * 0.06;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRot.current.x * 0.4, 0.05);
    groupRef.current.rotation.y += targetRot.current.y * 0.02;
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

export default function GlobeScene() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.5, 4.5], fov: 50 }}
      style={{ position: "absolute", inset: 0 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.3} />
      <Globe />
      <StarField />
    </Canvas>
  );
}
