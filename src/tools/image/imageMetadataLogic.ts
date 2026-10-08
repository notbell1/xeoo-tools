export interface FileMetadata {
  fileName: string;
  extension: string;
  mimeType: string;
  fileSize: string;
  fileSizeBytes: number;
  lastModified: string;
  container: string;
  format: string;
  formatVersion?: string;
}

export interface ImageDimensionMetadata {
  width: number;
  height: number;
  aspectRatio: string;
  aspectRatioDecimal: string;
  orientationLabel?: string;
  totalPixels: number;
  megapixels: string;
  animated: boolean;
  frameCount?: number;
  loopCount?: string;
  durationMs?: number;
}

export interface ColorMetadata {
  colorType: string;
  colorSpace?: string;
  colorProfileName?: string;
  hasIccProfile: boolean;
  bitDepth?: number;
  channels?: number;
  hasAlpha: boolean;
  transparencyType?: string;
  indexedColors?: number;
}

export interface ResolutionMetadata {
  dpiX?: number;
  dpiY?: number;
  unit?: string;
  printWidthInches?: string;
  printHeightInches?: string;
  printWidthCm?: string;
  printHeightCm?: string;
  available: boolean;
}

export interface ExifMetadata {
  make?: string;
  model?: string;
  lensMake?: string;
  lensModel?: string;
  lensSerialNumber?: string;
  bodySerialNumber?: string;
  software?: string;
  dateTime?: string;
  dateTimeOriginal?: string;
  dateTimeDigitized?: string;
  artist?: string;
  copyright?: string;
  orientation?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: number;
  focalLength?: string;
  focalLength35mm?: string;
  exposureBias?: string;
  meteringMode?: string;
  flash?: string;
  whiteBalance?: string;
  sceneCaptureType?: string;
  exposureProgram?: string;
  shutterSpeed?: string;
  aperture?: string;
  brightness?: string;
  contrast?: string;
  saturation?: string;
  sharpness?: string;
  colorSpace?: string;
  digitalZoom?: string;
  subjectDistance?: string;
  userComment?: string;
  rawTags: Record<string, string>;
}

export interface GpsMetadata {
  hasGps: boolean;
  latitude?: number;
  longitude?: number;
  latitudeDms?: string;
  longitudeDms?: string;
  altitude?: string;
  dateTime?: string;
  direction?: string;
  speed?: string;
  mapDatum?: string;
}

export interface IptcMetadata {
  title?: string;
  headline?: string;
  caption?: string;
  keywords?: string[];
  creator?: string;
  bylineTitle?: string;
  credit?: string;
  source?: string;
  copyright?: string;
  city?: string;
  state?: string;
  country?: string;
  category?: string;
  supplementalCategories?: string[];
}

export interface XmpMetadata {
  creator?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  rights?: string;
  rating?: number;
  label?: string;
  creatorTool?: string;
  createDate?: string;
  modifyDate?: string;
  metadataDate?: string;
  rawFields: Record<string, string>;
}

export interface FormatSpecificMetadata {
  format: string;
  items: Array<{ label: string; value: string | number | boolean }>;
}

export interface PrivacyCheckSummary {
  hasSensitiveData: boolean;
  items: Array<{
    category: string;
    detected: boolean;
    value?: string;
    warningLevel: "high" | "medium" | "low" | "none";
  }>;
}

export interface CompleteImageMetadata {
  id: string;
  file: File;
  previewUrl: string;
  fileInfo: FileMetadata;
  imageInfo: ImageDimensionMetadata;
  colorInfo: ColorMetadata;
  resolutionInfo: ResolutionMetadata;
  exifInfo?: ExifMetadata;
  gpsInfo?: GpsMetadata;
  iptcInfo?: IptcMetadata;
  xmpInfo?: XmpMetadata;
  formatSpecific?: FormatSpecificMetadata;
  privacyCheck: PrivacyCheckSummary;
  rawEntries: Array<{ category: string; key: string; value: string }>;
}

export const MAX_METADATA_FILES = 10;
export const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

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

/**
 * Calculates Greatest Common Divisor
 */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Calculates standard aspect ratio string like "16:9" or "4:3"
 */
export function calculateAspectRatio(
  width: number,
  height: number,
): { ratio: string; decimal: string } {
  if (width <= 0 || height <= 0) {
    return { ratio: "1:1", decimal: "1.00" };
  }
  const divisor = gcd(Math.round(width), Math.round(height));
  let w = Math.round(width) / divisor;
  let h = Math.round(height) / divisor;

  // Approximate common photographic aspect ratios if numbers are very large primes
  const decimalVal = width / height;
  if (w > 50 || h > 50) {
    const knownRatios: [number, string][] = [
      [16 / 9, "16:9"],
      [9 / 16, "9:16"],
      [4 / 3, "4:3"],
      [3 / 4, "3:4"],
      [3 / 2, "3:2"],
      [2 / 3, "2:3"],
      [1, "1:1"],
      [21 / 9, "21:9"],
      [5 / 4, "5:4"],
      [4 / 5, "4:5"],
    ];
    for (const [ratioNum, ratioStr] of knownRatios) {
      if (Math.abs(decimalVal - ratioNum) < 0.02) {
        return { ratio: ratioStr, decimal: decimalVal.toFixed(2) };
      }
    }
  }

  return { ratio: `${w}:${h}`, decimal: decimalVal.toFixed(2) };
}

/**
 * Validates file magic bytes (signatures)
 */
export async function validateImageMagic(file: File): Promise<{
  valid: boolean;
  detectedContainer: string;
}> {
  const ext = getFileExtension(file.name);

  if (ext === "svg" || file.type === "image/svg+xml") {
    try {
      const slice = file.slice(0, 4096);
      const text = await slice.text();
      const lower = text.toLowerCase();
      const hasSvgTag = /<svg[\s>]/i.test(lower);
      const hasScript =
        /<script[\s>]/i.test(lower) ||
        /javascript:/i.test(lower) ||
        /on\w+\s*=/i.test(lower);
      if (hasSvgTag && !hasScript) {
        return { valid: true, detectedContainer: "SVG Vector XML" };
      }
      return { valid: false, detectedContainer: "Invalid SVG/Script Detected" };
    } catch {
      return { valid: false, detectedContainer: "Unreadable SVG" };
    }
  }

  try {
    const buffer = await file.slice(0, 64).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 4) return { valid: false, detectedContainer: "Empty/Corrupt" };

    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { valid: true, detectedContainer: "JPEG / JFIF Stream" };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return { valid: true, detectedContainer: "PNG Chunked Stream" };
    }

    // GIF: GIF87a or GIF89a
    if (
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38
    ) {
      const ver = String.fromCharCode(bytes[3], bytes[4], bytes[5]);
      return { valid: true, detectedContainer: `GIF Container (${ver})` };
    }

    // WebP: RIFF .... WEBP
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes.length >= 12
    ) {
      const tag = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
      if (tag === "WEBP") {
        return { valid: true, detectedContainer: "WebP RIFF Container" };
      }
    }

    // BMP: BM
    if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
      return { valid: true, detectedContainer: "Windows Bitmap (BMP)" };
    }

    // ICO: 00 00 01 00
    if (
      bytes[0] === 0x00 &&
      bytes[1] === 0x00 &&
      bytes[2] === 0x01 &&
      bytes[3] === 0x00
    ) {
      return { valid: true, detectedContainer: "Windows Icon (ICO)" };
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
      return { valid: true, detectedContainer: "TIFF Container" };
    }

    // AVIF / HEIC / HEIF / ISO Media
    if (bytes.length >= 12) {
      const ftyp = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
      if (ftyp === "ftyp") {
        const brand = String.fromCharCode(
          bytes[8],
          bytes[9],
          bytes[10],
          bytes[11],
        ).toLowerCase();
        if (brand.includes("avif")) {
          return { valid: true, detectedContainer: "AVIF Container (ISO BMFF)" };
        }
        if (brand.includes("heic") || brand.includes("heix") || brand.includes("mif1")) {
          return { valid: true, detectedContainer: "HEIF / HEIC Container" };
        }
        return { valid: true, detectedContainer: `ISO BMFF Container (${brand.toUpperCase()})` };
      }
    }

    // JXL (JPEG XL)
    if (bytes[0] === 0xff && bytes[1] === 0x0a) {
      return { valid: true, detectedContainer: "JPEG XL Codestream" };
    }
    if (
      bytes[0] === 0x00 &&
      bytes[1] === 0x00 &&
      bytes[2] === 0x00 &&
      bytes[3] === 0x0c
    ) {
      const jxl = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
      if (jxl === "JXL ") {
        return { valid: true, detectedContainer: "JPEG XL Container" };
      }
    }

    if (
      ALLOWED_IMAGE_EXTENSIONS.has(ext) &&
      (file.type.startsWith("image/") || file.type === "")
    ) {
      return { valid: true, detectedContainer: `Standard Image (.${ext})` };
    }

    return { valid: false, detectedContainer: "Unknown / Non-Image Signature" };
  } catch {
    return { valid: false, detectedContainer: "Error reading bytes" };
  }
}

