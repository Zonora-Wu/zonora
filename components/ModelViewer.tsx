"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Html } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import type { Group } from "three";
import { Box3, Vector3, PMREMGenerator, LinearSRGBColorSpace } from "three";

const HDR_ENV_URL = "/hdr/sunset_2K_65d6cbb9-5c06-44f8-9be3-41df7a99f52a.exr";

/* ---- 模型加载与自动居中 ---- */
function Model({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (gltf.scene) {
      // 计算包围盒
      const box = new Box3().setFromObject(gltf.scene);
      const center = new Vector3();
      box.getCenter(center);
      const size = box.getSize(new Vector3());

      // 将模型原点移到几何中心
      gltf.scene.position.set(-center.x, -center.y, -center.z);

      setReady(true);
    }
  }, [gltf]);

  return <primitive object={gltf.scene} />;
}

/* ---- 加载占位 ---- */
function Loader() {
  return (
    <Html center>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div className="spinner" />
        <span style={{ color: "#a78bfa", fontSize: "0.9rem", letterSpacing: "0.08em" }}>
          加载模型中...
        </span>
      </div>
    </Html>
  );
}

/* ---- HDR 环境贴图加载 ---- */
function HDRScene() {
  const { scene, gl } = useThree();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    let cancelled = false;
    let envMap: ReturnType<PMREMGenerator["fromEquirectangular"]>["texture"] | null = null;
    const pmrem = new PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();

    new EXRLoader().load(
      HDR_ENV_URL,
      (texture) => {
        if (cancelled) {
          texture.dispose();
          pmrem.dispose();
          return;
        }

        texture.colorSpace = LinearSRGBColorSpace;
        envMap = pmrem.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        texture.dispose();
        pmrem.dispose();
      },
      undefined,
      () => {
        // Fallback: use a dim warm environment if HDR file fails
        scene.environmentIntensity = 1.0;
        pmrem.dispose();
      },
    );

    return () => {
      cancelled = true;
      loaded.current = false;

      if (envMap) {
        if (scene.environment === envMap) {
          scene.environment = null;
        }
        envMap.dispose();
      }
    };
  }, [scene, gl]);

  return null;
}

/* ---- 主组件 ---- */
export default function ModelViewer({
  modelPath,
  height = "70vh",
}: {
  modelPath: string;
  height?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: "var(--radius)",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Canvas
        camera={{ position: [3, 1.5, 4], fov: 45 }}
        style={{
          background: "radial-gradient(ellipse at center, #1a1030 0%, #0a0a1a 100%)",
        }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={<Loader />}>
          {/* 灯光 */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={2} />
          <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#6366f1" />

          {/* 模型 */}
          <Model url={modelPath} />

          {/* 地面阴影 */}
          <ContactShadows position={[0, -1.5, 0]} opacity={0.35} scale={8} blur={2.5} far={4} />

          {/* HDR 环境贴图（替代 drei Environment preset） */}
          <HDRScene />
        </Suspense>

        {/* 操控 */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}
