import type { PhotoItem } from "@/data/photoRegions";

export interface PhotoPosition {
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

export type PhotoLayoutResult = {
  photoId: string;
  position: PhotoPosition;
  overlapCount: number;
};

/**
 * Two-row horizontal layout — photos split into two rows (top/bottom),
 * evenly spaced horizontally within each row, with slight random jitter.
 * Users drag to rearrange freely.
 */
export function balancedTwoRows(
  photos: PhotoItem[],
  wallWidth: number,
  wallHeight: number,
): PhotoLayoutResult[] {
  if (photos.length === 0) return [];

  const results: PhotoLayoutResult[] = [];

  const PHOTO_WIDTH_PCT = 16; // each photo width as % of wall width
  const GAP_PCT = 2.5; // gap between photos in % of wall width
  const PHOTO_HEIGHT_PCT = 22; // each photo height as % of wall height

  // Two rows closer together, with more tilt
  // Top row area: 15% to 42%
  // Bottom row area: 48% to 78% (rows closer, 6% gap between rows)
  const TOP_ROW_Y = 25;
  const BOTTOM_ROW_Y = 54;

  // Distribute photos into two rows — alternate to balance count
  const topPhotos: PhotoItem[] = [];
  const bottomPhotos: PhotoItem[] = [];
  for (let i = 0; i < photos.length; i++) {
    if (i % 2 === 0) topPhotos.push(photos[i]);
    else bottomPhotos.push(photos[i]);
  }

  function layoutRow(items: PhotoItem[], rowY: number) {
    const count = items.length;
    if (count === 0) return;

    // Total horizontal space consumed by this row's photos + gaps
    const totalWidth = count * PHOTO_WIDTH_PCT + (count - 1) * GAP_PCT;
    // Starting X to center the row
    const startX = (100 - totalWidth) / 2;

    for (let i = 0; i < count; i++) {
      const photo = items[i];

      // Base position — evenly spaced, centered
      const baseX = startX + i * (PHOTO_WIDTH_PCT + GAP_PCT);
      const baseY = rowY;

      // Subtle random jitter for natural feel
      const jitterX = (Math.random() - 0.5) * 1.5; // ±0.75%
      const jitterY = (Math.random() - 0.5) * 1.5; // ±0.75%
      // Stronger tilt: ±4° instead of ±2°
      const rotate = (Math.random() - 0.5) * 8; // ±4° tilt
      // Varied scale for staggered visual — photos appear at different sizes
      const scale = 0.9 + Math.random() * 0.15; // 0.9 ~ 1.3

      results.push({
        photoId: photo.id,
        position: {
          x: baseX + jitterX,
          y: baseY + jitterY,
          rotate,
          scale,
        },
        overlapCount: 0,
      });
    }
  }

  layoutRow(topPhotos, TOP_ROW_Y);
  layoutRow(bottomPhotos, BOTTOM_ROW_Y);

  return results;
}

export function generatePhotoLayout(
  photos: PhotoItem[],
  wallWidth: number,
  wallHeight: number,
  maxRadiusPct: number = 50,
  maxOverlapPct: number = 0.3,
  maxRetries: number = 50,
): PhotoLayoutResult[] {
  if (photos.length === 0) return [];

  const placed: { x: number; y: number; rotate: number; scale: number; pw: number; ph: number }[] = [];
  const result: PhotoLayoutResult[] = [];

  const half = Math.min(wallWidth, wallHeight) / 2;
  const maxRadiusPx = (maxRadiusPct / 100) * half * 2;
  const xMargin = 0.08;
  const yMargin = 0.1;

  for (const photo of photos) {
    const aspect = photo.width / photo.height;
    let found = false;
    let overlapCount = 0;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = maxRadiusPx * Math.sqrt(Math.random());
      const x = wallWidth / 2 + radius * Math.cos(angle) - (wallWidth * xMargin);
      const y = wallHeight / 2 + radius * Math.sin(angle) - (wallHeight * yMargin);
      const rotate = (Math.random() - 0.5) * 30;
      const scale = 0.75 + Math.random() * 0.25;

      const renderW = wallWidth * xMargin * 2 * scale;
      const renderH = renderW / aspect;

      const overlap = checkOverlap(
        x, y, renderW, renderH,
        placed,
        maxOverlapPct,
      );

      if (overlap < 0) {
        placed.push({ x, y, rotate, scale, pw: renderW, ph: renderH });
        result.push({
          photoId: photo.id,
          position: {
            x: (x / wallWidth) * 100,
            y: (y / wallHeight) * 100,
            rotate,
            scale,
          },
          overlapCount: 0,
        });
        found = true;
        break;
      }

      overlapCount = Math.max(overlapCount, overlap);
    }

    if (!found) {
      const origX = (photo.layout.x / 100) * wallWidth;
      const origY = (photo.layout.y / 100) * wallHeight;
      const renderW = wallWidth * xMargin * 2 * photo.layout.scale!;
      const renderH = renderW / aspect;

      placed.push({ x: origX, y: origY, rotate: photo.layout.rotate, scale: photo.layout.scale!, pw: renderW, ph: renderH });
      result.push({
        photoId: photo.id,
        position: {
          x: (origX / wallWidth) * 100,
          y: (origY / wallHeight) * 100,
          rotate: photo.layout.rotate,
          scale: photo.layout.scale!,
        },
        overlapCount,
      });
    }
  }

  return result;
}

function checkOverlap(
  x1: number, y1: number, w1: number, h1: number,
  placed: { x: number; y: number; rotate: number; scale: number; pw: number; ph: number }[],
  threshold: number,
): number {
  let maxOverlap = 0;

  for (const p of placed) {
    const ix = Math.max(0, Math.min(x1 + w1, p.x + p.pw) - Math.max(x1, p.x));
    const iy = Math.max(0, Math.min(y1 + h1, p.y + p.ph) - Math.max(y1, p.y));
    const intersect = ix * iy;
    if (intersect <= 0) continue;

    const smaller = Math.min(w1 * h1, p.pw * p.ph);
    const ratio = intersect / smaller;
    if (ratio > maxOverlap) maxOverlap = ratio;

    if (ratio >= threshold) return ratio;
  }

  return maxOverlap;
}
