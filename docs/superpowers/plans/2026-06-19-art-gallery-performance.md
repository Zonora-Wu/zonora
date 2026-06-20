# Art Gallery Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the painting page's initial image traffic, decoded-image memory, DOM rendering cost, and pointer-event work while preserving the existing gallery layout, loop, lightbox, and left/right masks.

**Architecture:** Extend the art asset sync pipeline to generate 320px and 640px WebP gallery variants while retaining originals for the lightbox. Use an `IntersectionObserver` rooted at the horizontal scroller so gallery images receive their URLs only near the viewport. Keep the duplicated loop segment for low-risk infinite scrolling, but stabilize keys, skip off-screen rendering work with CSS containment, and throttle tilt updates through one animation frame.

**Tech Stack:** Next.js 16, React 19, TypeScript, Sharp, CSS containment, IntersectionObserver.

---

### Task 1: Generate responsive gallery assets

**Files:**
- Modify: `scripts/sync-art-assets.mjs`
- Modify: `data/artSketches.ts`
- Modify: `package.json`
- Create: `public/sketches/_gallery/*.webp`

- [x] Add 320px and 640px WebP generation through the installed Sharp package.
- [x] Extend `ArtSketch` and generated records with `gallerySrc`, `gallerySrcSet`, and `gallerySizes`.
- [x] Add `art:optimize` as an alias for the idempotent sync/generation command.
- [x] Run `npm run art:sync` and verify 432 WebP variants are generated.
- [x] Compare original and gallery directory byte sizes.

### Task 2: Load only nearby gallery images

**Files:**
- Create: `components/ArtGalleryImage.tsx`
- Modify: `components/ArtGallery.tsx`

- [x] Use one shared observer rooted at the gallery scroller rather than one observer per image.
- [x] Use a horizontal `rootMargin` of two viewports so incoming works preload before becoming visible.
- [x] Render dimensions and accessible alt text immediately, but assign `src`/`srcSet` only after intersection.
- [x] Keep the original image URL exclusively in `ArtworkLightbox`.

### Task 3: Reduce rendering and interaction overhead

**Files:**
- Modify: `components/ArtGallery.tsx`
- Modify: `app/globals.css`

- [x] Replace index-derived keys with stable segment-and-artwork keys.
- [x] Remove the post-mount random reorder so React does not remount the full wall.
- [x] Add layout/paint containment and `content-visibility: auto` to artwork cards.
- [x] Throttle pointer tilt writes to one `requestAnimationFrame`, caching geometry for the active card.
- [x] Preserve both mask pseudo-elements and their gradients while removing their costly live backdrop blur.

### Task 4: Verify behavior and performance

**Files:**
- Test: painting page in local Chromium

- [x] Run TypeScript checking and record unrelated pre-existing failures separately.
- [x] Verify automatic scrolling and smooth stopping still work.
- [x] Verify opening the lightbox loads the original image.
- [x] Measure DOM count, image request count, transferred image bytes, and decoded-image memory after ten seconds.
- [x] Confirm both left and right masks remain visible.
