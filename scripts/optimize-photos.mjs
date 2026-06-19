/**
 * Photo optimization build script.
 * Generates WebP versions at multiple sizes for responsive loading.
 * Usage: node scripts/optimize-photos.mjs
 *
 * Strategy:
 * - Scans public/photography/ subdirectories (chongqing, sichuan, yunnan, liaoning)
 * - For each photo: generates small (800w), medium (1600w), and original-sized WebP
 * - Stores WebPs in public/photography/_webp/<region>/
 * - Outputs a JSON manifest mapping original paths to srcset data
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const PHOTO_DIR = join(PROJECT_ROOT, 'public', 'photography');
const WEBP_DIR = join(PROJECT_ROOT, 'public', 'photography', '_webp');
const MANIFEST_PATH = join(PROJECT_ROOT, 'scripts', 'photo-manifest.json');

// Photo regions from data/photoRegions.ts
const REGIONS = ['chongqing', 'sichuan', 'yunnan', 'liaoning'];
const SIZES = [
  { label: 'small', width: 800 },
  { label: 'medium', width: 1600 },
];

/**
 * Convert image to WebP at specified width using ImageMagick (magick convert).
 * Falls back to original path if conversion fails.
 */
function convertToWebP(inputPath, outputWebPPath, maxWidth) {
  try {
    const { execSync } = require('child_process');
    const outputDir = dirname(outputWebPPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Use ImageMagick for conversion
    execSync(
      `magick "${inputPath}" -resize ${maxWidth}x -quality 85 -strip "${outputWebPPath}"`,
      { stdio: 'pipe' }
    );
    return existsSync(outputWebPPath);
  } catch (err) {
    console.warn(`ImageMagick convert failed for ${inputPath}: ${err.message}`);
    // Try cwebp as fallback
    try {
      const { execSync } = require('child_process');
      const outputDir = dirname(outputWebPPath);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      execSync(
        `cwebp -q 85 -size ${maxWidth} "${inputPath}" -o "${outputWebPPath}"`,
        { stdio: 'pipe' }
      );
      return existsSync(outputWebPPath);
    } catch (err2) {
      console.warn(`cwebp fallback also failed: ${err2.message}`);
      return false;
    }
  }
}

/**
 * Scan a region directory for image files.
 */
function scanRegion(region) {
  const regionDir = join(PHOTO_DIR, region);
  if (!existsSync(regionDir)) {
    console.warn(`Region directory not found: ${regionDir}`);
    return [];
  }

  const files = readdirSync(regionDir)
    .filter(f => {
      const ext = extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) && !f.startsWith('_');
    })
    .map(f => ({
      filename: f,
      originalPath: join(regionDir, f),
      region,
    }));

  return files;
}

/**
 * Generate WebP variants for a single image.
 */
function generateWebPVariants(imageInfo) {
  const { filename, originalPath, region } = imageInfo;
  const baseName = basename(filename, extname(filename));
  const webpRegionDir = join(WEBP_DIR, region);

  if (!existsSync(webpRegionDir)) {
    mkdirSync(webpRegionDir, { recursive: true });
  }

  const variants = [];

  for (const size of SIZES) {
    const webpFilename = `${baseName}_${size.width}w.webp`;
    const webpPath = join(webpRegionDir, webpFilename);
    const webpPublicPath = `/photography/_webp/${region}/${webpFilename}`;

    if (existsSync(webpPath)) {
      // Already exists, skip conversion
      variants.push({
        label: size.label,
        width: size.width,
        path: webpPublicPath,
      });
    } else {
      const converted = convertToWebP(originalPath, webpPath, size.width);
      if (converted && existsSync(webpPath)) {
        variants.push({
          label: size.label,
          width: size.width,
          path: webpPublicPath,
        });
      } else {
        console.warn(`Failed to convert: ${originalPath}`);
      }
    }
  }

  // Also generate a full-resolution WebP (just format conversion, no resize)
  const fullWebpFilename = `${baseName}_full.webp`;
  const fullWebpPath = join(webpRegionDir, fullWebpFilename);
  const fullWebpPublicPath = `/photography/_webp/${region}/${fullWebpFilename}`;

  if (!existsSync(fullWebpPath)) {
    const fullConverted = convertToWebP(originalPath, fullWebpPath, null);
    if (fullConverted && existsSync(fullWebpPath)) {
      variants.push({
        label: 'full',
        width: 9999,
        path: fullWebpPublicPath,
      });
    }
  } else {
    variants.push({
      label: 'full',
      width: 9999,
      path: fullWebpPublicPath,
    });
  }

  return variants;
}

/**
 * Build srcset string from variants.
 */
function buildSrcset(variants) {
  return variants
    .filter(v => v.width < 9999)
    .map(v => `${v.path} ${v.width}w`)
    .join(', ');
}

/**
 * Build sizes attribute for responsive images.
 */
function buildSizes() {
  return '(max-width: 640px) 200px, (max-width: 1024px) 400px, 800px';
}

// Main execution
console.log('=== Photo Optimization Build ===\n');

let totalProcessed = 0;
let totalConverted = 0;
const manifest = {};

for (const region of REGIONS) {
  console.log(`Scanning region: ${region}`);
  const files = scanRegion(region);
  console.log(`  Found ${files.length} images`);

  manifest[region] = {};

  for (const fileInfo of files) {
    const variants = generateWebPVariants(fileInfo);
    const key = fileInfo.filename.replace(/\.[^.]+$/, '');
    
    manifest[region][key] = {
      variants,
      srcset: buildSrcset(variants),
      sizes: buildSizes(),
      fullWebp: variants.find(v => v.label === 'full')?.path || null,
    };

    if (variants.length > 0) {
      totalConverted++;
    }
    totalProcessed++;
  }
}

// Write manifest
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

console.log(`\n=== Complete ===`);
console.log(`Processed: ${totalProcessed} photos`);
console.log(`Converted: ${totalConverted} photos with WebP variants`);
console.log(`Manifest saved to: ${MANIFEST_PATH}`);
console.log(`\nNext steps:`);
console.log(`1. Update PhotoItem type to include srcset/sizes`);
console.log(`2. Update PhotoMagnet and PhotoLightbox to use srcset`);
console.log(`3. Run: node scripts/optimize-photos.mjs to regenerate`);
