"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function ModelCardThumbnail({ modelPath }: { modelPath: string }) {
  return (
    <Canvas
      camera={{ fov: 30, position: [0, 0.8, 5.5] }}
      style={{ width: "100%", height: "100%" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 3, 3]} intensity={0.8} />
      <Suspense fallback={null}>
        <ThumbnailModel modelPath={modelPath} />
      </Suspense>
    </Canvas>
  );
}

function ThumbnailModel({ modelPath }: { modelPath: string }) {
  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    new GLTFLoader().load(modelPath, (gltf) => {
      const model = gltf.scene.clone(true);
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const maxAxis = Math.max(size.x, size.y, size.z) || 1;
      const scale = 2.8 / maxAxis;
      model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
      model.scale.setScalar(scale);

      // Auto-rotate slowly
      model.rotation.y = 0.5;
      setScene(model);
    });
  }, [modelPath]);

  if (!scene) return null;
  return <primitive object={scene} />;
}
