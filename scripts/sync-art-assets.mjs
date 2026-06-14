import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "sketches");
const publicDir = path.join(rootDir, "public", "sketches");
const dataDir = path.join(rootDir, "data");
const dataFile = path.join(dataDir, "artSketches.ts");
const VALID_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);
const EXPECTED_COUNT = 216;

function readUInt16BE(buffer, offset) {
  return buffer.readUInt16BE(offset);
}

function readUInt32BE(buffer, offset) {
  return buffer.readUInt32BE(offset);
}

function readPngDimensions(buffer) {
  if (!buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    throw new Error("Invalid PNG signature");
  }

  return {
    width: readUInt32BE(buffer, 16),
    height: readUInt32BE(buffer, 20),
    orientation: 1,
  };
}

function readExifOrientation(buffer) {
  let offset = 2;

  while (offset + 4 < buffer.length) {
    if (buffer[offset] !== 0xff) break;

    const marker = buffer[offset + 1];
    const size = readUInt16BE(buffer, offset + 2);
    const segmentStart = offset + 4;
    const segmentEnd = segmentStart + size - 2;

    if (marker === 0xe1 && buffer.subarray(segmentStart, segmentStart + 6).toString("ascii") === "Exif\0\0") {
      const tiffStart = segmentStart + 6;
      const endian = buffer.subarray(tiffStart, tiffStart + 2).toString("ascii");
      const littleEndian = endian === "II";
      const bigEndian = endian === "MM";
      if (!littleEndian && !bigEndian) return 1;

      const readUInt16 = (pos) => littleEndian ? buffer.readUInt16LE(pos) : buffer.readUInt16BE(pos);
      const readUInt32 = (pos) => littleEndian ? buffer.readUInt32LE(pos) : buffer.readUInt32BE(pos);
      const ifdOffset = tiffStart + readUInt32(tiffStart + 4);
      const entries = readUInt16(ifdOffset);

      for (let index = 0; index < entries; index += 1) {
        const entryOffset = ifdOffset + 2 + index * 12;
        const tag = readUInt16(entryOffset);
        if (tag === 0x0112) {
          return readUInt16(entryOffset + 8);
        }
      }

      return 1;
    }

    offset = segmentEnd;
  }

  return 1;
}

function readJpegDimensions(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error("Invalid JPEG signature");
  }

  const orientation = readExifOrientation(buffer);
  const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;

  while (offset + 4 < buffer.length) {
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;

    if (marker === 0xd8 || marker === 0xd9) continue;

    const size = readUInt16BE(buffer, offset);
    if (sofMarkers.has(marker)) {
      const height = readUInt16BE(buffer, offset + 3);
      const width = readUInt16BE(buffer, offset + 5);
      const shouldSwap = [5, 6, 7, 8].includes(orientation);
      return {
        width: shouldSwap ? height : width,
        height: shouldSwap ? width : height,
        orientation,
      };
    }

    offset += size;
  }

  throw new Error("JPEG dimensions not found");
}

function readImageMetadata(filePath) {
  const buffer = readFileSync(filePath);
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".png") return readPngDimensions(buffer);
  if (extension === ".jpg" || extension === ".jpeg") return readJpegDimensions(buffer);

  throw new Error(`Unsupported image extension: ${extension}`);
}

function sanitizeBaseName(filename) {
  const parsed = path.parse(filename);
  return parsed.name
    .normalize("NFKD")
    .replace(/[()]/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "")
    .toLowerCase();
}

function titleFromFilename(filename) {
  return path.parse(filename).name
    .replace(/[()_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniquePublicName(filename, usedNames) {
  const extension = path.extname(filename).toLowerCase() === ".jpg" ? ".jpeg" : path.extname(filename).toLowerCase();
  const baseName = sanitizeBaseName(filename) || "sketch";
  let candidate = `${baseName}${extension}`;
  let suffix = 2;

  while (usedNames.has(candidate)) {
    candidate = `${baseName}-${suffix}${extension}`;
    suffix += 1;
  }

  usedNames.add(candidate);
  return candidate;
}

function toId(publicName) {
  return path.parse(publicName).name;
}

function generateDataFile(sketches) {
  const rows = sketches.map((sketch) => `  {\n    id: ${JSON.stringify(sketch.id)},\n    title: ${JSON.stringify(sketch.title)},\n    src: ${JSON.stringify(sketch.src)},\n    width: ${sketch.width},\n    height: ${sketch.height},\n    aspect: ${Number(sketch.aspect.toFixed(6))},\n    originalFilename: ${JSON.stringify(sketch.originalFilename)},\n  }`).join(",\n");

  return `export type ArtSketch = {\n  id: string;\n  title: string;\n  src: string;\n  width: number;\n  height: number;\n  aspect: number;\n  originalFilename: string;\n};\n\nexport const artSketches: ArtSketch[] = [\n${rows}\n];\n`;
}

const files = readdirSync(sourceDir)
  .filter((file) => VALID_EXTENSIONS.has(path.extname(file).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

if (files.length !== EXPECTED_COUNT) {
  throw new Error(`Expected ${EXPECTED_COUNT} sketches, found ${files.length}`);
}

mkdirSync(publicDir, { recursive: true });
mkdirSync(dataDir, { recursive: true });

const usedNames = new Set();
const sketches = files.map((file) => {
  const sourcePath = path.join(sourceDir, file);
  const publicName = uniquePublicName(file, usedNames);
  const targetPath = path.join(publicDir, publicName);
  const { width, height } = readImageMetadata(sourcePath);

  copyFileSync(sourcePath, targetPath);

  return {
    id: toId(publicName),
    title: titleFromFilename(file),
    src: `/sketches/${publicName}`,
    width,
    height,
    aspect: width / height,
    originalFilename: file,
  };
});

writeFileSync(dataFile, generateDataFile(sketches));

console.log(`Synced ${sketches.length} art sketches to public/sketches`);
console.log("Generated data/artSketches.ts");
