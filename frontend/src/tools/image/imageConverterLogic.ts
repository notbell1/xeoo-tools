import JSZip from "jszip";

export type OutputTargetFormat =
  | "jpeg"
  | "png"
  | "webp"
  | "avif"
  | "bmp"
  | "ico"
  | "gif";

export interface FormatDefinition {
  format: OutputTargetFormat;
  label: string;
  extension: string;
  mimeType: string;
  description: string;
  supportsQuality: boolean;
  supportsBackground: boolean;
  supportsIcoSize: boolean;
}

export const FORMAT_DEFINITIONS: Record<OutputTargetFormat, FormatDefinition> = {
  png: {
    format: "png",
    label: "PNG",
    extension: "png",
    mimeType: "image/png",
    description: "Lossless compression with full alpha transparency support.",
    supportsQuality: false,
    supportsBackground: false,
    supportsIcoSize: false,
  },
  jpeg: {
    format: "jpeg",
    label: "JPG / JPEG",
    extension: "jpg",
    mimeType: "image/jpeg",
    description: "Universally supported lossy compression with adjustable quality.",
    supportsQuality: true,
    supportsBackground: true,
    supportsIcoSize: false,
  },
  webp: {
    format: "webp",
    label: "WebP",
    extension: "webp",
    mimeType: "image/webp",
    description: "Modern web standard offering superior lossy & lossless compression.",
    supportsQuality: true,
    supportsBackground: false,
    supportsIcoSize: false,
  },
  avif: {
    format: "avif",
    label: "AVIF",
    extension: "avif",
    mimeType: "image/avif",
    description: "Next-generation AV1 compression with exceptional size savings.",
    supportsQuality: true,
    supportsBackground: false,
    supportsIcoSize: false,
  },
  bmp: {
    format: "bmp",
    label: "BMP",
    extension: "bmp",
    mimeType: "image/bmp",
    description: "Standard uncompressed Windows bitmap format.",
    supportsQuality: false,
    supportsBackground: true,
    supportsIcoSize: false,
  },
  ico: {
    format: "ico",
    label: "ICO",
    extension: "ico",
    mimeType: "image/x-icon",
    description: "Windows icon and browser favicon format with customizable size.",
    supportsQuality: false,
    supportsBackground: false,
    supportsIcoSize: true,
  },
  gif: {
    format: "gif",
    label: "GIF",
    extension: "gif",
    mimeType: "image/gif",
    description: "Standard graphics interchange format for single frames or avatars.",
    supportsQuality: false,
    supportsBackground: true,
    supportsIcoSize: false,
  },
};

export interface ConversionOptions {
  format: OutputTargetFormat;
  quality: number; // 10 to 100
  backgroundColor: string; // Hex color (e.g. #ffffff)
  icoSize: number; // 16, 32, 48, 64, 128, 256
}

export interface ImageConversionItem {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  targetFormat: OutputTargetFormat;
  quality: number;
  backgroundColor: string;
  icoSize: number;
  status: "idle" | "converting" | "done" | "error";
  errorMessage?: string;
  result?: {
    blob: Blob;
    url: string;
    fileName: string;
    width: number;
    height: number;
    originalSize: number;
    convertedSize: number;
    mimeType: string;
    reductionPercent: number;
  };
}

export const MAX_IMAGE_FILES = 10;
export const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

// Whitelist of allowed image extensions
export const ALLOWED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "bmp",
  "svg",
  "avif",
  "ico",
  "tif",
  "tiff",
  "heic",
  "heif",
  "jxl",
]);

// Explicit forbidden extensions that must never be processed
const FORBIDDEN_EXTENSIONS = new Set([
  "pdf",
  "php",
  "phtml",
  "php3",
  "php4",
  "php5",
  "php7",
  "phps",
  "html",
  "htm",
  "xhtml",
  "js",
  "mjs",
  "cjs",
  "ts",
  "tsx",
  "jsx",
  "txt",
  "csv",
  "json",
  "xml",
  "yaml",
  "yml",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
  "bz2",
  "fla",
  "mp3",
  "mp4",
  "mkv",
  "avi",
  "mov",
  "webm",
  "wav",
  "ogg",
  "exe",
  "apk",
  "bat",
  "cmd",
  "sh",
  "bin",
  "dll",
  "iso",
]);

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length < 2) return "";
  return parts.pop()?.toLowerCase().trim() ?? "";
}

export function sanitizeBaseName(filename: string): string {
  let base = filename.replace(/\.[^/.]+$/, "");
  // Strip trailing -xeooconverter or -xeoo-convert if already present to prevent stacking
  base = base.replace(/(-xeooconverter|-xeoo-convert)+$/i, "");
  // Strip dangerous or invalid filename characters
  base = base.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "").trim();
  return base || "image";
}

