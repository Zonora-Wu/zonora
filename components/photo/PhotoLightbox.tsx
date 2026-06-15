"use client";

import { useEffect } from "react";
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

export default function PhotoLightbox({ photo, regionName, hasNavigation, onClose, onPrev, onNext }: PhotoLightboxProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasNavigation) onPrev();
      if (event.key === "ArrowRight" && hasNavigation) onNext();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasNavigation, onClose, onNext, onPrev]);

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
            {photo.src ? (
              <img
                className="art-modal__image photo-lightbox__image"
                src={photo.src}
                width={photo.width}
                height={photo.height}
                alt={photo.title}
                decoding="async"
                draggable={false}
              />
            ) : (
              <div className="photo-lightbox__empty">
                <span>{regionName}</span>
                <strong>{photo.title}</strong>
                <p>把真实摄影图片放入 public/photos 后，在 data/photoRegions.ts 中填写 src 即可显示。</p>
              </div>
            )}

            {hasNavigation ? (
              <>
                <button
                  type="button"
                  className="art-modal__nav art-modal__nav--prev"
                  onClick={(event) => { event.stopPropagation(); onPrev(); }}
                  aria-label="上一张"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="art-modal__nav art-modal__nav--next"
                  onClick={(event) => { event.stopPropagation(); onNext(); }}
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
