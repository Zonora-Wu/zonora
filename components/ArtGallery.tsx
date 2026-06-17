"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, FocusEvent, MouseEvent, WheelEvent } from "react";
import type { ArtSketch } from "@/data/artSketches";

type ArtGalleryProps = {
  sketches: ArtSketch[];
};

const REPEAT = 3;
const MODAL_EXIT_MS = 440;
const MODAL_ENTER_MS = 500;

type ModalTransition = {
  to: ArtSketch;
  direction: "prev" | "next";
  phase: "exit" | "enter";
  key: number;
};

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);

    updatePreference();
    query.addEventListener("change", updatePreference);

    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

const FEATURED_IDS = new Set([
  "2022-11-30", "2022-12-01",
  "2023-02-01", "2023-02-04", "2023-02-05",
  "2023-02-25", "2023-02-26",
  "2023-03-08", "2023-03-10",
  "2023-03-23", "2023-03-25", "2023-03-26",
]);

const FEATURED_WEIGHT = 8;

function balancedRows(sketches: ArtSketch[]): { topRow: ArtSketch[]; bottomRow: ArtSketch[] } {
  let topWeight = 0;
  let bottomWeight = 0;
  const top: ArtSketch[] = [];
  const bottom: ArtSketch[] = [];

  // Build pseudorandom traversal so the two rows have diverse widths
  const indices = [...Array(sketches.length).keys()];
  // Alternate weaving: pick from front, then from back, then front+1, back-1...
  const woven: number[] = [];
  let lo = 0;
  let hi = indices.length - 1;
  let toggle = true;
  while (lo <= hi) {
    woven.push(toggle ? indices[lo++] : indices[hi--]);
    toggle = !toggle;
  }

  for (const idx of woven) {
    const s = sketches[idx];
    // Base weight on aspect ratio — wider items contribute more horizontal space
    const w = s.aspect;
    if (topWeight <= bottomWeight) {
      top.push(s);
      topWeight += w;
    } else {
      bottom.push(s);
      bottomWeight += w;
    }
  }

  return { topRow: top, bottomRow: bottom };
}