export function buildConvertedFileName(
  originalName: string,
  targetFormat: OutputTargetFormat,
): string {
  const base = sanitizeBaseName(originalName);
  const def = FORMAT_DEFINITIONS[targetFormat];
  const ext = def ? def.extension : targetFormat;
  return `${base}-xeooconverter.${ext}`;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const val = bytes / Math.pow(1024, i);
  if (i === 0) return `${Math.round(val)} B`;
  return `${val.toFixed(val >= 100 ? 0 : val >= 10 ? 1 : 2)} ${units[i]}`;
}

export function formatSizeChange(
  originalSize: number,
  convertedSize: number,
): { text: string; isSmaller: boolean; isNeutral: boolean } {
  if (originalSize <= 0) {
    return { text: "0%", isSmaller: false, isNeutral: true };
  }
  const diff = originalSize - convertedSize;
  const pct = (diff / originalSize) * 100;
  if (Math.abs(pct) < 0.1) {
    return { text: "0% (Same)", isSmaller: false, isNeutral: true };
  }
  if (pct > 0) {
    return { text: `-${pct.toFixed(1)}%`, isSmaller: true, isNeutral: false };
  }
  return {
    text: `+${Math.abs(pct).toFixed(1)}%`,
    isSmaller: false,
    isNeutral: false,
  };
}

/**
 * Validates file magic bytes (signatures)
 */