/**
 * Validates image file before inspection
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
      reason: `"${file.name}" has an unsupported format (.${ext}). Only image formats (JPG, PNG, WebP, GIF, BMP, SVG, AVIF, TIFF, HEIC, ICO) are allowed.`,
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

  const magic = await validateImageMagic(file);
  if (!magic.valid) {
    return {
      valid: false,
      reason: `"${file.name}" failed image signature verification. The file appears corrupt or is not a genuine image.`,
    };
  }

  return { valid: true };
}

// ==========================================
// BINARY EXIF / TIFF PARSER
// ==========================================

const EXIF_TAGS: Record<number, string> = {
  0x010e: "ImageDescription",
  0x010f: "Make",
  0x0110: "Model",
  0x0112: "Orientation",
  0x011a: "XResolution",
  0x011b: "YResolution",
  0x0128: "ResolutionUnit",
  0x0131: "Software",
  0x0132: "DateTime",
  0x013b: "Artist",
  0x8298: "Copyright",
  0x829a: "ExposureTime",
  0x829d: "FNumber",
  0x8822: "ExposureProgram",
  0x8827: "ISO",
  0x9000: "ExifVersion",
  0x9003: "DateTimeOriginal",
  0x9004: "DateTimeDigitized",
  0x9201: "ShutterSpeedValue",
  0x9202: "ApertureValue",
  0x9203: "BrightnessValue",
  0x9204: "ExposureBiasValue",
  0x9205: "MaxApertureValue",
  0x9206: "SubjectDistance",
  0x9207: "MeteringMode",
  0x9208: "LightSource",
  0x9209: "Flash",
  0x920a: "FocalLength",
  0x9286: "UserComment",
  0xa001: "ColorSpace",
  0xa002: "ExifImageWidth",
  0xa003: "ExifImageHeight",
  0xa401: "CustomRendered",
  0xa402: "ExposureMode",
  0xa403: "WhiteBalance",
  0xa404: "DigitalZoomRatio",
  0xa405: "FocalLengthIn35mmFilm",
  0xa406: "SceneCaptureType",
  0xa407: "GainControl",
  0xa408: "Contrast",
  0xa409: "Saturation",
  0xa40a: "Sharpness",
  0xa431: "BodySerialNumber",
  0xa432: "LensSpecification",
  0xa433: "LensMake",
  0xa434: "LensModel",
  0xa435: "LensSerialNumber",
};

const GPS_TAGS: Record<number, string> = {
  0x0000: "GPSVersionID",
  0x0001: "GPSLatitudeRef",
  0x0002: "GPSLatitude",
  0x0003: "GPSLongitudeRef",
  0x0004: "GPSLongitude",
  0x0005: "GPSAltitudeRef",
  0x0006: "GPSAltitude",
  0x0007: "GPSTimeStamp",
  0x0011: "GPSImgDirection",
  0x000d: "GPSSpeed",
  0x0012: "GPSMapDatum",
  0x001d: "GPSDateStamp",
};

function readTiffValue(
  view: DataView,
  offset: number,
  type: number,
  count: number,
  tiffStart: number,
  littleEndian: boolean,
): unknown {
  switch (type) {
    case 1: // BYTE
    case 7: // UNDEFINED
      if (count === 1) return view.getUint8(offset);
      if (count <= 4) {
        const arr: number[] = [];
        for (let i = 0; i < count; i++) arr.push(view.getUint8(offset + i));
        return arr;
      }
      {
        const valOffset = tiffStart + view.getUint32(offset, littleEndian);
        if (valOffset + count <= view.byteLength) {
          const arr: number[] = [];
          for (let i = 0; i < count; i++) arr.push(view.getUint8(valOffset + i));
          return arr;
        }
      }
      return null;

    case 2: { // ASCII String
      let stringOffset = offset;
      if (count > 4) {
        stringOffset = tiffStart + view.getUint32(offset, littleEndian);
      }
      if (stringOffset + count <= view.byteLength) {
        let str = "";
        for (let i = 0; i < count; i++) {
          const code = view.getUint8(stringOffset + i);
          if (code === 0) break;
          str += String.fromCharCode(code);
        }
        return str.trim();
      }
      return "";
    }

    case 3: // SHORT (Uint16)
      if (count === 1) return view.getUint16(offset, littleEndian);
      {
        const valOffset =
          count > 2
            ? tiffStart + view.getUint32(offset, littleEndian)
            : offset;
        const arr: number[] = [];
        for (let i = 0; i < count; i++) {
          if (valOffset + i * 2 + 2 <= view.byteLength) {
            arr.push(view.getUint16(valOffset + i * 2, littleEndian));
          }
        }
        return arr;
      }

    case 4: // LONG (Uint32)
      if (count === 1) return view.getUint32(offset, littleEndian);
      {
        const valOffset = tiffStart + view.getUint32(offset, littleEndian);
        const arr: number[] = [];
        for (let i = 0; i < count; i++) {
          if (valOffset + i * 4 + 4 <= view.byteLength) {
            arr.push(view.getUint32(valOffset + i * 4, littleEndian));
          }
        }
        return arr;
      }

    case 5: // RATIONAL (Two Uint32: numerator / denominator)
    case 10: { // SRATIONAL (Two Int32)
      const rationalOffset = tiffStart + view.getUint32(offset, littleEndian);
      if (count === 1) {
        if (rationalOffset + 8 <= view.byteLength) {
          const num =
            type === 5
              ? view.getUint32(rationalOffset, littleEndian)
              : view.getInt32(rationalOffset, littleEndian);
          const den =
            type === 5
              ? view.getUint32(rationalOffset + 4, littleEndian)
              : view.getInt32(rationalOffset + 4, littleEndian);
          return den === 0 ? 0 : { num, den, val: num / den };
        }
        return null;
      }
      {
        const arr: Array<{ num: number; den: number; val: number }> = [];
        for (let i = 0; i < count; i++) {
          if (rationalOffset + i * 8 + 8 <= view.byteLength) {
            const num =
              type === 5
                ? view.getUint32(rationalOffset + i * 8, littleEndian)
                : view.getInt32(rationalOffset + i * 8, littleEndian);
            const den =
              type === 5
                ? view.getUint32(rationalOffset + i * 8 + 4, littleEndian)
                : view.getInt32(rationalOffset + i * 8 + 4, littleEndian);
            arr.push(den === 0 ? { num: 0, den: 1, val: 0 } : { num, den, val: num / den });
          }
        }
        return arr;
      }
    }

    default:
      return null;
  }
}

function parseIFD(
  view: DataView,
  ifdOffset: number,
  tiffStart: number,
  littleEndian: boolean,
  tagMap: Record<number, string>,
): { entries: Record<string, unknown>; exifPointer?: number; gpsPointer?: number } {
  const result: Record<string, unknown> = {};
  let exifPointer: number | undefined;
  let gpsPointer: number | undefined;

  if (ifdOffset + 2 > view.byteLength) return { entries: result };

  const numEntries = view.getUint16(ifdOffset, littleEndian);
  let offset = ifdOffset + 2;

  for (let i = 0; i < numEntries; i++) {
    if (offset + 12 > view.byteLength) break;

    const tag = view.getUint16(offset, littleEndian);
    const type = view.getUint16(offset + 2, littleEndian);
    const count = view.getUint32(offset + 4, littleEndian);
    const valOffset = offset + 8;

    if (tag === 0x8769) {
      exifPointer = view.getUint32(valOffset, littleEndian);
    } else if (tag === 0x8825) {
      gpsPointer = view.getUint32(valOffset, littleEndian);
    } else {
      const tagName = tagMap[tag] || `Tag_0x${tag.toString(16).padStart(4, "0").toUpperCase()}`;
      const val = readTiffValue(view, valOffset, type, count, tiffStart, littleEndian);
      if (val !== null && val !== undefined) {
        result[tagName] = val;
      }
    }

    offset += 12;
  }

  return { entries: result, exifPointer, gpsPointer };
}

export function parseTiffExif(
  buffer: ArrayBuffer,
  tiffStart: number,
): { exif?: ExifMetadata; gps?: GpsMetadata; resolution?: { x?: number; y?: number; unit?: number } } {
  try {
    const view = new DataView(buffer);
    if (tiffStart + 8 > view.byteLength) return {};

    const byteOrder = view.getUint16(tiffStart, false);
    let littleEndian = false;
    if (byteOrder === 0x4949) {
      littleEndian = true;
    } else if (byteOrder === 0x4d4d) {
      littleEndian = false;
    } else {
      return {};
    }

    const firstIFDOffset = view.getUint32(tiffStart + 4, littleEndian);
    if (tiffStart + firstIFDOffset >= view.byteLength) return {};

    // Parse IFD0
    const ifd0 = parseIFD(view, tiffStart + firstIFDOffset, tiffStart, littleEndian, EXIF_TAGS);
    let allEntries: Record<string, unknown> = { ...ifd0.entries };

    // Parse Exif SubIFD
    if (ifd0.exifPointer && tiffStart + ifd0.exifPointer < view.byteLength) {
      const subIFD = parseIFD(view, tiffStart + ifd0.exifPointer, tiffStart, littleEndian, EXIF_TAGS);
      allEntries = { ...allEntries, ...subIFD.entries };
    }

    // Parse GPS IFD
    let gpsResult: GpsMetadata | undefined;
    if (ifd0.gpsPointer && tiffStart + ifd0.gpsPointer < view.byteLength) {
      const gpsIFD = parseIFD(view, tiffStart + ifd0.gpsPointer, tiffStart, littleEndian, GPS_TAGS);
      const gpsRaw = gpsIFD.entries;

      if (gpsRaw.GPSLatitude && gpsRaw.GPSLongitude) {
        const latRef = (gpsRaw.GPSLatitudeRef as string) || "N";
        const lonRef = (gpsRaw.GPSLongitudeRef as string) || "E";

        const latParts = gpsRaw.GPSLatitude as Array<{ val: number }>;
        const lonParts = gpsRaw.GPSLongitude as Array<{ val: number }>;

        if (Array.isArray(latParts) && Array.isArray(lonParts) && latParts.length >= 3 && lonParts.length >= 3) {
          const latDeg = latParts[0].val + latParts[1].val / 60 + latParts[2].val / 3600;
          const lonDeg = lonParts[0].val + lonParts[1].val / 60 + lonParts[2].val / 3600;

          const latFinal = latRef === "S" ? -latDeg : latDeg;
          const lonFinal = lonRef === "W" ? -lonDeg : lonDeg;

          const latDms = `${Math.floor(latParts[0].val)}° ${Math.floor(latParts[1].val)}' ${latParts[2].val.toFixed(2)}" ${latRef}`;
          const lonDms = `${Math.floor(lonParts[0].val)}° ${Math.floor(lonParts[1].val)}' ${lonParts[2].val.toFixed(2)}" ${lonRef}`;

          let altStr: string | undefined;
          if (gpsRaw.GPSAltitude) {
            const altVal = typeof gpsRaw.GPSAltitude === "object" && "val" in (gpsRaw.GPSAltitude as { val: number })
              ? (gpsRaw.GPSAltitude as { val: number }).val
              : Number(gpsRaw.GPSAltitude);
            const altRef = gpsRaw.GPSAltitudeRef === 1 ? -1 : 1;
            altStr = `${(altVal * altRef).toFixed(1)} m (${((altVal * altRef) * 3.28084).toFixed(1)} ft)`;
          }

          let dateStr: string | undefined;
          if (gpsRaw.GPSDateStamp) {
            dateStr = String(gpsRaw.GPSDateStamp);
          }

          gpsResult = {
            hasGps: true,
            latitude: Number(latFinal.toFixed(6)),
            longitude: Number(lonFinal.toFixed(6)),
            latitudeDms: latDms,
            longitudeDms: lonDms,
            altitude: altStr,
            dateTime: dateStr,
            direction: gpsRaw.GPSImgDirection ? `${(gpsRaw.GPSImgDirection as { val: number }).val || gpsRaw.GPSImgDirection}°` : undefined,
            speed: gpsRaw.GPSSpeed ? `${(gpsRaw.GPSSpeed as { val: number }).val || gpsRaw.GPSSpeed} km/h` : undefined,
            mapDatum: gpsRaw.GPSMapDatum ? String(gpsRaw.GPSMapDatum) : "WGS-84",
          };
        }
      }
    }

    const rawTags: Record<string, string> = {};
    for (const [k, v] of Object.entries(allEntries)) {
      if (typeof v === "object" && v !== null && "val" in v) {
        rawTags[k] = String((v as { val: number }).val);
      } else if (Array.isArray(v)) {
        rawTags[k] = v.map((item) => (typeof item === "object" && "val" in item ? (item as { val: number }).val : item)).join(", ");
      } else {
        rawTags[k] = String(v);
      }
    }

    const formatRational = (val: unknown): string | undefined => {
      if (!val) return undefined;
      if (typeof val === "object" && "num" in (val as { num: number; den: number; val: number })) {
        const r = val as { num: number; den: number; val: number };
        if (r.den === 1) return String(r.num);
        if (r.num < r.den && r.num > 0) return `1/${Math.round(r.den / r.num)}s`;
        return `${r.val.toFixed(2)}`;
      }
      return String(val);
    };

    const exifData: ExifMetadata = {
      make: allEntries.Make ? String(allEntries.Make) : undefined,
      model: allEntries.Model ? String(allEntries.Model) : undefined,
      lensMake: allEntries.LensMake ? String(allEntries.LensMake) : undefined,
      lensModel: allEntries.LensModel ? String(allEntries.LensModel) : undefined,
      lensSerialNumber: allEntries.LensSerialNumber ? String(allEntries.LensSerialNumber) : undefined,
      bodySerialNumber: allEntries.BodySerialNumber ? String(allEntries.BodySerialNumber) : undefined,
      software: allEntries.Software ? String(allEntries.Software) : undefined,
      dateTime: allEntries.DateTime ? String(allEntries.DateTime) : undefined,
      dateTimeOriginal: allEntries.DateTimeOriginal ? String(allEntries.DateTimeOriginal) : undefined,
      dateTimeDigitized: allEntries.DateTimeDigitized ? String(allEntries.DateTimeDigitized) : undefined,
      artist: allEntries.Artist ? String(allEntries.Artist) : undefined,
      copyright: allEntries.Copyright ? String(allEntries.Copyright) : undefined,
      orientation: allEntries.Orientation ? getOrientationLabel(Number(allEntries.Orientation)) : undefined,
      exposureTime: formatRational(allEntries.ExposureTime),
      fNumber: allEntries.FNumber ? `f/${(allEntries.FNumber as { val: number }).val || allEntries.FNumber}` : undefined,
      iso: allEntries.ISO ? Number(allEntries.ISO) : undefined,
      focalLength: allEntries.FocalLength ? `${((allEntries.FocalLength as { val: number }).val || allEntries.FocalLength)} mm` : undefined,
      focalLength35mm: allEntries.FocalLengthIn35mmFilm ? `${allEntries.FocalLengthIn35mmFilm} mm` : undefined,
      exposureBias: allEntries.ExposureBiasValue ? `${(allEntries.ExposureBiasValue as { val: number }).val || allEntries.ExposureBiasValue} EV` : undefined,
      meteringMode: allEntries.MeteringMode ? getMeteringModeLabel(Number(allEntries.MeteringMode)) : undefined,
      flash: allEntries.Flash ? getFlashLabel(Number(allEntries.Flash)) : undefined,
      whiteBalance: allEntries.WhiteBalance ? (allEntries.WhiteBalance === 1 ? "Manual" : "Auto") : undefined,
      sceneCaptureType: allEntries.SceneCaptureType ? getSceneCaptureLabel(Number(allEntries.SceneCaptureType)) : undefined,
      exposureProgram: allEntries.ExposureProgram ? getExposureProgramLabel(Number(allEntries.ExposureProgram)) : undefined,
      colorSpace: allEntries.ColorSpace ? (allEntries.ColorSpace === 1 ? "sRGB" : "Uncalibrated / Adobe RGB") : undefined,
      userComment: allEntries.UserComment ? String(allEntries.UserComment) : undefined,
      rawTags,
    };

    let resInfo: { x?: number; y?: number; unit?: number } | undefined;
    if (allEntries.XResolution && allEntries.YResolution) {
      const x = typeof allEntries.XResolution === "object" && "val" in (allEntries.XResolution as { val: number })
        ? (allEntries.XResolution as { val: number }).val
        : Number(allEntries.XResolution);
      const y = typeof allEntries.YResolution === "object" && "val" in (allEntries.YResolution as { val: number })
        ? (allEntries.YResolution as { val: number }).val
        : Number(allEntries.YResolution);
      const u = allEntries.ResolutionUnit ? Number(allEntries.ResolutionUnit) : 2;
      resInfo = { x: Math.round(x), y: Math.round(y), unit: u };
    }

    return {
      exif: Object.keys(rawTags).length > 0 ? exifData : undefined,
      gps: gpsResult,
      resolution: resInfo,
    };
  } catch {
    return {};
  }
}

function getOrientationLabel(code: number): string {
  switch (code) {
    case 1: return "Top-Left (Normal 0°)";
    case 2: return "Top-Right (Mirrored horizontal)";
    case 3: return "Bottom-Right (Rotated 180°)";
    case 4: return "Bottom-Left (Mirrored vertical)";
    case 5: return "Left-Top (Mirrored horizontal & 270° CW)";
    case 6: return "Right-Top (Rotated 90° CW)";
    case 7: return "Right-Bottom (Mirrored horizontal & 90° CW)";
    case 8: return "Left-Bottom (Rotated 270° CW)";
    default: return `Orientation #${code}`;
  }
}

function getMeteringModeLabel(code: number): string {
  switch (code) {
    case 1: return "Average";
    case 2: return "Center-weighted average";
    case 3: return "Spot";
    case 4: return "Multi-spot";
    case 5: return "Pattern / Multi-segment";
    case 6: return "Partial";
    default: return `Mode #${code}`;
  }
}

function getFlashLabel(code: number): string {
  if (code === 0) return "No Flash";
  if ((code & 1) === 1) return "Flash Fired";
  return "Flash Did Not Fire";
}

function getExposureProgramLabel(code: number): string {
  switch (code) {
    case 1: return "Manual";
    case 2: return "Normal Program";
    case 3: return "Aperture Priority";
    case 4: return "Shutter Priority";
    case 5: return "Creative Program (Depth of Field)";
    case 6: return "Action Program (High-speed)";
    case 7: return "Portrait Mode";
    case 8: return "Landscape Mode";
    default: return `Program #${code}`;
  }
}

function getSceneCaptureLabel(code: number): string {
  switch (code) {
    case 0: return "Standard";
    case 1: return "Landscape";
    case 2: return "Portrait";
    case 3: return "Night Scene";
    default: return `Scene #${code}`;
  }
}

// ==========================================
// IPTC & XMP PARSERS
// ==========================================

export function parseIptc(buffer: ArrayBuffer, offset: number, length: number): IptcMetadata | undefined {
  try {
    const view = new DataView(buffer, offset, length);
    const result: IptcMetadata = {};
    const keywords: string[] = [];
    const suppCategories: string[] = [];

    let pos = 0;
    while (pos < length - 5) {
      if (view.getUint8(pos) === 0x1c && view.getUint8(pos + 1) === 0x02) {
        const tag = view.getUint8(pos + 2);
        const tagLen = view.getUint16(pos + 3, false);
        pos += 5;

        if (pos + tagLen <= length) {
          let str = "";
          for (let i = 0; i < tagLen; i++) {
            str += String.fromCharCode(view.getUint8(pos + i));
          }
          str = str.trim();

          switch (tag) {
            case 0x05: result.title = str; break;
            case 0x19: keywords.push(str); break;
            case 0x50: result.creator = str; break;
            case 0x55: result.bylineTitle = str; break;
            case 0x5a: result.city = str; break;
            case 0x5f: result.state = str; break;
            case 0x65: result.country = str; break;
            case 0x69: result.headline = str; break;
            case 0x73: result.source = str; break;
            case 0x74: result.credit = str; break;
            case 0x76: result.copyright = str; break;
            case 0x78: result.caption = str; break;
            case 0x0f: result.category = str; break;
            case 0x14: suppCategories.push(str); break;
          }
        }
        pos += tagLen;
      } else {
        pos++;
      }
    }

    if (keywords.length > 0) result.keywords = keywords;
    if (suppCategories.length > 0) result.supplementalCategories = suppCategories;

    return Object.keys(result).length > 0 ? result : undefined;
  } catch {
    return undefined;
  }
}

export function parseXmpXml(xmlString: string): XmpMetadata | undefined {
  try {
    const result: XmpMetadata = { rawFields: {} };
    const keywords: string[] = [];

    // Extract creator
    const creatorMatch = xmlString.match(/<dc:creator>[\s\S]*?<rdf:li>(.*?)<\/rdf:li>/i) ||
      xmlString.match(/dc:creator="([^"]+)"/i);
    if (creatorMatch) result.creator = creatorMatch[1].trim();

    // Extract title
    const titleMatch = xmlString.match(/<dc:title>[\s\S]*?<rdf:li[^>]*>(.*?)<\/rdf:li>/i) ||
      xmlString.match(/dc:title="([^"]+)"/i);
    if (titleMatch) result.title = titleMatch[1].trim();

    // Extract description
    const descMatch = xmlString.match(/<dc:description>[\s\S]*?<rdf:li[^>]*>(.*?)<\/rdf:li>/i) ||
      xmlString.match(/dc:description="([^"]+)"/i);
    if (descMatch) result.description = descMatch[1].trim();

    // Extract rights
    const rightsMatch = xmlString.match(/<dc:rights>[\s\S]*?<rdf:li[^>]*>(.*?)<\/rdf:li>/i) ||
      xmlString.match(/dc:rights="([^"]+)"/i);
    if (rightsMatch) result.rights = rightsMatch[1].trim();

    // Extract keywords
    const subjectMatches = xmlString.matchAll(/<dc:subject>[\s\S]*?<rdf:Bag>([\s\S]*?)<\/rdf:Bag>/gi);
    for (const m of subjectMatches) {
      const items = m[1].matchAll(/<rdf:li>(.*?)<\/rdf:li>/gi);
      for (const it of items) keywords.push(it[1].trim());
    }
    if (keywords.length > 0) result.keywords = Array.from(new Set(keywords));

    // Extract creator tool / software
    const toolMatch = xmlString.match(/xmp:CreatorTool="([^"]+)"/i) ||
      xmlString.match(/<xmp:CreatorTool>(.*?)<\/xmp:CreatorTool>/i);
    if (toolMatch) result.creatorTool = toolMatch[1].trim();

    // Extract dates
    const createDateMatch = xmlString.match(/xmp:CreateDate="([^"]+)"/i) ||
      xmlString.match(/<xmp:CreateDate>(.*?)<\/xmp:CreateDate>/i);
    if (createDateMatch) result.createDate = createDateMatch[1].trim();

    const modifyDateMatch = xmlString.match(/xmp:ModifyDate="([^"]+)"/i) ||
      xmlString.match(/<xmp:ModifyDate>(.*?)<\/xmp:ModifyDate>/i);
    if (modifyDateMatch) result.modifyDate = modifyDateMatch[1].trim();

    // Extract rating
    const ratingMatch = xmlString.match(/xmp:Rating="([^"]+)"/i) ||
      xmlString.match(/<xmp:Rating>(.*?)<\/xmp:Rating>/i);
    if (ratingMatch) result.rating = Number(ratingMatch[1]);

    if (
      result.creator ||
      result.title ||
      result.description ||
      result.keywords ||
      result.rights ||
      result.creatorTool ||
      result.createDate
    ) {
      return result;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

// ==========================================
// FORMAT-SPECIFIC PARSERS
// ==========================================

export async function parseJpegSegments(buffer: ArrayBuffer): Promise<{
  exif?: ExifMetadata;
  gps?: GpsMetadata;
  iptc?: IptcMetadata;
  xmp?: XmpMetadata;
  resolution?: ResolutionMetadata;
  formatDetails: FormatSpecificMetadata;
  colorInfo: Partial<ColorMetadata>;
}> {
  const view = new DataView(buffer);
  let offset = 2; // Skip SOI (FF D8)
  const items: Array<{ label: string; value: string | number | boolean }> = [];

  let exif: ExifMetadata | undefined;
  let gps: GpsMetadata | undefined;
  let iptc: IptcMetadata | undefined;
  let xmp: XmpMetadata | undefined;
  let resolution: ResolutionMetadata = { available: false };
  const colorInfo: Partial<ColorMetadata> = { colorType: "sRGB (YCbCr)", hasAlpha: false };

  while (offset < view.byteLength - 4) {
    if (view.getUint8(offset) !== 0xff) {
      offset++;
      continue;
    }

    const marker = view.getUint8(offset + 1);
    if (marker === 0xda || marker === 0xd9) break; // SOS or EOI

    const segLength = view.getUint16(offset + 2, false);
    const segStart = offset + 4;

    // APP0: JFIF
    if (marker === 0xe0 && segLength >= 16) {
      const id = String.fromCharCode(
        view.getUint8(segStart),
        view.getUint8(segStart + 1),
        view.getUint8(segStart + 2),
        view.getUint8(segStart + 3),
      );
      if (id === "JFIF") {
        const major = view.getUint8(segStart + 5);
        const minor = view.getUint8(segStart + 6);
        const units = view.getUint8(segStart + 7); // 1 = DPI, 2 = DPCM
        const xDens = view.getUint16(segStart + 8, false);
        const yDens = view.getUint16(segStart + 10, false);

        items.push({ label: "JFIF Version", value: `${major}.${minor.toString().padStart(2, "0")}` });
        if (units === 1 && xDens > 0) {
          items.push({ label: "JFIF Resolution", value: `${xDens} × ${yDens} DPI` });
          resolution = {
            dpiX: xDens,
            dpiY: yDens,
            unit: "Inches (DPI)",
            available: true,
          };
        } else if (units === 2 && xDens > 0) {
          const dpiX = Math.round(xDens * 2.54);
          const dpiY = Math.round(yDens * 2.54);
          items.push({ label: "JFIF Resolution", value: `${xDens} × ${yDens} DPCM (${dpiX} DPI)` });
          resolution = {
            dpiX,
            dpiY,
            unit: "Centimeters (DPCM)",
            available: true,
          };
        }
      }
    }

    // APP1: EXIF or XMP
    if (marker === 0xe1) {
      const header = String.fromCharCode(
        view.getUint8(segStart),
        view.getUint8(segStart + 1),
        view.getUint8(segStart + 2),
        view.getUint8(segStart + 3),
      );
      if (header === "Exif") {
        const tiffStart = segStart + 6;
        const res = parseTiffExif(buffer, tiffStart);
        if (res.exif) exif = res.exif;
        if (res.gps) gps = res.gps;
        if (res.resolution?.x && res.resolution.y) {
          resolution = {
            dpiX: res.resolution.x,
            dpiY: res.resolution.y,
            unit: res.resolution.unit === 3 ? "Centimeters" : "Inches (DPI)",
            available: true,
          };
        }
        items.push({ label: "EXIF Block", value: "Present (APP1)" });
      } else if (segStart + 28 <= view.byteLength) {
        let xmpHeader = "";
        for (let i = 0; i < 28; i++) xmpHeader += String.fromCharCode(view.getUint8(segStart + i));
        if (xmpHeader.includes("http://ns.adobe.com/xap/1.0/")) {
          let xmpStr = "";
          for (let i = 29; i < segLength - 2; i++) {
            xmpStr += String.fromCharCode(view.getUint8(segStart + i));
          }
          xmp = parseXmpXml(xmpStr);
          items.push({ label: "XMP Block", value: "Present (APP1)" });
        }
      }
    }

    // APP2: ICC Profile
    if (marker === 0xe2 && segLength >= 14) {
      let iccHeader = "";
      for (let i = 0; i < 12; i++) iccHeader += String.fromCharCode(view.getUint8(segStart + i));
      if (iccHeader.startsWith("ICC_PROFILE")) {
        colorInfo.hasIccProfile = true;
        items.push({ label: "ICC Color Profile", value: "Embedded Profile (APP2)" });
      }
    }

    // APP13: Photoshop IPTC
    if (marker === 0xed) {
      let psHeader = "";
      for (let i = 0; i < 9; i++) psHeader += String.fromCharCode(view.getUint8(segStart + i));
      if (psHeader.startsWith("Photoshop")) {
        const iptcData = parseIptc(buffer, segStart + 14, segLength - 16);
        if (iptcData) {
          iptc = iptcData;
          items.push({ label: "IPTC-NAA Metadata", value: "Present (APP13 Photoshop)" });
        }
      }
    }

    // SOF0 (Baseline) or SOF2 (Progressive)
    if (marker === 0xc0 || marker === 0xc2) {
      const precision = view.getUint8(segStart);
      const components = view.getUint8(segStart + 5);

      items.push({ label: "JPEG Encoding", value: marker === 0xc2 ? "Progressive DCT" : "Baseline Sequential DCT" });
      items.push({ label: "Sample Precision", value: `${precision} bits/sample` });
      items.push({ label: "Color Components", value: components === 1 ? "1 (Grayscale)" : components === 3 ? "3 (YCbCr / RGB)" : `${components} Channels` });

      colorInfo.bitDepth = precision;
      colorInfo.channels = components;
      colorInfo.colorType = components === 1 ? "Grayscale" : "Truecolor (YCbCr)";
    }

    offset += 2 + segLength;
  }

  return {
    exif,
    gps,
    iptc,
    xmp,
    resolution,
    formatDetails: {
      format: "JPEG Markers",
      items,
    },
    colorInfo,
  };
}

export async function parsePngChunks(buffer: ArrayBuffer): Promise<{
  exif?: ExifMetadata;
  resolution?: ResolutionMetadata;
  colorInfo: Partial<ColorMetadata>;
  formatDetails: FormatSpecificMetadata;
  frameCount?: number;
}> {
  const view = new DataView(buffer);
  let offset = 8; // Skip PNG header
  const items: Array<{ label: string; value: string | number | boolean }> = [];
  const textComments: Record<string, string> = {};

  let exif: ExifMetadata | undefined;
  let resolution: ResolutionMetadata = { available: false };
  const colorInfo: Partial<ColorMetadata> = { colorType: "RGBA", hasAlpha: false };
  let frameCount = 1;

  while (offset < view.byteLength - 8) {
    const chunkLength = view.getUint32(offset, false);
    const chunkType = String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7),
    );
    const dataOffset = offset + 8;

    if (chunkType === "IHDR" && chunkLength >= 13) {
      const bitDepth = view.getUint8(dataOffset + 8);
      const colorType = view.getUint8(dataOffset + 9);
      const compression = view.getUint8(dataOffset + 10);
      const filter = view.getUint8(dataOffset + 11);
      const interlace = view.getUint8(dataOffset + 12);

      let colorTypeName = "Truecolor";
      let hasAlpha = false;
      let channels = 3;

      if (colorType === 0) {
        colorTypeName = "Grayscale";
        channels = 1;
      } else if (colorType === 2) {
        colorTypeName = "Truecolor (RGB)";
        channels = 3;
      } else if (colorType === 3) {
        colorTypeName = "Indexed-color (Palette)";
        channels = 1;
      } else if (colorType === 4) {
        colorTypeName = "Grayscale with Alpha";
        hasAlpha = true;
        channels = 2;
      } else if (colorType === 6) {
        colorTypeName = "Truecolor with Alpha (RGBA)";
        hasAlpha = true;
        channels = 4;
      }

      colorInfo.bitDepth = bitDepth;
      colorInfo.colorType = colorTypeName;
      colorInfo.hasAlpha = hasAlpha;
      colorInfo.channels = channels;

      items.push({ label: "PNG Bit Depth", value: `${bitDepth} bits per channel` });
      items.push({ label: "PNG Color Type", value: `${colorTypeName} (Type ${colorType})` });
      items.push({ label: "Compression Method", value: compression === 0 ? "Deflate/Inflate (32KB window)" : `Method ${compression}` });
      items.push({ label: "Filter Method", value: filter === 0 ? "Adaptive Filtering (Standard)" : `Filter ${filter}` });
      items.push({ label: "Interlace Method", value: interlace === 1 ? "Adam7 Interlaced" : "None (Non-interlaced)" });
    } else if (chunkType === "pHYs" && chunkLength >= 9) {
      const ppuX = view.getUint32(dataOffset, false);
      const ppuY = view.getUint32(dataOffset + 4, false);
      const unit = view.getUint8(dataOffset + 8); // 1 = meter

      if (unit === 1 && ppuX > 0) {
        const dpiX = Math.round(ppuX * 0.0254);
        const dpiY = Math.round(ppuY * 0.0254);
        items.push({ label: "PNG Pixel Density", value: `${ppuX} × ${ppuY} ppm (${dpiX} DPI)` });
        resolution = {
          dpiX,
          dpiY,
          unit: "Meters (pHYs)",
          available: true,
        };
      }
    } else if (chunkType === "tEXt" || chunkType === "iTXt") {
      let text = "";
      for (let i = 0; i < chunkLength; i++) text += String.fromCharCode(view.getUint8(dataOffset + i));
      const nullPos = text.indexOf("\0");
      if (nullPos > 0) {
        const key = text.substring(0, nullPos);
        const val = text.substring(nullPos + 1).trim();
        if (key && val) {
          textComments[key] = val;
          items.push({ label: `PNG Text (${key})`, value: val });
        }
      }
    } else if (chunkType === "gAMA" && chunkLength >= 4) {
      const gamma = view.getUint32(dataOffset, false) / 100000;
      items.push({ label: "Gamma Value", value: gamma.toFixed(4) });
    } else if (chunkType === "sRGB" && chunkLength >= 1) {
      items.push({ label: "sRGB Rendering Intent", value: "Standard sRGB Color Space" });
      colorInfo.colorSpace = "sRGB";
    } else if (chunkType === "iCCP") {
      colorInfo.hasIccProfile = true;
      items.push({ label: "Embedded ICC Profile", value: "iCCP Chunk Present" });
    } else if (chunkType === "eXIf" && chunkLength >= 8) {
      const res = parseTiffExif(buffer, dataOffset);
      if (res.exif) exif = res.exif;
      items.push({ label: "eXIf Chunk", value: "Embedded EXIF Chunk" });
    } else if (chunkType === "acTL") {
      const numFrames = view.getUint32(dataOffset, false);
      const numPlays = view.getUint32(dataOffset + 4, false);
      frameCount = numFrames;
      items.push({ label: "APNG Animation", value: `Yes (${numFrames} frames, loop: ${numPlays === 0 ? "Infinite" : numPlays})` });
    }

    if (chunkType === "IEND") break;
    offset += 12 + chunkLength; // 4 len + 4 type + data + 4 crc
  }

  return {
    exif,
    resolution,
    colorInfo,
    formatDetails: {
      format: "PNG Chunks",
      items,
    },
    frameCount: frameCount > 1 ? frameCount : 1,
  };
}

export async function parseGifBlocks(buffer: ArrayBuffer): Promise<{
  colorInfo: Partial<ColorMetadata>;
  formatDetails: FormatSpecificMetadata;
  frameCount: number;
  loopCount?: string;
  durationMs?: number;
}> {
  const view = new DataView(buffer);
  const items: Array<{ label: string; value: string | number | boolean }> = [];
  let frameCount = 0;
  let totalDurationMs = 0;
  let loopCount = "Infinite";

  const version = String.fromCharCode(view.getUint8(3), view.getUint8(4), view.getUint8(5));
  items.push({ label: "GIF Version", value: version });

  const packed = view.getUint8(10);
  const gctFlag = (packed & 0x80) !== 0;
  const colorRes = ((packed & 0x70) >> 4) + 1;
  const gctSize = gctFlag ? 1 << ((packed & 0x07) + 1) : 0;

  items.push({ label: "Global Color Table", value: gctFlag ? `Present (${gctSize} colors, ${colorRes}-bit resolution)` : "None" });

  let offset = 13;
  if (gctFlag) offset += gctSize * 3;

  while (offset < view.byteLength) {
    const blockType = view.getUint8(offset);

    if (blockType === 0x3b) break; // Trailer

    if (blockType === 0x21) {
      // Extension
      const label = view.getUint8(offset + 1);
      offset += 2;

      if (label === 0xf9) {
        // Graphic Control Extension
        const blockSize = view.getUint8(offset);
        if (blockSize >= 4) {
          const delay = view.getUint16(offset + 2, true); // in 1/100s
          totalDurationMs += delay * 10;
        }
        offset += blockSize + 1;
        while (offset < view.byteLength && view.getUint8(offset) !== 0) {
          offset += view.getUint8(offset) + 1;
        }
        offset++; // Skip terminator
      } else if (label === 0xff) {
        // Application Extension
        const blockSize = view.getUint8(offset);
        let appName = "";
        for (let i = 0; i < blockSize; i++) appName += String.fromCharCode(view.getUint8(offset + 1 + i));
        offset += blockSize + 1;

        if (appName.startsWith("NETSCAPE2.0") || appName.startsWith("ANIMEXTS1.0")) {
          const subBlockSize = view.getUint8(offset);
          if (subBlockSize === 3 && view.getUint8(offset + 1) === 1) {
            const loops = view.getUint16(offset + 2, true);
            loopCount = loops === 0 ? "Infinite" : `${loops} times`;
            items.push({ label: "Animation Loop Count", value: loopCount });
          }
        }
        while (offset < view.byteLength && view.getUint8(offset) !== 0) {
          offset += view.getUint8(offset) + 1;
        }
        offset++;
      } else {
        while (offset < view.byteLength && view.getUint8(offset) !== 0) {
          offset += view.getUint8(offset) + 1;
        }
        offset++;
      }
    } else if (blockType === 0x2c) {
      // Image Descriptor (Frame)
      frameCount++;
      const imgPacked = view.getUint8(offset + 9);
      const lctFlag = (imgPacked & 0x80) !== 0;
      const lctSize = lctFlag ? 1 << ((imgPacked & 0x07) + 1) : 0;

      offset += 10;
      if (lctFlag) offset += lctSize * 3;
      offset++; // Initial code size

      while (offset < view.byteLength && view.getUint8(offset) !== 0) {
        offset += view.getUint8(offset) + 1;
      }
      offset++;
    } else {
      offset++;
    }
  }

  items.push({ label: "Total Frame Count", value: frameCount });
  if (frameCount > 1) {
    items.push({ label: "Total Animation Duration", value: `${(totalDurationMs / 1000).toFixed(2)} seconds` });
  }

  return {
    colorInfo: {
      colorType: "Indexed Color (GIF Palette)",
      bitDepth: colorRes,
      hasAlpha: true,
      channels: 1,
      indexedColors: gctSize,
    },
    formatDetails: {
      format: "GIF Descriptors",
      items,
    },
    frameCount: Math.max(1, frameCount),
    loopCount: frameCount > 1 ? loopCount : undefined,
    durationMs: totalDurationMs > 0 ? totalDurationMs : undefined,
  };
}

export async function parseWebpChunks(buffer: ArrayBuffer): Promise<{
  exif?: ExifMetadata;
  xmp?: XmpMetadata;
  colorInfo: Partial<ColorMetadata>;
  formatDetails: FormatSpecificMetadata;
  frameCount?: number;
}> {
  const view = new DataView(buffer);
  let offset = 12;
  const items: Array<{ label: string; value: string | number | boolean }> = [];

  let exif: ExifMetadata | undefined;
  let xmp: XmpMetadata | undefined;
  const colorInfo: Partial<ColorMetadata> = { colorType: "RGB", hasAlpha: false };
  let frameCount = 1;

  while (offset < view.byteLength - 8) {
    const chunkFourCC = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3),
    );
    const chunkSize = view.getUint32(offset + 4, true);
    const dataOffset = offset + 8;

    if (chunkFourCC === "VP8 ") {
      items.push({ label: "WebP Format", value: "Lossy VP8 Bitstream" });
    } else if (chunkFourCC === "VP8L") {
      items.push({ label: "WebP Format", value: "Lossless VP8L Bitstream" });
      colorInfo.hasAlpha = true;
    } else if (chunkFourCC === "VP8X" && chunkSize >= 10) {
      const flags = view.getUint8(dataOffset);
      const hasIcc = (flags & 0x20) !== 0;
      const hasAlpha = (flags & 0x10) !== 0;
      const hasExif = (flags & 0x08) !== 0;
      const hasXmp = (flags & 0x04) !== 0;
      const hasAnim = (flags & 0x02) !== 0;

      colorInfo.hasAlpha = hasAlpha;
      colorInfo.hasIccProfile = hasIcc;

      items.push({ label: "WebP Container", value: "VP8X Extended Header" });
      items.push({ label: "Alpha Channel", value: hasAlpha ? "Present" : "None" });
      items.push({ label: "ICC Profile", value: hasIcc ? "Embedded" : "None" });
      items.push({ label: "EXIF Metadata", value: hasExif ? "Embedded" : "None" });
      items.push({ label: "XMP Metadata", value: hasXmp ? "Embedded" : "None" });
      items.push({ label: "Animated WebP", value: hasAnim ? "Yes" : "No" });
    } else if (chunkFourCC === "EXIF" && chunkSize > 6) {
      const res = parseTiffExif(buffer, dataOffset);
      if (res.exif) exif = res.exif;
      items.push({ label: "EXIF Chunk", value: "Present" });
    } else if (chunkFourCC === "XMP ") {
      let xmpStr = "";
      for (let i = 0; i < chunkSize; i++) xmpStr += String.fromCharCode(view.getUint8(dataOffset + i));
      xmp = parseXmpXml(xmpStr);
      items.push({ label: "XMP Chunk", value: "Present" });
    } else if (chunkFourCC === "ANMF") {
      frameCount++;
    }

    offset += 8 + chunkSize + (chunkSize % 2); // 4-byte aligned
  }

  return {
    exif,
    xmp,
    colorInfo,
    formatDetails: {
      format: "WebP Chunks",
      items,
    },
    frameCount: frameCount > 1 ? frameCount : 1,
  };
}

// ==========================================
// MASTER METADATA EXTRACTOR
// ==========================================

export async function extractImageMetadata(file: File): Promise<CompleteImageMetadata> {
  const buffer = await file.arrayBuffer();
  const magic = await validateImageMagic(file);
  const ext = getFileExtension(file.name);

  // Load preview and basic dimensions via browser Image object
  const objectUrl = URL.createObjectURL(file);
  let naturalWidth = 0;
  let naturalHeight = 0;

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Image decode failed"));
      el.src = objectUrl;
    });
    naturalWidth = img.naturalWidth || 1;
    naturalHeight = img.naturalHeight || 1;
  } catch {
    naturalWidth = 1;
    naturalHeight = 1;
  }

  // Common basic metadata
  const totalPixels = naturalWidth * naturalHeight;
  const megapixels = (totalPixels / 1000000).toFixed(2);
  const { ratio: aspectRatio, decimal: aspectRatioDecimal } = calculateAspectRatio(
    naturalWidth,
    naturalHeight,
  );

  let exifInfo: ExifMetadata | undefined;
  let gpsInfo: GpsMetadata | undefined;
  let iptcInfo: IptcMetadata | undefined;
  let xmpInfo: XmpMetadata | undefined;
  let resolutionInfo: ResolutionMetadata = { available: false };
  let colorInfo: ColorMetadata = {
    colorType: "RGB",
    hasAlpha: false,
    hasIccProfile: false,
    bitDepth: 8,
    channels: 3,
  };
  let formatSpecific: FormatSpecificMetadata | undefined;
  let frameCount = 1;
  let loopCount: string | undefined;
  let durationMs: number | undefined;

  // Run format-specific binary parser
  if (ext === "jpg" || ext === "jpeg" || file.type === "image/jpeg") {
    const res = await parseJpegSegments(buffer);
    exifInfo = res.exif;
    gpsInfo = res.gps;
    iptcInfo = res.iptc;
    xmpInfo = res.xmp;
    if (res.resolution?.available) resolutionInfo = res.resolution;
    colorInfo = { ...colorInfo, ...res.colorInfo };
    formatSpecific = res.formatDetails;
  } else if (ext === "png" || file.type === "image/png") {
    const res = await parsePngChunks(buffer);
    exifInfo = res.exif;
    if (res.resolution?.available) resolutionInfo = res.resolution;
    colorInfo = { ...colorInfo, ...res.colorInfo };
    formatSpecific = res.formatDetails;
    frameCount = res.frameCount || 1;
  } else if (ext === "gif" || file.type === "image/gif") {
    const res = await parseGifBlocks(buffer);
    colorInfo = { ...colorInfo, ...res.colorInfo };
    formatSpecific = res.formatDetails;
    frameCount = res.frameCount;
    loopCount = res.loopCount;
    durationMs = res.durationMs;
  } else if (ext === "webp" || file.type === "image/webp") {
    const res = await parseWebpChunks(buffer);
    exifInfo = res.exif;
    xmpInfo = res.xmp;
    colorInfo = { ...colorInfo, ...res.colorInfo };
    formatSpecific = res.formatDetails;
    frameCount = res.frameCount || 1;
  } else if (ext === "tif" || ext === "tiff") {
    const res = parseTiffExif(buffer, 0);
    exifInfo = res.exif;
    gpsInfo = res.gps;
    if (res.resolution?.x && res.resolution.y) {
      resolutionInfo = {
        dpiX: res.resolution.x,
        dpiY: res.resolution.y,
        unit: res.resolution.unit === 3 ? "Centimeters" : "Inches (DPI)",
        available: true,
      };
    }
  }

  // Calculate physical print size if DPI is available
  if (resolutionInfo.available && resolutionInfo.dpiX && resolutionInfo.dpiY && resolutionInfo.dpiX > 0 && resolutionInfo.dpiY > 0) {
    const inW = naturalWidth / resolutionInfo.dpiX;
    const inH = naturalHeight / resolutionInfo.dpiY;
    const cmW = inW * 2.54;
    const cmH = inH * 2.54;

    resolutionInfo.printWidthInches = inW.toFixed(2);
    resolutionInfo.printHeightInches = inH.toFixed(2);
    resolutionInfo.printWidthCm = cmW.toFixed(2);
    resolutionInfo.printHeightCm = cmH.toFixed(2);
  }

  // Privacy Check & Sensitivity Analysis
  const privacyItems: PrivacyCheckSummary["items"] = [];

  // GPS Location
  if (gpsInfo?.hasGps && gpsInfo.latitude !== undefined && gpsInfo.longitude !== undefined) {
    privacyItems.push({
      category: "GPS Location",
      detected: true,
      value: `${gpsInfo.latitudeDms}, ${gpsInfo.longitudeDms} (${gpsInfo.latitude}, ${gpsInfo.longitude})`,
      warningLevel: "high",
    });
  } else {
    privacyItems.push({
      category: "GPS Location",
      detected: false,
      value: "Not detected",
      warningLevel: "none",
    });
  }

  // Camera & Device Information
  if (exifInfo?.make || exifInfo?.model) {
    privacyItems.push({
      category: "Camera / Device Hardware",
      detected: true,
      value: `${exifInfo.make || ""} ${exifInfo.model || ""}`.trim(),
      warningLevel: "medium",
    });
  } else {
    privacyItems.push({
      category: "Camera / Device Hardware",
      detected: false,
      value: "Not detected",
      warningLevel: "none",
    });
  }

  // Date & Time of Capture
  if (exifInfo?.dateTimeOriginal || exifInfo?.dateTime) {
    privacyItems.push({
      category: "Original Date Taken",
      detected: true,
      value: exifInfo.dateTimeOriginal || exifInfo.dateTime,
      warningLevel: "medium",
    });
  } else {
    privacyItems.push({
      category: "Original Date Taken",
      detected: false,
      value: "Not detected",
      warningLevel: "none",
    });
  }

  // Author / Creator
  if (exifInfo?.artist || iptcInfo?.creator || xmpInfo?.creator) {
    privacyItems.push({
      category: "Author / Creator",
      detected: true,
      value: exifInfo?.artist || iptcInfo?.creator || xmpInfo?.creator,
      warningLevel: "low",
    });
  } else {
    privacyItems.push({
      category: "Author / Creator",
      detected: false,
      value: "Not detected",
      warningLevel: "none",
    });
  }

  // Software / Editing Tool
  if (exifInfo?.software || xmpInfo?.creatorTool) {
    privacyItems.push({
      category: "Editing Software / Tool",
      detected: true,
      value: exifInfo?.software || xmpInfo?.creatorTool,
      warningLevel: "low",
    });
  } else {
    privacyItems.push({
      category: "Editing Software / Tool",
      detected: false,
      value: "Not detected",
      warningLevel: "none",
    });
  }

  const hasSensitiveData = privacyItems.some((item) => item.detected);

  // Normalized Raw Key/Value Collection
  const rawEntries: Array<{ category: string; key: string; value: string }> = [];

  // File
  rawEntries.push({ category: "File", key: "Filename", value: file.name });
  rawEntries.push({ category: "File", key: "File Size", value: `${formatBytes(file.size)} (${file.size.toLocaleString()} bytes)` });
  rawEntries.push({ category: "File", key: "MIME Type", value: file.type || "Unknown" });
  rawEntries.push({ category: "File", key: "Container", value: magic.detectedContainer });
  rawEntries.push({ category: "File", key: "Last Modified", value: new Date(file.lastModified).toISOString() });

  // Dimensions
  rawEntries.push({ category: "Image", key: "Dimensions", value: `${naturalWidth} × ${naturalHeight} px` });
  rawEntries.push({ category: "Image", key: "Aspect Ratio", value: `${aspectRatio} (${aspectRatioDecimal})` });
  rawEntries.push({ category: "Image", key: "Megapixels", value: `${megapixels} MP (${totalPixels.toLocaleString()} px)` });
  rawEntries.push({ category: "Image", key: "Animation", value: frameCount > 1 ? `Yes (${frameCount} frames)` : "Static" });

  // EXIF
  if (exifInfo) {
    if (exifInfo.make) rawEntries.push({ category: "EXIF", key: "Camera Make", value: exifInfo.make });
    if (exifInfo.model) rawEntries.push({ category: "EXIF", key: "Camera Model", value: exifInfo.model });
    if (exifInfo.lensModel) rawEntries.push({ category: "EXIF", key: "Lens Model", value: exifInfo.lensModel });
    if (exifInfo.exposureTime) rawEntries.push({ category: "EXIF", key: "Exposure Time", value: exifInfo.exposureTime });
    if (exifInfo.fNumber) rawEntries.push({ category: "EXIF", key: "F-Number", value: exifInfo.fNumber });
    if (exifInfo.iso) rawEntries.push({ category: "EXIF", key: "ISO Speed", value: String(exifInfo.iso) });
    if (exifInfo.focalLength) rawEntries.push({ category: "EXIF", key: "Focal Length", value: exifInfo.focalLength });
    if (exifInfo.dateTimeOriginal) rawEntries.push({ category: "EXIF", key: "Date Taken", value: exifInfo.dateTimeOriginal });
    if (exifInfo.software) rawEntries.push({ category: "EXIF", key: "Software", value: exifInfo.software });

    for (const [k, v] of Object.entries(exifInfo.rawTags)) {
      if (!["Make", "Model", "LensModel", "ExposureTime", "FNumber", "ISO", "FocalLength", "DateTimeOriginal", "Software"].includes(k)) {
        rawEntries.push({ category: "EXIF (Extended)", key: k, value: String(v) });
      }
    }
  }

  // GPS
  if (gpsInfo?.hasGps) {
    if (gpsInfo.latitude !== undefined) rawEntries.push({ category: "GPS", key: "Latitude", value: `${gpsInfo.latitude}° (${gpsInfo.latitudeDms})` });
    if (gpsInfo.longitude !== undefined) rawEntries.push({ category: "GPS", key: "Longitude", value: `${gpsInfo.longitude}° (${gpsInfo.longitudeDms})` });
    if (gpsInfo.altitude) rawEntries.push({ category: "GPS", key: "Altitude", value: gpsInfo.altitude });
    if (gpsInfo.dateTime) rawEntries.push({ category: "GPS", key: "GPS Timestamp", value: gpsInfo.dateTime });
  }

  // IPTC
  if (iptcInfo) {
    if (iptcInfo.title) rawEntries.push({ category: "IPTC", key: "Title", value: iptcInfo.title });
    if (iptcInfo.creator) rawEntries.push({ category: "IPTC", key: "Creator", value: iptcInfo.creator });
    if (iptcInfo.headline) rawEntries.push({ category: "IPTC", key: "Headline", value: iptcInfo.headline });
    if (iptcInfo.caption) rawEntries.push({ category: "IPTC", key: "Caption", value: iptcInfo.caption });
    if (iptcInfo.keywords) rawEntries.push({ category: "IPTC", key: "Keywords", value: iptcInfo.keywords.join(", ") });
    if (iptcInfo.city) rawEntries.push({ category: "IPTC", key: "City", value: iptcInfo.city });
    if (iptcInfo.country) rawEntries.push({ category: "IPTC", key: "Country", value: iptcInfo.country });
    if (iptcInfo.copyright) rawEntries.push({ category: "IPTC", key: "Copyright", value: iptcInfo.copyright });
  }

  // XMP
  if (xmpInfo) {
    if (xmpInfo.creator) rawEntries.push({ category: "XMP", key: "Creator", value: xmpInfo.creator });
    if (xmpInfo.title) rawEntries.push({ category: "XMP", key: "Title", value: xmpInfo.title });
    if (xmpInfo.description) rawEntries.push({ category: "XMP", key: "Description", value: xmpInfo.description });
    if (xmpInfo.creatorTool) rawEntries.push({ category: "XMP", key: "Creator Tool", value: xmpInfo.creatorTool });
    if (xmpInfo.createDate) rawEntries.push({ category: "XMP", key: "Create Date", value: xmpInfo.createDate });
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    file,
    previewUrl: objectUrl,
    fileInfo: {
      fileName: file.name,
      extension: ext.toUpperCase(),
      mimeType: file.type || "application/octet-stream",
      fileSize: formatBytes(file.size),
      fileSizeBytes: file.size,
      lastModified: new Date(file.lastModified).toLocaleString(),
      container: magic.detectedContainer,
      format: ext.toUpperCase(),
    },
    imageInfo: {
      width: naturalWidth,
      height: naturalHeight,
      aspectRatio,
      aspectRatioDecimal,
      orientationLabel: exifInfo?.orientation,
      totalPixels,
      megapixels,
      animated: frameCount > 1,
      frameCount: frameCount > 1 ? frameCount : 1,
      loopCount,
      durationMs,
    },
    colorInfo,
    resolutionInfo,
    exifInfo,
    gpsInfo,
    iptcInfo,
    xmpInfo,
    formatSpecific,
    privacyCheck: {
      hasSensitiveData,
      items: privacyItems,
    },
    rawEntries,
  };
}

/**
 * Exports metadata as structured JSON
 */