export default function ArtGallery({ sketches }: ArtGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [selectedSketch, setSelectedSketch] = useState<ArtSketch | null>(null);
  const [modalTransition, setModalTransition] = useState<ModalTransition | null>(null);
  const modalTransitionKey = useRef(0);
  const isResetting = useRef(false);
  const [mounted, setMounted] = useState(false);

  const closeModal = useCallback(() => {
    setSelectedSketch(null);
    setModalTransition(null);
  }, []);

  useEffect(() => {
    if (!modalTransition) return;

    const timeout = window.setTimeout(() => {
      if (modalTransition.phase === "exit") {
        setSelectedSketch(modalTransition.to);
        setModalTransition({ ...modalTransition, phase: "enter" });
        return;
      }

      setModalTransition(null);
    }, modalTransition.phase === "exit" ? MODAL_EXIT_MS : MODAL_ENTER_MS);

    return () => window.clearTimeout(timeout);
  }, [modalTransition]);

  const startAtCenter = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const segmentWidth = scroller.scrollWidth / REPEAT;
    // Jump to the middle of the middle segment so the user never starts at an edge
    const currentSegment = Math.floor(scroller.scrollLeft / segmentWidth);
    const nextLeft = currentSegment * segmentWidth + segmentWidth / 2;
    scroller.scrollLeft = nextLeft;
  }, []);

  useLayoutEffect(() => {
    startAtCenter();
  }, [startAtCenter]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { topRow, bottomRow } = useMemo(() => {
    if (!mounted) {
      return balancedRows([...sketches]);
    }

    // Shuffle with featured bias toward front
    const weighted = sketches.map((item) => ({
      item,
      sort: Math.random() / (FEATURED_IDS.has(item.id) ? FEATURED_WEIGHT : 1),
    }));
    weighted.sort((a, b) => a.sort - b.sort);
    return balancedRows(weighted.map((w) => w.item));
  }, [mounted, sketches]);

  useEffect(() => {
    if (!selectedSketch) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedSketch, closeModal]);

  const syncReset = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const segmentWidth = scroller.scrollWidth / REPEAT;
    isResetting.current = true;
    scroller.scrollLeft = segmentWidth + (scroller.scrollLeft % segmentWidth);
    requestAnimationFrame(() => {
      isResetting.current = false;
    });
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const segmentWidth = scroller.scrollWidth / REPEAT;
    scroller.scrollLeft = segmentWidth;
  }, []);

  // flat ordered list for prev/next navigation
  const flatOrder = useMemo(() => [...topRow, ...bottomRow], [topRow, bottomRow]);

  const selectedIndex = useMemo(
    () => (selectedSketch ? flatOrder.findIndex((s) => s.id === selectedSketch.id) : -1),
    [selectedSketch, flatOrder],
  );

  const goToPrev = useCallback(() => {
    if (selectedIndex < 0 || !selectedSketch || modalTransition) return;
    const prev = flatOrder[(selectedIndex - 1 + flatOrder.length) % flatOrder.length];

    if (reducedMotion) {
      setSelectedSketch(prev);
      return;
    }

    setModalTransition({
      to: prev,
      direction: "prev",
      phase: "exit",
      key: ++modalTransitionKey.current,
    });
  }, [selectedIndex, selectedSketch, flatOrder, reducedMotion, modalTransition]);

  const goToNext = useCallback(() => {
    if (selectedIndex < 0 || !selectedSketch || modalTransition) return;
    const next = flatOrder[(selectedIndex + 1) % flatOrder.length];

    if (reducedMotion) {
      setSelectedSketch(next);
      return;
    }

    setModalTransition({
      to: next,
      direction: "next",
      phase: "exit",
      key: ++modalTransitionKey.current,
    });
  }, [selectedIndex, selectedSketch, flatOrder, reducedMotion, modalTransition]);

  const handleScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || isResetting.current) return;

    const segmentWidth = scroller.scrollWidth / REPEAT;
    const pos = scroller.scrollLeft;

    if (pos < segmentWidth * 0.45) {
      isResetting.current = true;
      scroller.scrollLeft = pos + segmentWidth;
      isResetting.current = false;
    } else if (pos > segmentWidth * 2.55) {
      isResetting.current = true;
      scroller.scrollLeft = pos - segmentWidth;
      isResetting.current = false;
    }
  }, []);

  const handleWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (delta === 0) return;

    const scrollDelta = delta * 0.6;
    scroller.scrollLeft += scrollDelta;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (reducedMotion) return;

    const artwork = event.currentTarget;
    const rect = artwork.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    artwork.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px) scale(1.045)`;
  }, [reducedMotion]);

  const handleMouseLeave = useCallback((event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>) => {
    event.currentTarget.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0) scale(1)";
  }, []);

  const renderArtwork = useCallback((sketch: ArtSketch, index: number) => (
    <li
      key={`${sketch.id}-${index}`}
      className="art-work"
      style={{
        "--art-aspect": sketch.aspect,
        "--art-fluid-width": `${(sketch.aspect * 23).toFixed(3)}vh`,
      } as CSSProperties}
    >
      <button
        type="button"
        className="art-work__button"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseLeave}
        onClick={() => setSelectedSketch(sketch)}
        aria-label={`查看画作 ${sketch.title}`}
      >
        <span className="art-work__surface">
          <img
            className="art-work__image"
            src={sketch.src}
            width={sketch.width}
            height={sketch.height}
            alt={sketch.title}
            loading="lazy"
            decoding="async"
          />
        </span>
        <span className="art-work__caption">{sketch.title}</span>
      </button>
    </li>
  ), [handleMouseMove, handleMouseLeave]);

  return (
    <div className="art-gallery" aria-label="绘画作品横向展墙">
      <div className="art-gallery__header">
        <span>{sketches.length} works</span>
        <span className="art-gallery__hint">在画作区域滚动鼠标滚轮横向浏览 · 点击查看大图</span>
      </div>

      <div className="art-gallery__shell" onWheel={handleWheel}>
        <div
          ref={scrollerRef}
          className="art-gallery__scroller"
          onScroll={handleScroll}
          aria-label="横向滚动画廊"
        >
          <div className="art-gallery__track">
            {Array.from({ length: REPEAT }, (_, rep) => (
              <div key={rep} className="art-gallery__segment">
                <ul className="art-gallery__row art-gallery__row--top">
                  {topRow.map((sketch, i) => renderArtwork(sketch, i + rep * sketches.length))}
                </ul>
                <ul className="art-gallery__row art-gallery__row--bottom">
                  {bottomRow.map((sketch, i) => renderArtwork(sketch, i + topRow.length + rep * sketches.length))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedSketch
        ? createPortal(
            <div
              className="art-modal"
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedSketch.title} 画作预览`}
              onClick={closeModal}
            >
              <button
                type="button"
                className="art-modal__close"
                onClick={closeModal}
                aria-label="关闭"
              >
                ✕
              </button>

              <div className="art-modal__panel" onClick={(e) => e.stopPropagation()}>
                <div className="art-modal__stage">
                  <div className="art-modal__frame">
                    {modalTransition?.phase === "exit" ? (
                      <img
                        key={`exit-${modalTransition.key}-${selectedSketch.id}`}
                        className={`art-modal__image art-modal__image--exit-flow art-modal__image--exit-${modalTransition.direction}`}
                        src={selectedSketch.src}
                        width={selectedSketch.width}
                        height={selectedSketch.height}
                        alt={selectedSketch.title}
                        decoding="async"
                        draggable={false}
                      />
                    ) : modalTransition?.phase === "enter" ? (
                      <img
                        key={`enter-${modalTransition.key}-${selectedSketch.id}`}
                        className={`art-modal__image art-modal__image--enter art-modal__image--enter-${modalTransition.direction}`}
                        src={selectedSketch.src}
                        width={selectedSketch.width}
                        height={selectedSketch.height}
                        alt={selectedSketch.title}
                        decoding="async"
                        draggable={false}
                      />
                    ) : (
                      <img
                        className="art-modal__image"
                        src={selectedSketch.src}
                        width={selectedSketch.width}
                        height={selectedSketch.height}
                        alt={selectedSketch.title}
                        decoding="async"
                        draggable={false}
                      />
                    )}
                    <button
                      type="button"
                      className="art-modal__nav art-modal__nav--prev"
                      onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                      aria-label="上一张"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="art-modal__nav art-modal__nav--next"
                      onClick={(e) => { e.stopPropagation(); goToNext(); }}
                      aria-label="下一张"
                    >
                      →
                    </button>
                  </div>
                </div>
                <div className="art-modal__caption">
                  <span>{selectedSketch.title}</span>
                  <span>{selectedSketch.width} × {selectedSketch.height}</span>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
