"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export type LightboxArtwork = {
  id: string;
  title: string;
  src?: string;
  width: number;
  height: number;
  srcset?: string;
  sizes?: string;
};

type ArtworkLightboxProps<T extends LightboxArtwork> = {
  items: T[];
  selected: T;
  onSelect: (item: T) => void;
  onClose: () => void;
  secondaryText: (item: T) => string;
  previewLabel: string;
  imageClassName?: string;
  renderEmpty?: (item: T) => ReactNode;
};

type ModalTransition<T> = {
  to: T;
  direction: "prev" | "next";
  phase: "exit" | "enter";
  key: number;
};

const MODAL_EXIT_MS = 440;
const MODAL_ENTER_MS = 500;

export function useReducedMotion() {
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

export default function ArtworkLightbox<T extends LightboxArtwork>({
  items,
  selected,
  onSelect,
  onClose,
  secondaryText,
  previewLabel,
  imageClassName = "",
  renderEmpty,
}: ArtworkLightboxProps<T>) {
  const reducedMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const transitionKey = useRef(0);
  const [transition, setTransition] = useState<ModalTransition<T> | null>(null);

  const selectedIndex = useMemo(
    () => items.findIndex((item) => item.id === selected.id),
    [items, selected.id],
  );
  const hasNavigation = items.length > 1 && selectedIndex >= 0;

  useEffect(() => {
    if (!transition) return;

    const timeout = window.setTimeout(() => {
      if (transition.phase === "exit") {
        onSelect(transition.to);
        setTransition({ ...transition, phase: "enter" });
        return;
      }

      setTransition(null);
    }, transition.phase === "exit" ? MODAL_EXIT_MS : MODAL_ENTER_MS);

    return () => window.clearTimeout(timeout);
  }, [onSelect, transition]);

  const navigate = useCallback((direction: "prev" | "next") => {
    if (!hasNavigation || transition) return;

    const offset = direction === "prev" ? -1 : 1;
    const nextIndex = (selectedIndex + offset + items.length) % items.length;
    const nextItem = items[nextIndex];

    if (reducedMotion) {
      onSelect(nextItem);
      return;
    }

    setTransition({
      to: nextItem,
      direction,
      phase: "exit",
      key: ++transitionKey.current,
    });
  }, [hasNavigation, items, onSelect, reducedMotion, selectedIndex, transition]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") navigate("prev");
      if (event.key === "ArrowRight") navigate("next");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, onClose]);

  const displayedItem = transition?.phase === "enter" ? transition.to : selected;
  const transitionClass = transition
    ? ` art-modal__image--${transition.phase === "exit" ? "exit-flow" : "enter"} art-modal__image--${transition.phase}-${transition.direction}`
    : "";
  const mediaClassName = `art-modal__image${transitionClass}${imageClassName ? ` ${imageClassName}` : ""}`;

  return createPortal(
    <div
      className="art-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${displayedItem.title} ${previewLabel}`}
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className="art-modal__close"
        onClick={onClose}
        aria-label="关闭"
      >
        ✕
      </button>

      <div className="art-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="art-modal__stage">
          <div className="art-modal__frame">
            {displayedItem.src ? (
              <img
                key={transition ? `${transition.phase}-${transition.key}-${displayedItem.id}` : displayedItem.id}
                className={mediaClassName}
                src={displayedItem.src}
                srcSet={displayedItem.srcset}
                sizes={displayedItem.sizes}
                width={displayedItem.width}
                height={displayedItem.height}
                alt={displayedItem.title}
                decoding="async"
                draggable={false}
              />
            ) : (
              <div
                key={transition ? `${transition.phase}-${transition.key}-${displayedItem.id}` : displayedItem.id}
                className={mediaClassName}
              >
                {renderEmpty?.(displayedItem)}
              </div>
            )}

            {hasNavigation ? (
              <>
                <button
                  type="button"
                  className="art-modal__nav art-modal__nav--prev"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate("prev");
                  }}
                  aria-label="上一张"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="art-modal__nav art-modal__nav--next"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate("next");
                  }}
                  aria-label="下一张"
                >
                  →
                </button>
              </>
            ) : null}
          </div>
        </div>
        <div className="art-modal__caption">
          <span>{displayedItem.title}</span>
          <span>{secondaryText(displayedItem)}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
