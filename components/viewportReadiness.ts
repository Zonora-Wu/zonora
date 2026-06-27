"use client";

type ViewportReadinessOptions = {
  timeoutMs?: number;
  quietMs?: number;
  viewportMargin?: number;
};

const DEFAULT_TIMEOUT_MS = 6500;
const DEFAULT_QUIET_MS = 220;
const DEFAULT_VIEWPORT_MARGIN = 80;
const IGNORE_SELECTOR = "#zonora-initial-loader, #zonora-initial-loader *";
const PENDING_SELECTOR = "[data-loader-pending]";
const DEFERRED_SOURCE_ATTR = "gallerySrc";
const DEFERRED_SRCSET_ATTR = "gallerySrcset";
const DEFERRED_SIZES_ATTR = "gallerySizes";

const decodedImages = new WeakSet<HTMLImageElement>();
const decodingImages = new WeakMap<HTMLImageElement, Promise<void>>();

function promoteDeferredImageSource(image: HTMLImageElement) {
  const deferredSrc = image.dataset[DEFERRED_SOURCE_ATTR];
  if (!deferredSrc) return;

  image.src = deferredSrc;
  if (image.dataset[DEFERRED_SRCSET_ATTR]) image.srcset = image.dataset[DEFERRED_SRCSET_ATTR]!;
  if (image.dataset[DEFERRED_SIZES_ATTR]) image.sizes = image.dataset[DEFERRED_SIZES_ATTR]!;

  image.removeAttribute("data-gallery-src");
  image.removeAttribute("data-gallery-srcset");
  image.removeAttribute("data-gallery-sizes");
}

function hasImageSource(image: HTMLImageElement) {
  return Boolean(image.currentSrc || image.src || image.dataset[DEFERRED_SOURCE_ATTR]);
}

function isElementRenderable(element: Element) {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0;
}

function isElementInViewport(element: Element, margin: number) {
  const rect = element.getBoundingClientRect();
  return (
    rect.bottom >= -margin &&
    rect.right >= -margin &&
    rect.top <= window.innerHeight + margin &&
    rect.left <= window.innerWidth + margin
  );
}

function getCriticalViewportImages(margin: number) {
  return Array.from(document.images).filter((image) => {
    if (image.closest(IGNORE_SELECTOR)) return false;
    if (!hasImageSource(image)) return false;
    if (!isElementRenderable(image)) return false;
    return isElementInViewport(image, margin);
  });
}

function getVisiblePendingElements(margin: number) {
  return Array.from(document.querySelectorAll(PENDING_SELECTOR)).filter((element) => {
    if (element.closest(IGNORE_SELECTOR)) return false;
    if (!isElementRenderable(element)) return false;
    return isElementInViewport(element, margin);
  });
}

function waitForImageDecode(image: HTMLImageElement) {
  if (decodedImages.has(image)) return Promise.resolve();

  const existing = decodingImages.get(image);
  if (existing) return existing;

  const decode = image.decode
    ? image.decode().catch(() => undefined)
    : Promise.resolve();

  const tracked = decode.then(() => {
    decodedImages.add(image);
    decodingImages.delete(image);
  });

  decodingImages.set(image, tracked);
  return tracked;
}

function isImageLoaded(image: HTMLImageElement) {
  if (!hasImageSource(image)) return true;
  if (!image.complete) return false;
  return image.naturalWidth > 0 || image.dataset.loaderError === "1";
}

function waitForImageLoad(image: HTMLImageElement) {
  if (isImageLoaded(image)) {
    return waitForImageDecode(image);
  }

  return new Promise<void>((resolve) => {
    const cleanup = () => {
      image.removeEventListener("load", onSettle);
      image.removeEventListener("error", onError);
    };

    const onSettle = () => {
      cleanup();
      waitForImageDecode(image).then(resolve);
    };

    const onError = () => {
      image.dataset.loaderError = "1";
      cleanup();
      resolve();
    };

    image.addEventListener("load", onSettle, { once: true });
    image.addEventListener("error", onError, { once: true });
  });
}

export function waitForViewportReadiness({
  timeoutMs = DEFAULT_TIMEOUT_MS,
  quietMs = DEFAULT_QUIET_MS,
  viewportMargin = DEFAULT_VIEWPORT_MARGIN,
}: ViewportReadinessOptions = {}) {
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise<void>((resolve) => {
    let settled = false;
    let evaluateTimer: number | null = null;
    let quietTimer: number | null = null;
    const observedImages = new WeakSet<HTMLImageElement>();

    const cleanup = () => {
      if (evaluateTimer !== null) window.clearTimeout(evaluateTimer);
      if (quietTimer !== null) window.clearTimeout(quietTimer);
      observer.disconnect();
      window.removeEventListener("resize", scheduleEvaluate);
      window.removeEventListener("scroll", scheduleEvaluate, true);
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const timeout = window.setTimeout(finish, timeoutMs);

    const armQuietFinish = () => {
      if (quietTimer !== null) return;
      quietTimer = window.setTimeout(() => {
        window.clearTimeout(timeout);
        finish();
      }, quietMs);
    };

    const clearQuietFinish = () => {
      if (quietTimer === null) return;
      window.clearTimeout(quietTimer);
      quietTimer = null;
    };

    function scheduleEvaluate() {
      if (settled || evaluateTimer !== null) return;
      evaluateTimer = window.setTimeout(() => {
        evaluateTimer = null;
        evaluate();
      }, 50);
    }

    function observeImage(image: HTMLImageElement) {
      if (observedImages.has(image)) return;
      observedImages.add(image);
      waitForImageLoad(image).then(scheduleEvaluate);
    }

    function evaluate() {
      if (settled) return;

      const images = getCriticalViewportImages(viewportMargin);
      const pendingElements = getVisiblePendingElements(viewportMargin);
      images.forEach(promoteDeferredImageSource);

      const pendingImages = images.filter((image) => {
        if (!isImageLoaded(image) || !decodedImages.has(image)) {
          observeImage(image);
          return true;
        }
        return false;
      });

      if (pendingImages.length === 0 && pendingElements.length === 0) {
        armQuietFinish();
      } else {
        clearQuietFinish();
      }
    }

    const observer = new MutationObserver(scheduleEvaluate);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "srcset", "sizes", "style", "class", "data-gallery-src", "data-loader-pending"],
    });

    window.addEventListener("resize", scheduleEvaluate);
    window.addEventListener("scroll", scheduleEvaluate, true);

    requestAnimationFrame(() => requestAnimationFrame(evaluate));
  });
}
