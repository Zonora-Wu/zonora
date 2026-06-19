"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PhotoItem } from "@/data/photoRegions";

type PhotoLightboxProps = {
  photo: PhotoItem;
  regionName: string;
  hasNavigation: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

const MODAL_UNIFIED_MS = 500;

type ModalTransition = {
  to: PhotoItem;
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

export default function PhotoLightbox({ photo, regionName, hasNavigation, onClose, onPrev, onNext }: PhotoLightboxProps) {
  const reducedMotion = useReducedMotion();
  const [modalTransition, setModalTransition] = useState<ModalTransition | null>(null);
  const modalTransitionKey = useRef(0);

  useEffect(() => {
    if (!modalTransition) return;

    const timeout = window.setTimeout(() => {
      if (modalTransition.phase === "exit") {
        if (modalTransition.direction === "prev") {
          onPrev();
        } else {
          onNext();
        }
        setModalTransition({ ...modalTransition, phase: "enter" });
        return;
      }

      setModalTransition(null);
    }, MODAL_UNIFIED_MS);

    return () => window.clearTimeout(timeout);
  }, [modalTransition, onPrev, onNext]);

  const handlePrev = useCallback(() => {
    if (modalTransition) return;

    if (reducedMotion) {
      onPrev();
      return;
    }

    setModalTransition({
      to: photo,
      direction: "prev",
      phase: "exit",
      key: ++modalTransitionKey.current,
    });
  }, [modalTransition, photo, onPrev, reducedMotion]);

  const handleNext = useCallback(() => {
    if (modalTransition) return;

    if (reducedMotion) {
      onNext();
      return;
    }

    setModalTransition({
      to: photo,
      direction: "next",
      phase: "exit",
      key: ++modalTransitionKey.current,
    });
  }, [modalTransition, photo, onNext, reducedMotion]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasNavigation) handlePrev();
      if (event.key === "ArrowRight" && hasNavigation) handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasNavigation, onClose, handlePrev, handleNext]);

  const renderImage = useCallback((p: PhotoItem, className: string) => {
    if (p.src) {
      return (
        <img
          className={className}
          src={p.src}
          srcSet={p.srcset}
          sizes={p.sizes}
          alt={p.title}
          width={p.width}
          height={p.height}
          decoding="async"
          loading="lazy"
          draggable={false}
        />
      );
    }
    return (
      <div className="photo-lightbox__empty">
        <span>{regionName}</span>
        <strong>{p.title}</strong>
        <p>把真实摄影图片放入 public/photos 后，在 data/photoRegions.ts 中填写 src 即可显示。</p>
      </div>
    );
  }, [regionName]);

  return createPortal(
    <div
      className="art-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.title} 摄影预览`}
      onClick={onClose}
    >
      <button type="button" className="art-modal__close" onClick={onClose} aria-label="关闭">
        ✕
      </button>

      <div className="art-modal__panel photo-lightbox__panel" onClick={(event) => event.stopPropagation()}>
        <div className="art-modal__stage">
          <div className="art-modal__frame">
            {modalTransition?.phase === "exit" ? (
              <>
                <div
                  key={`exit-${modalTransition.key}`}
                  className={`art-modal__image art-modal__image--exit-flow art-modal__image--exit-${modalTransition.direction} art-modal__image--unified-duration`}
                >
                  {renderImage(modalTransition.to, "photo-lightbox__image")}
                </div>
                <div
                  key={`enter-${modalTransition.key}`}
                  className={`art-modal__image art-modal__image--enter art-modal__image--enter-${modalTransition.direction}`}
                >
                  {renderImage(photo, "photo-lightbox__image")}
                </div>
              </>
            ) : modalTransition?.phase === "enter" ? (
              <div
                key={`enter-${modalTransition.key}`}
                className={`art-modal__image art-modal__image--enter art-modal__image--enter-${modalTransition.direction}`}
              >
                {renderImage(photo, "photo-lightbox__image")}
              </div>
            ) : (
              <div className="art-modal__image">
                {renderImage(photo, "photo-lightbox__image")}
              </div>
            )}

            {hasNavigation ? (
              <>
                <button
                  type="button"
                  className="art-modal__nav art-modal__nav--prev"
                  onClick={(event) => { event.stopPropagation(); handlePrev(); }}
                  aria-label="上一张"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="art-modal__nav art-modal__nav--next"
                  onClick={(event) => { event.stopPropagation(); handleNext(); }}
                  aria-label="下一张"
                >
                  →
                </button>
              </>
            ) : null}
          </div>
        </div>
        <div className="art-modal__caption">
          <span>{photo.title}</span>
          <span>{photo.location}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
