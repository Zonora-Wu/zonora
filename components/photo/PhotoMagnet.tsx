"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { PhotoItem } from "@/data/photoRegions";

type Position = {
  x: number;
  y: number;
};

type PhotoMagnetProps = {
  photo: PhotoItem;
  position?: Position;
  zIndex?: number;
  index: number;
  onCommitPosition: (photoId: string, position: Position) => void;
  onRaise: (photoId: string) => void;
  onOpen: (photo: PhotoItem) => void;
};

type PressState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  offsetX: number;
  offsetY: number;
  dragging: boolean;
  rafId: number | null;
  timerId: number | null;
  nextPosition: Position;
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

export default function PhotoMagnet({ photo, position, zIndex, index, onCommitPosition, onRaise, onOpen }: PhotoMagnetProps) {
  const magnetRef = useRef<HTMLButtonElement>(null);
  const pressState = useRef<PressState | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const basePosition = position ?? { x: photo.layout.x, y: photo.layout.y };

  const setLivePosition = useCallback((next: Position) => {
    const magnet = magnetRef.current;
    if (!magnet) return;
    magnet.style.setProperty("--photo-x", `${next.x}%`);
    magnet.style.setProperty("--photo-y", `${next.y}%`);
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

    onRaise(photo.id);

    const magnet = event.currentTarget;
    const wallRect = getWallRect(magnet);
    const currentPosition = position ?? { x: photo.layout.x, y: photo.layout.y };
    const currentLeft = (currentPosition.x / 100) * wallRect.width;
    const currentTop = (currentPosition.y / 100) * wallRect.height;

    magnet.setPointerCapture(event.pointerId);

    const state: PressState = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      offsetX: event.clientX - wallRect.left - currentLeft,
      offsetY: event.clientY - wallRect.top - currentTop,
      dragging: false,
      rafId: null,
      timerId: null,
      nextPosition: currentPosition,
    };

    state.timerId = window.setTimeout(() => enterDragMode(), LONG_PRESS_MS);
    pressState.current = state;
  }, [enterDragMode, onRaise, photo.id, photo.layout.x, photo.layout.y, position]);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const state = pressState.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const distance = Math.hypot(event.clientX - state.startClientX, event.clientY - state.startClientY);
    if (distance > DRAG_THRESHOLD_PX) {
      enterDragMode();
    }

    if (!state.dragging) return;

    const wallRect = getWallRect(event.currentTarget);
    const next = {
      x: clamp(((event.clientX - wallRect.left - state.offsetX) / wallRect.width) * 100, -10, 96),
      y: clamp(((event.clientY - wallRect.top - state.offsetY) / wallRect.height) * 100, -8, 96),
    };

    state.nextPosition = next;
    event.preventDefault();

    if (state.rafId !== null) return;
    state.rafId = window.requestAnimationFrame(() => {
      state.rafId = null;
      setLivePosition(state.nextPosition);
    });
  }, [enterDragMode, setLivePosition]);

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
    setIsDragging(false);

    if (wasDragging) {
      setLivePosition(nextPosition);
      onCommitPosition(photo.id, nextPosition);
      return;
    }

    onOpen(photo);
  }, [clearPressTimer, onCommitPosition, onOpen, photo, setLivePosition]);

  useEffect(() => {
    setLivePosition(basePosition);
  }, [basePosition, setLivePosition]);

  useEffect(() => () => {
    const state = pressState.current;
    if (state?.timerId) window.clearTimeout(state.timerId);
    if (state?.rafId !== null && state?.rafId !== undefined) window.cancelAnimationFrame(state.rafId);
  }, []);

  return (
    <button
      ref={magnetRef}
      type="button"
      className={`photo-magnet photo-magnet--${photo.layout.variant} ${isDragging ? "photo-magnet--dragging" : ""}`}
      style={{
        "--photo-x": `${basePosition.x}%`,
        "--photo-y": `${basePosition.y}%`,
        "--photo-rotate": `${photo.layout.rotate}deg`,
        "--photo-scale": photo.layout.scale ?? 1,
        "--photo-z": zIndex ?? photo.layout.z ?? index + 2,
        "--photo-enter-delay": `${index * 90}ms`,
      } as CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      aria-label={`查看照片 ${photo.title}`}
    >
      <span className="photo-magnet__fixture" aria-hidden="true" />
      <span className="photo-magnet__media">
        {photo.src ? (
          <img
            src={photo.src}
            alt={photo.title}
            width={photo.width}
            height={photo.height}
            draggable={false}
            decoding="async"
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
