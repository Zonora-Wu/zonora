# Photo Page Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce photography-page transfer and decoded-image memory by more than 90%, eliminate drag-time layout thrashing, and make region layouts stable while preserving the magnetic-wall design, lightbox, gestures, and edge masks.

**Architecture:** A Sharp build script generates card and lightbox WebP variants plus a typed asset manifest that augments the hand-authored photo metadata. Cards use responsive 480/960px assets and the shared lightbox uses 1600/2400px assets. Dragging caches wall geometry on pointer down and updates only `translate3d` until release; deterministic hash-based layout replaces mount-time shuffling and random resize layouts.

**Tech Stack:** Next.js 16, React 19, TypeScript, Sharp, CSS transforms, ResizeObserver.

---

### Task 1: Responsive photography assets

**Files:**
- Replace: `scripts/optimize-photos.mjs`
- Create: `data/photoAssets.ts`
- Modify: `data/photoRegions.ts`
- Modify: `package.json`
- Create: `public/photography/_webp/**/*.webp`

- [x] Generate 480px and 960px card WebPs.
- [x] Generate 1600px and 2048px lightbox WebPs without enlarging small originals.
- [x] Read orientation-corrected dimensions from Sharp.
- [x] Generate a typed manifest keyed by the existing photo IDs.
- [x] Merge generated assets into the hand-authored region metadata.

### Task 2: Card and lightbox image selection

**Files:**
- Modify: `components/photo/PhotoMagnet.tsx`
- Modify: `components/photo/PhotoRegionWall.tsx`

- [x] Use responsive card assets in magnetic cards.
- [x] Pass lightbox-specific source and srcset values to the shared viewer.
- [x] Verify the original multi-megabyte JPEG is not requested during normal wall viewing.

### Task 3: GPU-only dragging

**Files:**
- Modify: `components/photo/PhotoMagnet.tsx`
- Modify: `app/globals.css`

- [x] Cache the wall rectangle and starting position at pointer down.
- [x] During pointer move, update only pixel-valued drag CSS variables inside one animation frame.
- [x] Commit percentage coordinates once on pointer release.
- [x] Move transition work from `left/top` during drag to compositor-friendly transforms.

### Task 4: Stable layout and reduced rerenders

**Files:**
- Modify: `utils/photoLayout.ts`
- Modify: `components/photo/PhotoRegionWall.tsx`
- Modify: `components/photo/PhotoMagnet.tsx`

- [x] Replace random jitter with a deterministic hash of photo ID.
- [x] Remove the post-mount photo shuffle.
- [x] Index layout results by photo ID with a Map.
- [x] Memoize photo cards and update raised z-index directly through CSS.
- [x] Preserve user positions across irrelevant ResizeObserver callbacks.

### Task 5: Compositing cleanup and verification

**Files:**
- Modify: `app/globals.css`

- [x] Preserve both edge-mask gradients while removing their live backdrop blur.
- [x] Remove the full-wall entry blur while retaining opacity and transform.
- [x] Measure first-screen image requests, transferred bytes, decoded-image estimate, drag layout count, region switching, lightbox quality, and mask visibility.
- [x] Run TypeScript and production build checks; report unrelated existing failures separately.
