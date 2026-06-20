import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const photoDir = path.join(rootDir, "public", "photography");
const outputDir = path.join(photoDir, "_webp");
const dataFile = path.join(rootDir, "data", "photoAssets.ts");
const imageExtensions = new Set([".jpg", ".jpeg", ".png"]);

const variants = [
  { key: "cardSmall", width: 480, quality: 76 },
  { key: "cardLarge", width: 960, quality: 78 },
  { key: "lightboxSmall", width: 1600, quality: 82 },
  { key: "lightboxLarge", width: 2048, quality: 84 },
];

async function listPhotos() {
  const regions = (await readdir(photoDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort();

  const photos = [];
  for (const region of regions) {
    const regionDir = path.join(photoDir, region);
    const files = (await readdir(regionDir))
      .filter((filename) => imageExtensions.has(path.extname(filename).toLowerCase()))
      .sort();

    for (const filename of files) {
      photos.push({
        id: path.basename(filename, path.extname(filename)),
        region,
        filename,
        sourcePath: path.join(regionDir, filename),
      });
    }
  }

  return photos;
}

async function optimizePhoto(photo) {
  const metadata = await sharp(photo.sourcePath).rotate().metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Unable to read dimensions for ${photo.sourcePath}`);
  }

  const regionOutputDir = path.join(outputDir, photo.region);
  await mkdir(regionOutputDir, { recursive: true });

  const generated = {};
  for (const variant of variants) {
    const actualWidth = Math.min(variant.width, metadata.width);
    const filename = `${photo.id}-${variant.width}w.webp`;
    const outputPath = path.join(regionOutputDir, filename);

    await sharp(photo.sourcePath)
      .rotate()
      .resize({ width: variant.width, withoutEnlargement: true })
      .webp({ quality: variant.quality, effort: 4 })
      .toFile(outputPath);

    generated[variant.key] = {
      src: `/photography/_webp/${photo.region}/${filename}`,
      width: actualWidth,
    };
  }

  return {
    id: photo.id,
    width: metadata.width,
    height: metadata.height,
    cardSrc: generated.cardSmall.src,
    cardSrcSet: `${generated.cardSmall.src} ${generated.cardSmall.width}w, ${generated.cardLarge.src} ${generated.cardLarge.width}w`,
    cardSizes: "(max-width: 760px) 44vw, 17vw",
    lightboxSrc: generated.lightboxSmall.src,
    lightboxSrcSet: `${generated.lightboxSmall.src} ${generated.lightboxSmall.width}w, ${generated.lightboxLarge.src} ${generated.lightboxLarge.width}w`,
    lightboxSizes: "calc(100vw - 6rem)",
  };
}

function generateDataFile(assets) {
  const rows = assets.map((asset) => `  ${JSON.stringify(asset.id)}: ${JSON.stringify(asset)},`).join("\n");
  return `export type PhotoAsset = {
  id: string;
  width: number;
  height: number;
  cardSrc: string;
  cardSrcSet: string;
  cardSizes: string;
  lightboxSrc: string;
  lightboxSrcSet: string;
  lightboxSizes: string;
};

export const photoAssets: Record<string, PhotoAsset> = {
${rows}
};
`;
}

const photos = await listPhotos();
const assets = [];

await rm(outputDir, { recursive: true, force: true });

for (let index = 0; index < photos.length; index += 4) {
  assets.push(...await Promise.all(photos.slice(index, index + 4).map(optimizePhoto)));
}

await writeFile(dataFile, generateDataFile(assets));

console.log(`Optimized ${assets.length} photography images`);
console.log(`Generated ${assets.length * variants.length} responsive WebP variants`);
console.log(`Generated ${path.relative(rootDir, dataFile)}`);
