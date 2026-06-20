# Zonora Multi-device Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use frontend-design while implementing this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every Zonora page usable and visually consistent on phones, tablets, laptops, desktop monitors, and wide screens without horizontal page overflow.

**Architecture:** Use shared fluid layout tokens for containers, spacing, typography, safe-area insets, and touch targets. Keep specialized art and photography canvases full-bleed, but give their controls viewport-aware bounds and dedicated tablet/mobile rules. Validate behavior at six representative viewport widths with browser geometry checks.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS media/container queries, Three.js, React Three Fiber.

---

### Task 1: Establish responsive foundations

**Files:**
- Modify: `app/globals.css`

- [x] Add fluid container gutters, safe-area values, responsive typography, and overflow protection.
- [x] Add explicit compact-phone, tablet, desktop, and wide-screen breakpoints.
- [x] Ensure controls have a minimum 44px touch target where space permits.

### Task 2: Adapt navigation and shared content layouts

**Files:**
- Modify: `app/globals.css`
- Modify: `components/NavHeader.tsx` only if semantic controls require it.

- [x] Keep desktop navigation in one row.
- [x] Allow tablet navigation to fit without overlap.
- [x] Convert phone navigation into a horizontally scrollable single-line menu.
- [x] Make cards one column on phones, two columns on tablets, and fluid on desktops.

### Task 3: Adapt home and detail experiences

**Files:**
- Modify: `app/globals.css`

- [x] Fit home typography and 3D scene controls inside short and narrow viewports.
- [x] Constrain article, project, model, and contact content to readable line lengths.
- [x] Make model canvases use viewport-aware heights and touch-safe controls.

### Task 4: Adapt art and photography interactions

**Files:**
- Modify: `app/globals.css`
- Modify: `components/ArtGallery.tsx` or photography components only if geometry cannot be solved in CSS.

- [x] Preserve the art stream loop while scaling rows for phone, tablet, and short laptop heights.
- [x] Keep art and photo lightboxes inside visual viewport safe areas.
- [x] Scale photo magnets by viewport class and keep region controls reachable.

### Task 5: Regression validation

**Files:**
- No production files required.

- [x] Check `/home`, `/blog`, `/projects`, `/models`, `/art`, `/photo`, and `/contact` at 360, 390, 768, 1024, 1366, and 1920 widths.
- [x] Assert no document-level horizontal overflow.
- [x] Run `npx tsc --noEmit --incremental false`.
- [x] Run `npm run build`.