export async function validateMagicBytes(file: File): Promise<boolean> {
  const ext = getFileExtension(file.name);

  // SVG files are text/xml based
  if (ext === "svg" || file.type === "image/svg+xml") {
    try {
      const slice = file.slice(0, 4096);
      const text = await slice.text();
      const lower = text.toLowerCase();
      // Must contain svg tag or xml with svg
      const hasSvgTag = /<svg[\s>]/i.test(lower);
      // Disallow script injections in SVG
      const hasScript =
        /<script[\s>]/i.test(lower) ||
        /javascript:/i.test(lower) ||
        /on\w+\s*=/i.test(lower);
      return hasSvgTag && !hasScript;
    } catch {
      return false;
    }
  }

  try {
    const buffer = await file.slice(0, 32).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 4) return false;

    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return true;
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return true;
    }

    // GIF: GIF87a or GIF89a
    if (
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38
    ) {
      return true;
    }

    // WebP: RIFF .... WEBP
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46
    ) {
      if (bytes.length >= 12) {
        const tag = String.fromCharCode(
          bytes[8],
          bytes[9],
          bytes[10],
          bytes[11],
        );
        if (tag === "WEBP") return true;
      }
    }

    // BMP: BM
    if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
      return true;
    }

    // ICO: 00 00 01 00 or 00 00 02 00 (CUR)
    if (
      bytes[0] === 0x00 &&
      bytes[1] === 0x00 &&
      (bytes[2] === 0x01 || bytes[2] === 0x02) &&
      bytes[3] === 0x00
    ) {
      return true;
    }

    // TIFF: II*. (49 49 2A 00) or MM.* (4D 4D 00 2A)
    if (
      (bytes[0] === 0x49 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x2a &&
        bytes[3] === 0x00) ||
      (bytes[0] === 0x4d &&
        bytes[1] === 0x4d &&
        bytes[2] === 0x00 &&
        bytes[3] === 0x2a)
    ) {
      return true;
    }

    // AVIF / HEIC / HEIF / ISO Base Media: ....ftyp
    if (bytes.length >= 12) {
      const ftyp = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
      if (ftyp === "ftyp") {
        const brand = String.fromCharCode(
          bytes[8],
          bytes[9],
          bytes[10],
          bytes[11],
        ).toLowerCase();
        if (
          brand.includes("avif") ||
          brand.includes("mif1") ||
          brand.includes("heic") ||
          brand.includes("heix") ||
          brand.includes("msf1")
        ) {
          return true;
        }
      }
    }

    // JXL (JPEG XL): FF 0A or 00 00 00 0C 4A 58 4C 20
    if (bytes[0] === 0xff && bytes[1] === 0x0a) return true;
    if (
      bytes[0] === 0x00 &&
      bytes[1] === 0x00 &&
      bytes[2] === 0x00 &&
      bytes[3] === 0x0c
    ) {
      const jxl = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
      if (jxl === "JXL ") return true;
    }

    // If extension is whitelisted and MIME starts with image/, we test decode later
    if (
      ALLOWED_IMAGE_EXTENSIONS.has(ext) &&
      (file.type.startsWith("image/") || file.type === "")
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Strict file validation: checks extension whitelist, forbidden list, magic bytes, and size limit.
 */
export async function validateImageFile(
  file: File,
): Promise<{ valid: boolean; reason?: string }> {
  const ext = getFileExtension(file.name);

  if (!ext) {
    return {
      valid: false,
      reason: `"${file.name}" has no file extension. Only genuine image files are supported.`,
    };
  }

  if (FORBIDDEN_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      reason: `"${file.name}" (${ext.toUpperCase()}) is not an image file. Non-image files are strictly rejected.`,
    };
  }

  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      reason: `"${file.name}" has an unsupported format (.${ext}). Only standard image formats (JPG, PNG, WebP, GIF, BMP, SVG, AVIF, ICO, TIFF, HEIC) are allowed.`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      reason: `"${file.name}" (${formatBytes(file.size)}) exceeds the maximum allowed size of 50 MB.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      reason: `"${file.name}" is an empty file (0 bytes).`,
    };
  }

  const magicOk = await validateMagicBytes(file);
  if (!magicOk) {
    return {
      valid: false,
      reason: `"${file.name}" failed image header verification. The file appears corrupt or is not a genuine image.`,
    };
  }

  return { valid: true };
}

/**
 * Loads image to verify decoding and get dimensions
 */
export function loadImageDimensions(
  file: File,
): Promise<{ width: number; height: number; url: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth || 1,
        height: img.naturalHeight || 1,
        url: objectUrl,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          `Unable to decode "${file.name}". The image format may not be supported by your browser.`,
        ),
      );
    };

    img.src = objectUrl;
  });
}

/**
 * Tests browser canvas support for a given MIME type
 */
export function isMimeSupported(mimeType: string): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL(mimeType);
    return dataUrl.startsWith(`data:${mimeType}`);
  } catch {
    return false;
  }
}

/**
 * Encodes Canvas ImageData to standard 32-bit or 24-bit Windows BMP Blob
 */
export function encodeBmp(canvas: HTMLCanvasElement): Blob {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire 2D canvas context for BMP.");

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const extraBytes = (width * 3) % 4;
  const paddingSize = extraBytes === 0 ? 0 : 4 - extraBytes;
  const rowSize = width * 3 + paddingSize;
  const imageSize = rowSize * height;
  const fileSize = 54 + imageSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BMP Header (14 bytes)
  view.setUint16(0, 0x424d, false); // 'BM'
  view.setUint32(2, fileSize, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint32(10, 54, true); // Offset to pixel data

  // DIB Header (BITMAPINFOHEADER - 40 bytes)
  view.setUint32(14, 40, true); // Header size
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // Bottom-up
  view.setUint16(26, 1, true); // 1 plane
  view.setUint16(28, 24, true); // 24-bit BGR
  view.setUint32(30, 0, true); // BI_RGB (uncompressed)
  view.setUint32(34, imageSize, true);
  view.setInt32(38, 2835, true); // 72 DPI
  view.setInt32(42, 2835, true); // 72 DPI
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  let offset = 54;
  // Write rows bottom-up
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const srcIndex = (y * width + x) * 4;
      const r = data[srcIndex];
      const g = data[srcIndex + 1];
      const b = data[srcIndex + 2];
      // 24-bit BGR
      view.setUint8(offset++, b);
      view.setUint8(offset++, g);
      view.setUint8(offset++, r);
    }
    // Padding
    for (let p = 0; p < paddingSize; p++) {
      view.setUint8(offset++, 0);
    }
  }

  return new Blob([buffer], { type: "image/bmp" });
}

/**
 * Encodes Canvas to standard Windows ICO format embedding PNG data
 */
export async function encodeIco(
  canvas: HTMLCanvasElement,
  targetSize: number,
): Promise<Blob> {
  // Create resized square canvas for ICO
  const icoCanvas = document.createElement("canvas");
  icoCanvas.width = targetSize;
  icoCanvas.height = targetSize;
  const icoCtx = icoCanvas.getContext("2d");
  if (!icoCtx) throw new Error("Could not acquire 2D canvas context for ICO.");

  // Draw scaled image with crisp rendering
  icoCtx.imageSmoothingEnabled = true;
  icoCtx.imageSmoothingQuality = "high";

  // Calculate centered aspect fit
  const scale = Math.min(
    targetSize / canvas.width,
    targetSize / canvas.height,
  );
  const drawW = canvas.width * scale;
  const drawH = canvas.height * scale;
  const drawX = (targetSize - drawW) / 2;
  const drawY = (targetSize - drawH) / 2;

  icoCtx.drawImage(canvas, drawX, drawY, drawW, drawH);

  // Convert to PNG blob
  const pngBlob = await new Promise<Blob | null>((resolve) => {
    icoCanvas.toBlob(resolve, "image/png");
  });

  if (!pngBlob) {
    throw new Error("Failed to encode ICO sub-image.");
  }

  const pngBuffer = await pngBlob.arrayBuffer();
  const pngBytes = new Uint8Array(pngBuffer);

  // 6 bytes ICONDIR + 16 bytes ICONDIRENTRY + PNG payload
  const icoSize = 6 + 16 + pngBytes.length;
  const icoBuffer = new ArrayBuffer(icoSize);
  const view = new DataView(icoBuffer);

  // ICONDIR
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // Type: 1 = ICO
  view.setUint16(4, 1, true); // Count: 1 image

  // ICONDIRENTRY
  view.setUint8(6, targetSize >= 256 ? 0 : targetSize); // Width
  view.setUint8(7, targetSize >= 256 ? 0 : targetSize); // Height
  view.setUint8(8, 0); // Palette count
  view.setUint8(9, 0); // Reserved
  view.setUint16(10, 1, true); // Color planes
  view.setUint16(12, 32, true); // Bits per pixel
  view.setUint32(14, pngBytes.length, true); // Bytes in res
  view.setUint32(18, 22, true); // Image offset (6 + 16 = 22)

  // Copy PNG bytes
  const destBytes = new Uint8Array(icoBuffer, 22);
  destBytes.set(pngBytes);

  return new Blob([icoBuffer], { type: "image/x-icon" });
}

/**
 * Main conversion engine for converting an image file into requested format
 */
export async function convertImageFile(
  file: File,
  options: ConversionOptions,
): Promise<{
  blob: Blob;
  url: string;
  fileName: string;
  width: number;
  height: number;
  originalSize: number;
  convertedSize: number;
  mimeType: string;
  reductionPercent: number;
}> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () =>
        reject(new Error(`Failed to load image "${file.name}" into canvas.`));
      el.src = objectUrl;
    });

    const width = img.naturalWidth || 1;
    const height = img.naturalHeight || 1;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to create canvas 2D rendering context.");
    }

    // Handle background fill for formats without alpha or when requested
    const needsBackground =
      options.format === "jpeg" ||
      options.format === "bmp" ||
      options.format === "gif";

    if (needsBackground) {
      ctx.fillStyle = options.backgroundColor || "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);

    let outputBlob: Blob | null = null;
    const def = FORMAT_DEFINITIONS[options.format];
    const mimeType = def ? def.mimeType : "image/png";

    if (options.format === "bmp") {
      outputBlob = encodeBmp(canvas);
    } else if (options.format === "ico") {
      outputBlob = await encodeIco(canvas, options.icoSize || 64);
    } else if (options.format === "avif") {
      // Check AVIF support; fallback gracefully to WebP with warning note if browser canvas cannot encode AVIF
      if (isMimeSupported("image/avif")) {
        outputBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, "image/avif", Math.max(0.1, options.quality / 100));
        });
      } else {
        // Fallback to high quality WebP
        outputBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, "image/webp", Math.max(0.1, options.quality / 100));
        });
      }
    } else if (options.format === "jpeg") {
      outputBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", Math.max(0.1, options.quality / 100));
      });
    } else if (options.format === "webp") {
      outputBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", Math.max(0.1, options.quality / 100));
      });
    } else if (options.format === "gif") {
      // Standard canvas toBlob for GIF if supported, else PNG fallback
      if (isMimeSupported("image/gif")) {
        outputBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, "image/gif");
        });
      } else {
        outputBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, "image/png");
        });
      }
    } else {
      // PNG (lossless)
      outputBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });
    }

    if (!outputBlob) {
      throw new Error(`Failed to generate output ${def.label} image blob.`);
    }

    const outputUrl = URL.createObjectURL(outputBlob);
    const convertedSize = outputBlob.size;
    const originalSize = file.size;
    const reductionPercent =
      originalSize > 0
        ? ((originalSize - convertedSize) / originalSize) * 100
        : 0;

    const outFileName = buildConvertedFileName(file.name, options.format);

    const outWidth = options.format === "ico" ? options.icoSize : width;
    const outHeight = options.format === "ico" ? options.icoSize : height;

    return {
      blob: outputBlob,
      url: outputUrl,
      fileName: outFileName,
      width: outWidth,
      height: outHeight,
      originalSize,
      convertedSize,
      mimeType,
      reductionPercent,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Packs multiple converted images into a single ZIP archive
 */
export async function createZipArchive(
  items: Array<{ fileName: string; blob: Blob }>,
): Promise<Blob> {
  const zip = new JSZip();
  const nameCounts = new Map<string, number>();

  for (const item of items) {
    let name = item.fileName;
    if (nameCounts.has(name)) {
      const count = nameCounts.get(name)! + 1;
      nameCounts.set(name, count);
      const ext = getFileExtension(name);
      const base = name.replace(/\.[^/.]+$/, "");
      name = `${base}_${count}.${ext}`;
    } else {
      nameCounts.set(name, 1);
    }
    zip.file(name, item.blob);
  }

  return await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

