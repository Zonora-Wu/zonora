"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, MouseEvent, WheelEvent as ReactWheelEvent } from "react";
import type { ArtSketch } from "@/data/artSketches";
import ArtworkLightbox, { useReducedMotion } from "@/components/ArtworkLightbox";

type ArtGalleryProps = {
  sketches: ArtSketch[];
};

const REPEAT = 2;
const AUTO_SCROLL_SPEED = 18 / 1000;
const STOP_EASING_MS = 900;
const MIN_SCROLL_SPEED = 0.001;

function setImmediateScrollLeft(scroller: HTMLDivElement, left: number) {
  scroller.scrollTo({ left, behavior: "instant" });
}

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
  const isResetting = useRef(false);

  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);
  const speedRef = useRef(AUTO_SCROLL_SPEED);
  const stoppingRef = useRef(false);
  const tiltFrameRef = useRef<number | null>(null);
  const tiltTargetRef = useRef<{
    element: HTMLButtonElement;
    rect: DOMRect;
    clientX: number;
    clientY: number;
  } | null>(null);

  const closeModal = useCallback(() => {
    setSelectedSketch(null);
  }, []);

  const startAtCenter = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const segmentWidth = scroller.scrollWidth / REPEAT;
    // Jump to the middle of the first segment for REPEAT=2
    const currentSegment = Math.floor(scroller.scrollLeft / segmentWidth);
    const nextLeft = (currentSegment + 0.5) * segmentWidth;
    scrollPositionRef.current = nextLeft;
    setImmediateScrollLeft(scroller, nextLeft);
  }, []);

  useLayoutEffect(() => {
    startAtCenter();
  }, [startAtCenter]);

  const autoScroll = useCallback((time: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const previousTime = lastFrameTimeRef.current ?? time;
    const elapsed = Math.min(time - previousTime, 50);
    lastFrameTimeRef.current = time;

    if (!document.hidden && elapsed > 0) {
      if (stoppingRef.current) {
        speedRef.current *= Math.exp(-elapsed / STOP_EASING_MS);
      }

      scrollPositionRef.current += speedRef.current * elapsed;

      const segmentWidth = scroller.scrollWidth / REPEAT;
      if (scrollPositionRef.current > segmentWidth * 1.7) {
        scrollPositionRef.current -= segmentWidth;
      }

      setImmediateScrollLeft(scroller, scrollPositionRef.current);
    }

    if (stoppingRef.current && speedRef.current <= MIN_SCROLL_SPEED) {
      speedRef.current = 0;
      animationFrameRef.current = null;
      return;
    }

    animationFrameRef.current = requestAnimationFrame(autoScroll);
  }, []);

  const stopAutoScroll = useCallback(() => {
    stoppingRef.current = true;
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    stoppingRef.current = false;
    speedRef.current = AUTO_SCROLL_SPEED;
    lastFrameTimeRef.current = null;
    animationFrameRef.current = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [reducedMotion, autoScroll]);

  useEffect(() => {
    const onPointerDown = () => stopAutoScroll();
    const onKeyDown = () => stopAutoScroll();

    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, { capture: true });
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [stopAutoScroll]);

  const { topRow, bottomRow } = useMemo(
    () => balancedRows(sketches),
    [sketches],
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const images = scroller.querySelectorAll<HTMLImageElement>(".art-work__image[data-gallery-src]");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const image = entry.target as HTMLImageElement;
        const src = image.dataset.gallerySrc;
        if (src) image.src = src;
        if (image.dataset.gallerySrcset) image.srcset = image.dataset.gallerySrcset;
        if (image.dataset.gallerySizes) image.sizes = image.dataset.gallerySizes;

        image.removeAttribute("data-gallery-src");
        image.removeAttribute("data-gallery-srcset");
        image.removeAttribute("data-gallery-sizes");
        observer.unobserve(image);
      }
    }, {
      root: scroller,
      rootMargin: "0px 200% 0px 200%",
      threshold: 0.01,
    });

    images.forEach((image) => observer.observe(image));
    return () => observer.disconnect();
  }, [topRow, bottomRow]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Native wheel listener with passive:false to guarantee preventDefault works
    // Only prevents default (stops page scroll) — event still bubbles to React onWheel on shell for actual scrolling
    const onWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault();
    };

    scroller.addEventListener("wheel", onWheel, { passive: false });

    return () => scroller.removeEventListener("wheel", onWheel);
  }, []);

  // flat ordered list for prev/next navigation
  const flatOrder = useMemo(() => [...topRow, ...bottomRow], [topRow, bottomRow]);

  const handleScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || isResetting.current) return;

    const segmentWidth = scroller.scrollWidth / REPEAT;
    const pos = scroller.scrollLeft;

    if (Math.abs(pos - scrollPositionRef.current) > 2) {
      scrollPositionRef.current = pos;
    }

    if (pos < segmentWidth * 0.3) {
      isResetting.current = true;
      scrollPositionRef.current = pos + segmentWidth;
      setImmediateScrollLeft(scroller, scrollPositionRef.current);
      isResetting.current = false;
    } else if (pos > segmentWidth * 1.7) {
      isResetting.current = true;
      scrollPositionRef.current = pos - segmentWidth;
      setImmediateScrollLeft(scroller, scrollPositionRef.current);
      isResetting.current = false;
    }
  }, []);

  const handleWheel = useCallback((event: ReactWheelEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Normalize delta to pixel values (handle deltaMode: 0=pixel, 1=line, 2=page)
    const rawX = event.deltaMode === 0 ? event.deltaX : event.deltaX * 100;
    const rawY = event.deltaMode === 0 ? event.deltaY : event.deltaY * 100;
    const delta = Math.abs(rawX) > Math.abs(rawY) ? rawX : rawY;
    if (Math.abs(delta) < 1) return;

    const scrollDelta = delta * 0.6;
    scrollPositionRef.current = scroller.scrollLeft + scrollDelta;
    setImmediateScrollLeft(scroller, scrollPositionRef.current);
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleMouseEnter = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (reducedMotion) return;

    tiltTargetRef.current = {
      element: event.currentTarget,
      rect: event.currentTarget.getBoundingClientRect(),
      clientX: event.clientX,
      clientY: event.clientY,
    };
  }, [reducedMotion]);

  const handleMouseMove = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (reducedMotion) return;

    const target = tiltTargetRef.current;
    if (!target || target.element !== event.currentTarget) {
      tiltTargetRef.current = {
        element: event.currentTarget,
        rect: event.currentTarget.getBoundingClientRect(),
        clientX: event.clientX,
        clientY: event.clientY,
      };
    } else {
      target.clientX = event.clientX;
      target.clientY = event.clientY;
    }

    if (tiltFrameRef.current !== null) return;
    tiltFrameRef.current = requestAnimationFrame(() => {
      tiltFrameRef.current = null;
      const current = tiltTargetRef.current;
      if (!current) return;

      const x = (current.clientX - current.rect.left) / current.rect.width - 0.5;
      const y = (current.clientY - current.rect.top) / current.rect.height - 0.5;
      current.element.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px) scale(1.045)`;
    });
  }, [reducedMotion]);

  const handleMouseLeave = useCallback((event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>) => {
    if (tiltTargetRef.current?.element === event.currentTarget) {
      tiltTargetRef.current = null;
    }
    if (tiltFrameRef.current !== null) {
      cancelAnimationFrame(tiltFrameRef.current);
      tiltFrameRef.current = null;
    }
    event.currentTarget.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0) scale(1)";
  }, []);

  useEffect(() => () => {
    if (tiltFrameRef.current !== null) {
      cancelAnimationFrame(tiltFrameRef.current);
    }
  }, []);

  const renderArtwork = useCallback((sketch: ArtSketch, segment: number) => (
    <li
      key={`${segment}-${sketch.id}`}
      className="art-work"
      style={{
        "--art-aspect": sketch.aspect,
        "--art-fluid-width": `${(sketch.aspect * 23).toFixed(3)}vh`,
      } as CSSProperties}
    >
      <button
        type="button"
        className="art-work__button"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseLeave}
        onClick={() => setSelectedSketch(sketch)}
        aria-label={`查看画作 ${sketch.title}`}
      >
        <span className="art-work__surface">
          <img
            className="art-work__image"
            data-gallery-src={sketch.gallerySrc}
            data-gallery-srcset={sketch.gallerySrcSet}
            data-gallery-sizes={sketch.gallerySizes}
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
  ), [handleMouseEnter, handleMouseMove, handleMouseLeave]);

  return (
    <div className="art-gallery" aria-label="绘画作品展墙">
      <div className="art-gallery__header">
        <span>{sketches.length} works</span>
        <span className="art-gallery__hint">桌面滚轮横向浏览 · 手机纵向浏览 · 点击画作查看大图</span>
      </div>

      <div className="art-gallery__shell" onWheel={handleWheel}>
        <div
          ref={scrollerRef}
          className="art-gallery__scroller"
          onScroll={handleScroll}
          aria-label="绘画作品画廊"
        >
          <div className="art-gallery__track">
            {Array.from({ length: REPEAT }, (_, rep) => (
              <div key={rep} className="art-gallery__segment">
                <ul className="art-gallery__row art-gallery__row--top">
                  {topRow.map((sketch) => renderArtwork(sketch, rep))}
                </ul>
                <ul className="art-gallery__row art-gallery__row--bottom">
                  {bottomRow.map((sketch) => renderArtwork(sketch, rep))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedSketch
        ? (
          <ArtworkLightbox
            items={flatOrder}
            selected={selectedSketch}
            onSelect={setSelectedSketch}
            onClose={closeModal}
            secondaryText={(sketch) => `${sketch.width} × ${sketch.height}`}
            previewLabel="画作预览"
          />
        )
        : null}
    </div>
  );
}