export function exportMetadataJson(metadata: CompleteImageMetadata): void {
  const exportData = {
    file: metadata.fileInfo,
    dimensions: metadata.imageInfo,
    color: metadata.colorInfo,
    resolution: metadata.resolutionInfo,
    privacyCheck: metadata.privacyCheck,
    exif: metadata.exifInfo,
    gps: metadata.gpsInfo,
    iptc: metadata.iptcInfo,
    xmp: metadata.xmpInfo,
    formatSpecific: metadata.formatSpecific,
    rawEntries: metadata.rawEntries,
    generatedAt: new Date().toISOString(),
    tool: "XeooTools Image Metadata Viewer",
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const base = metadata.fileInfo.fileName.replace(/\.[^/.]+$/, "");
  const link = document.createElement("a");
  link.href = url;
  link.download = `${base}-metadata.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports metadata as a formatted plain text summary
 */
export function exportMetadataTxt(metadata: CompleteImageMetadata): void {
  const lines: string[] = [];
  lines.push("==================================================");
  lines.push(`XEOOTOOLS IMAGE METADATA REPORT`);
  lines.push(`File: ${metadata.fileInfo.fileName}`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push("==================================================");
  lines.push("");

  let currentCat = "";
  for (const entry of metadata.rawEntries) {
    if (entry.category !== currentCat) {
      currentCat = entry.category;
      lines.push(`[ ${currentCat.toUpperCase()} ]`);
    }
    lines.push(`  ${entry.key.padEnd(26)}: ${entry.value}`);
  }

  lines.push("");
  lines.push("--------------------------------------------------");
  lines.push("PRIVACY CHECK SUMMARY:");
  for (const p of metadata.privacyCheck.items) {
    lines.push(`  ${p.category.padEnd(26)}: ${p.detected ? `DETECTED (${p.value})` : "Not detected"}`);
  }
  lines.push("==================================================");

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const base = metadata.fileInfo.fileName.replace(/\.[^/.]+$/, "");
  const link = document.createElement("a");
  link.href = url;
  link.download = `${base}-metadata.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
