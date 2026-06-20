"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { PhotoItem } from "@/data/photoRegions";

type Position = {
  x: number;
  y: number;
};

type PhotoMagnetProps = {
  photo: PhotoItem;
  position?: Position;
  index: number;
  layout?: {
    x: number;
    y: number;
    rotate: number;
    scale: number;
  };
  onCommitPosition: (photoId: string, position: Position) => void;
  getNextZIndex: () => number;
  onOpen: (photo: PhotoItem) => void;
};

type PressState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  wallRect: DOMRect;
  startPosition: Position;
  dragging: boolean;
  rafId: number | null;
  timerId: number | null;
  nextPosition: Position;
  dragX: number;
  dragY: number;
};

const LONG_PRESS_MS = 220;
const DRAG_THRESHOLD_PX = 7;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getWallRect(element: HTMLElement) {
  const wall = element.closest<HTMLElement>(".photo-wall");
  return wall?.getBoundingClientRect() ?? element.getBoundingClientRect();
}

function PhotoMagnet({ photo, position, index, layout, onCommitPosition, getNextZIndex, onOpen }: PhotoMagnetProps) {
  const magnetRef = useRef<HTMLButtonElement>(null);
  const pressState = useRef<PressState | null>(null);
  const liveZIndexRef = useRef(photo.layout.z ?? index + 2);
  const [isDragging, setIsDragging] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  const basePosition = position ?? { x: layout?.x ?? photo.layout.x, y: layout?.y ?? photo.layout.y };

  // Percentage dimensions for overlap detection (relative to wall)
  const dimPctW = useMemo(() => {
    if (!layout) return 0.16 * (photo.layout.scale ?? 1);
    return 0.16 * layout.scale;
  }, [layout, photo]);

  const dimPctH = useMemo(() => {
    if (!layout) return 0.1 * (photo.layout.scale ?? 1);
    const aspect = photo.width / photo.height;
    return (0.16 * layout.scale) / aspect;
  }, [layout, photo]);

  const setLiveDragOffset = useCallback((x: number, y: number) => {
    const magnet = magnetRef.current;
    if (!magnet) return;
    magnet.style.setProperty("--photo-drag-x", `${x}px`);
    magnet.style.setProperty("--photo-drag-y", `${y}px`);
  }, []);

  const enterDragMode = useCallback(() => {
    const state = pressState.current;
    if (!state || state.dragging) return;

    state.dragging = true;
    setIsDragging(true);
  }, []);

  const clearPressTimer = useCallback(() => {
    const state = pressState.current;
    if (state?.timerId) {
      window.clearTimeout(state.timerId);
      state.timerId = null;
    }
  }, []);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;

    const magnet = event.currentTarget;
    const wallRect = getWallRect(magnet);
    const currentPosition = position ?? { x: layout?.x ?? photo.layout.x, y: layout?.y ?? photo.layout.y };
    magnet.setPointerCapture(event.pointerId);
    liveZIndexRef.current = getNextZIndex();
    magnet.style.setProperty("--photo-z", String(liveZIndexRef.current));

    const state: PressState = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      wallRect,
      startPosition: currentPosition,
      dragging: false,
      rafId: null,
      timerId: null,
      nextPosition: currentPosition,
      dragX: 0,
      dragY: 0,
    };

    state.timerId = window.setTimeout(() => enterDragMode(), LONG_PRESS_MS);
    pressState.current = state;
  }, [enterDragMode, getNextZIndex, photo.layout.x, photo.layout.y, layout?.x, layout?.y, position]);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const state = pressState.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const distance = Math.hypot(event.clientX - state.startClientX, event.clientY - state.startClientY);
    if (distance > DRAG_THRESHOLD_PX) {
      enterDragMode();
    }

    if (!state.dragging) return;

    const wallRect = state.wallRect;
    const dragX = event.clientX - state.startClientX;
    const dragY = event.clientY - state.startClientY;
    const next = {
      x: clamp(state.startPosition.x + (dragX / wallRect.width) * 100, -10, 96),
      y: clamp(state.startPosition.y + (dragY / wallRect.height) * 100, -8, 96),
    };

    state.nextPosition = next;
    state.dragX = dragX;
    state.dragY = dragY;
    event.preventDefault();

    if (state.rafId !== null) return;
    state.rafId = window.requestAnimationFrame(() => {
      state.rafId = null;
      setLiveDragOffset(state.dragX, state.dragY);
    });
  }, [enterDragMode, setLiveDragOffset]);

  const finishPointer = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const state = pressState.current;
    if (!state || state.pointerId !== event.pointerId) return;

    clearPressTimer();
    if (state.rafId !== null) {
      window.cancelAnimationFrame(state.rafId);
    }

    const wasDragging = state.dragging;
    const nextPosition = state.nextPosition;
    pressState.current = null;

    if (wasDragging) {
      onCommitPosition(photo.id, nextPosition);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setLiveDragOffset(0, 0);
          setIsDragging(false);
        });
      });
      return;
    }

    onOpen(photo);
  }, [clearPressTimer, onCommitPosition, onOpen, photo, setLiveDragOffset]);

  useEffect(() => () => {
    const state = pressState.current;
    if (state?.timerId) window.clearTimeout(state.timerId);
    if (state?.rafId !== null && state?.rafId !== undefined) window.cancelAnimationFrame(state.rafId);
  }, []);

  return (
    <button
      ref={magnetRef}
      type="button"
      className={`photo-magnet photo-magnet--${photo.layout.variant}${animationDone && !isDragging ? " photo-magnet--done" : ""}${isDragging ? " photo-magnet--dragging" : ""}`}
      style={{
        "--photo-x": `${basePosition.x}%`,
        "--photo-y": `${basePosition.y}%`,
        "--photo-rotate": `${layout?.rotate ?? photo.layout.rotate}deg`,
        "--photo-scale": layout?.scale ?? photo.layout.scale ?? 1,
        "--photo-drag-x": "0px",
        "--photo-drag-y": "0px",
        "--photo-dim-pct-w": `${dimPctW}%`,
        "--photo-dim-pct-h": `${dimPctH}%`,
        "--photo-z": liveZIndexRef.current,
        "--photo-enter-delay": `${index * 90}ms`,
      } as CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      onAnimationEnd={() => setAnimationDone(true)}
      aria-label={`查看照片 ${photo.title}`}
    >
      <span className="photo-magnet__fixture" aria-hidden="true" />
      <span className="photo-magnet__media">
        {photo.src ? (
          <img
            src={photo.cardSrc ?? photo.src}
            srcSet={photo.cardSrcSet}
            sizes={photo.cardSizes}
            alt={photo.title}
            width={photo.width}
            height={photo.height}
            draggable={false}
            decoding="async"
            loading="lazy"
          />
        ) : (
          <span className="photo-magnet__placeholder">
            <span>{photo.location}</span>
            <strong>{photo.title}</strong>
          </span>
        )}
      </span>
      <span className="photo-magnet__caption">
        <strong>{photo.title}</strong>
        <span>{photo.location}</span>
      </span>
    </button>
  );
}

export default memo(PhotoMagnet);
