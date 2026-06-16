"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PhotoItem, PhotoRegion } from "@/data/photoRegions";
import PhotoMagnet from "@/components/photo/PhotoMagnet";
import PhotoLightbox from "@/components/photo/PhotoLightbox";

type Position = {
  x: number;
  y: number;
};

type PhotoRegionWallProps = {
  regions: PhotoRegion[];
};

type WallDragState = {
  pointerId: number;
  startX: number;
  startY: number;
  dragging: boolean;
  timerId: number | null;
};

const WALL_LONG_PRESS_MS = 220;
const WALL_SWITCH_DISTANCE = 90;

function wrapIndex(index: number, length: number) {
  return (index + length) % length;
}

export default function PhotoRegionWall({ regions }: PhotoRegionWallProps) {
  const wallDrag = useRef<WallDragState | null>(null);
  const nextPhotoZ = useRef(100);
  const [regionIndex, setRegionIndex] = useState(0);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [photoZLayers, setPhotoZLayers] = useState<Record<string, number>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const region = regions[regionIndex];
  const photos = region.photos;

  const selectedIndex = useMemo(() => {
    if (!selectedPhoto) return -1;
    return photos.findIndex((photo) => photo.id === selectedPhoto.id);
  }, [photos, selectedPhoto]);

  const goRegion = useCallback((direction: -1 | 1) => {
    setRegionIndex((current) => wrapIndex(current + direction, regions.length));
  }, [regions.length]);

  const goPhoto = useCallback((direction: -1 | 1) => {
    if (selectedIndex < 0 || photos.length === 0) return;
    setSelectedPhoto(photos[wrapIndex(selectedIndex + direction, photos.length)]);
  }, [photos, selectedIndex]);

  const updatePosition = useCallback((photoId: string, position: Position) => {
    setPositions((current) => ({ ...current, [photoId]: position }));
  }, []);

  const raisePhoto = useCallback((photoId: string) => {
    const nextZ = nextPhotoZ.current++;
    setPhotoZLayers((current) => ({ ...current, [photoId]: nextZ }));
  }, []);

  const startWallDrag = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const target = event.target;
    if (target instanceof Element && target.closest("button, a, input, textarea, select, [role='dialog']")) return;
    if (event.button !== 0 && event.pointerType === "mouse") return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const state: WallDragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
      timerId: null,
    };

    state.timerId = window.setTimeout(() => {
      if (wallDrag.current?.pointerId === event.pointerId) {
        wallDrag.current.dragging = true;
      }
    }, WALL_LONG_PRESS_MS);

    wallDrag.current = state;
  }, []);

  const moveWallDrag = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const state = wallDrag.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;
    if (Math.abs(deltaX) > 12 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      state.dragging = true;
    }

    if (!state.dragging) return;
    event.preventDefault();
  }, []);

  const finishWallDrag = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const state = wallDrag.current;
    if (!state || state.pointerId !== event.pointerId) return;

    if (state.timerId) window.clearTimeout(state.timerId);
    wallDrag.current = null;

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;
    if (!state.dragging || Math.abs(deltaX) < WALL_SWITCH_DISTANCE || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;

    goRegion(deltaX < 0 ? 1 : -1);
  }, [goRegion]);

  useEffect(() => {
    return () => {
      if (wallDrag.current?.timerId) {
        window.clearTimeout(wallDrag.current.timerId);
      }
    };
  }, []);

  useEffect(() => {
    setSelectedPhoto(null);
  }, [regionIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedPhoto) return;
      if (event.key === "ArrowLeft") goRegion(-1);
      if (event.key === "ArrowRight") goRegion(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goRegion, selectedPhoto]);

  return (
    <section
      className="page-section photo-page"
      data-photo-region={region.id}
      onPointerDown={startWallDrag}
      onPointerMove={moveWallDrag}
      onPointerUp={finishWallDrag}
      onPointerCancel={finishWallDrag}
    >
      <div className="photo-page__intro container">
        <p className="art-page__eyebrow">Magnetic darkroom</p>
        <h1 className="page-title page-title--spacious">摄影</h1>
        <p className="page-lead photo-page__lead">
          按地区整理的旅行影像。左右切换省份，长按拖拽照片重新贴上，点击查看大图。
        </p>
      </div>

      <div className="photo-wall-shell">
        <div
          className="photo-wall"
          key={region.id}
          aria-label={`${region.name}摄影冰箱贴墙`}
        >
          <div className="photo-wall__grain" />
          <div className="photo-wall__shine" />

          {photos.length > 0 ? (
            photos.map((photo, index) => (
              <PhotoMagnet
                key={photo.id}
                photo={photo}
                position={positions[photo.id]}
                zIndex={photoZLayers[photo.id]}
                index={index}
                onCommitPosition={updatePosition}
                onRaise={raisePhoto}
                onOpen={setSelectedPhoto}
              />
            ))
          ) : (
            <div className="photo-wall-empty">
              <span>等待贴上第一张来自 {region.name} 的照片</span>
            </div>
          )}
        </div>
      </div>

      <div className="photo-region-meta">
        <div className="photo-region-hero">
          <div className="photo-region-hero__copy" key={region.id}>
            <span className="photo-region-hero__index">
              {String(regionIndex + 1).padStart(2, "0")} / {String(regions.length).padStart(2, "0")}
            </span>
            <h2>{region.name}</h2>
            <span className="photo-region-hero__subtitle">{region.subtitle}</span>
            <span className="photo-region-hero__divider" />
            <p className="photo-region-hero__description">{region.description}</p>
          </div>
        </div>

        <div className="photo-region-tabs" aria-label="地区列表">
          {regions.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`photo-region-tab ${index === regionIndex ? "photo-region-tab--active" : ""}`}
              onClick={() => setRegionIndex(index)}
              aria-pressed={index === regionIndex}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {selectedPhoto ? (
        <PhotoLightbox
          photo={selectedPhoto}
          regionName={region.name}
          onClose={() => setSelectedPhoto(null)}
          onPrev={() => goPhoto(-1)}
          onNext={() => goPhoto(1)}
          hasNavigation={photos.length > 1}
        />
      ) : null}
    </section>
  );
}
