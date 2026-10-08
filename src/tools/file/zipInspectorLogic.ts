import JSZip from "jszip";

export const MAX_ZIP_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_ZIP_ENTRIES = 10000;
export const MAX_TOTAL_UNCOMPRESSED_BYTES = 500 * 1024 * 1024; // 500 MB

export type ZipEntryType = "file" | "folder";

export interface ZipEntry {
  id: number;
  name: string;
  baseName: string;
  path: string;
  type: ZipEntryType;
  compressedSize: number;
  uncompressedSize: number;
  compressionRatio: number; // percentage: e.g. 72.5
  compressionMethod: string;
  modifiedAt: string | null;
  comment: string | null;
  isSuspicious: boolean;
  suspiciousReasons: string[];
}

export interface ZipSecuritySummary {
  hasWarnings: boolean;
  suspiciousPaths: number;
  executableFiles: number;
  nestedArchives: number;
  highCompressionRatio: number;
  duplicateEntries: number;
  markupPayloads: number;
}

export interface ZipInspectionResult {
  name: string;
  size: number;
  fileCount: number;
  folderCount: number;
  totalEntries: number;
  totalCompressedSize: number;
  totalUncompressedSize: number;
  overallCompressionRatio: number;
  comment: string | null;
  security: ZipSecuritySummary;
  entries: ZipEntry[];
  zipInstance?: JSZip;
}

const EXECUTABLE_EXTENSIONS = new Set([
  "exe",
  "dll",
  "bat",
  "cmd",
  "com",
  "scr",
  "pif",
  "ps1",
  "vbs",
  "vbe",
  "js",
  "jse",
  "jar",
  "msi",
  "sh",
  "bash",
  "app",
  "dmg",
  "elf",
  "iso",
  "hta",
  "cpl",
  "wsf",
  "reg",
  "bin",
  "apk",
  "deb",
  "rpm",
]);

const NESTED_ARCHIVE_EXTENSIONS = new Set([
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
  "tgz",
  "bz2",
  "tbz2",
  "xz",
  "cab",
  "iso",
  "z",
]);

const MARKUP_SUSPICIOUS_REGEX =
  /<script|javascript:|onerror\s*=|onload\s*=|onclick\s*|<iframe|<img|<svg|alert\s*\(/i;

/**
 * Formats byte size into human readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0 || !Number.isFinite(bytes)) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Formats a compression ratio percentage cleanly.
 */
export function formatRatio(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 0) return "0.0%";
  return `${ratio.toFixed(1)}%`;
}

/**
 * Validates ZIP signature (magic bytes: PK\x03\x04 or PK\x05\x06 or PK\x07\x08).
 */
export async function checkZipSignature(file: File): Promise<boolean> {
  try {
    const slice = file.slice(0, 4);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (bytes.length < 4) return false;

    // Check for "PK" header: 0x50 (P), 0x4B (K)
    const isPk = bytes[0] === 0x50 && bytes[1] === 0x4B;
    if (!isPk) return false;

    // Accept standard local header (0x03, 0x04), empty EOCD (0x05, 0x06), or spanned (0x07, 0x08)
    const third = bytes[2];
    const fourth = bytes[3];

    return (
      (third === 0x03 && fourth === 0x04) ||
      (third === 0x05 && fourth === 0x06) ||
      (third === 0x07 && fourth === 0x08)
    );
  } catch {
    return false;
  }
}

/**
 * Validates a ZIP file before inspection.
 */
export async function validateZipFile(
  file: File,
): Promise<{ valid: boolean; error?: string }> {
  if (!file) {
    return { valid: false, error: "Please select a ZIP file to inspect." };
  }

  // 1. Check size limit
  if (file.size <= 0) {
    return { valid: false, error: "The selected file is empty (0 bytes)." };
  }

  if (file.size > MAX_ZIP_SIZE_BYTES) {
    return {
      valid: false,
      error: `This ZIP file exceeds the maximum supported size of ${formatBytes(MAX_ZIP_SIZE_BYTES)}.`,
    };
  }

  // 2. Extension check
  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith(".zip")) {
    return {
      valid: false,
      error: "Unsupported file format. Please select a valid .zip archive.",
    };
  }

  // 3. Binary signature check
  const isValidSignature = await checkZipSignature(file);
  if (!isValidSignature) {
    return {
      valid: false,
      error: "This file does not appear to be a valid ZIP archive (missing PK signature).",
    };
  }

  return { valid: true };
}

/**
 * Extracts entry extension.
 */
function getFileExtension(name: string): string {
  const cleanName = name.replace(/\/+$/, "");
  const lastSlash = Math.max(cleanName.lastIndexOf("/"), cleanName.lastIndexOf("\\"));
  const base = lastSlash >= 0 ? cleanName.slice(lastSlash + 1) : cleanName;
  const dotIndex = base.lastIndexOf(".");
  if (dotIndex <= 0) return "";
  return base.slice(dotIndex + 1).toLowerCase();
}

/**
 * Checks for path traversal patterns.
 */
function isPathTraversal(name: string): boolean {
  if (!name) return false;

  const normalized = name.replace(/\\/g, "/");

  // Check ../ segments
  if (
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    normalized.endsWith("/..") ||
    normalized === ".."
  ) {
    return true;
  }

  // Check absolute root paths
  if (normalized.startsWith("/")) {
    return true;
  }

  // Check Windows drive letters (C:/, D:\, etc.)
  if (/^[a-zA-Z]:(\/|\\)/.test(name)) {
    return true;
  }

  // Check URL-encoded traversal
  if (/%2e%2e|%2f|%5c/i.test(name)) {
    return true;
  }

  return false;
}

/**
 * Inspects a ZIP archive in memory without extraction or file execution.
 */
export async function inspectZipFile(file: File): Promise<ZipInspectionResult> {
  const validation = await validateZipFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid ZIP file.");
  }

  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    throw new Error("Failed to read the ZIP file from browser storage.");
  }

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(arrayBuffer, { checkCRC32: false });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Archive structure is invalid.";
    throw new Error(`This ZIP archive appears to be corrupted or invalid (${msg}).`);
  }

  const entriesMap = zip.files;
  const rawEntryKeys = Object.keys(entriesMap);

  if (rawEntryKeys.length > MAX_ZIP_ENTRIES) {
    throw new Error(
      `Archive contains ${rawEntryKeys.length} entries, exceeding the maximum safe limit of ${MAX_ZIP_ENTRIES.toLocaleString()} entries.`,
    );
  }

  const entries: ZipEntry[] = [];
  const pathSet = new Set<string>();

  let fileCount = 0;
  let folderCount = 0;
  let totalCompressedSize = 0;
  let totalUncompressedSize = 0;

  let suspiciousPaths = 0;
  let executableFiles = 0;
  let nestedArchives = 0;
  let highCompressionRatio = 0;
  let duplicateEntries = 0;
  let markupPayloads = 0;

  let idCounter = 1;

  for (const rawPath of rawEntryKeys) {
    const zipEntry = entriesMap[rawPath];
    if (!zipEntry) continue;

    const isDir = Boolean(zipEntry.dir);
    const entryType: ZipEntryType = isDir ? "folder" : "file";

    if (isDir) {
      folderCount += 1;
    } else {
      fileCount += 1;
    }

    // Read size metadata from JSZip internal _data without decompression
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const internalData = (zipEntry as any)._data;
    const uncompressed =
      typeof internalData?.uncompressedSize === "number"
        ? internalData.uncompressedSize
        : 0;
    const compressed =
      typeof internalData?.compressedSize === "number"
        ? internalData.compressedSize
        : uncompressed;

    totalCompressedSize += compressed;
    totalUncompressedSize += uncompressed;

    if (totalUncompressedSize > MAX_TOTAL_UNCOMPRESSED_BYTES) {
      throw new Error(
        `Total uncompressed size exceeds the maximum safe limit of ${formatBytes(MAX_TOTAL_UNCOMPRESSED_BYTES)}. Possible ZIP bomb or oversized content.`,
      );
    }

    let ratio = 0;
    if (uncompressed > 0 && compressed > 0 && uncompressed >= compressed) {
      ratio = ((uncompressed - compressed) / uncompressed) * 100;
    }

    const cleanPath = rawPath.replace(/\\/g, "/");
    const normalizedNoTrailing = cleanPath.replace(/\/+$/, "");
    const lastSlash = normalizedNoTrailing.lastIndexOf("/");
    const baseName =
      lastSlash >= 0
        ? normalizedNoTrailing.slice(lastSlash + 1)
        : normalizedNoTrailing;

    const ext = getFileExtension(rawPath);

    // Security checks
    const reasons: string[] = [];

    // 1. Path traversal
    if (isPathTraversal(rawPath)) {
      suspiciousPaths += 1;
      reasons.push("Potential path traversal detected (directory breakout attempt).");
    }

    // 2. Duplicate entries
    if (pathSet.has(cleanPath)) {
      duplicateEntries += 1;
      reasons.push("Duplicate entry path inside archive.");
    } else {
      pathSet.add(cleanPath);
    }

    // 3. Executable detection (files only)
    if (!isDir && EXECUTABLE_EXTENSIONS.has(ext)) {
      executableFiles += 1;
      reasons.push(`Potentially executable file extension (.${ext}).`);
    }

    // 4. Nested archives
    if (!isDir && NESTED_ARCHIVE_EXTENSIONS.has(ext)) {
      nestedArchives += 1;
      reasons.push(`Nested archive detected (.${ext}).`);
    }

    // 5. High compression ratio
    if (!isDir && uncompressed > 100 * 1024 && ratio > 95) {
      highCompressionRatio += 1;
      reasons.push(`Potentially abnormal compression ratio (${ratio.toFixed(1)}%).`);
    }

    // 6. Markup / script injection in name
    if (
      MARKUP_SUSPICIOUS_REGEX.test(rawPath) ||
      (zipEntry.comment && MARKUP_SUSPICIOUS_REGEX.test(zipEntry.comment))
    ) {
      markupPayloads += 1;
      reasons.push("Suspicious markup/script-like pattern in filename or comment.");
    }

    const isSuspicious = reasons.length > 0;

    let modifiedAt: string | null = null;
    if (zipEntry.date instanceof Date && !isNaN(zipEntry.date.getTime())) {
      modifiedAt = zipEntry.date.toISOString();
    }

    entries.push({
      id: idCounter++,
      name: rawPath,
      baseName: baseName || rawPath,
      path: cleanPath,
      type: entryType,
      compressedSize: compressed,
      uncompressedSize: uncompressed,
      compressionRatio: ratio,
      compressionMethod: isDir
        ? "Directory"
        : compressed < uncompressed
          ? "DEFLATE"
          : "STORE",
      modifiedAt,
      comment: zipEntry.comment ? zipEntry.comment.trim() : null,
      isSuspicious,
      suspiciousReasons: reasons,
    });
  }

  let overallCompressionRatio = 0;
  if (
    totalUncompressedSize > 0 &&
    totalCompressedSize > 0 &&
    totalUncompressedSize >= totalCompressedSize
  ) {
    overallCompressionRatio =
      ((totalUncompressedSize - totalCompressedSize) / totalUncompressedSize) *
      100;
  }

  const hasWarnings =
    suspiciousPaths > 0 ||
    executableFiles > 0 ||
    nestedArchives > 0 ||
    highCompressionRatio > 0 ||
    duplicateEntries > 0 ||
    markupPayloads > 0;

  return {
    name: file.name,
    size: file.size,
    fileCount,
    folderCount,
    totalEntries: entries.length,
    totalCompressedSize,
    totalUncompressedSize,
    overallCompressionRatio,
    comment:
      typeof (zip as unknown as { comment?: string }).comment === "string"
        ? (zip as unknown as { comment?: string }).comment!.trim() || null
        : null,
    security: {
      hasWarnings,
      suspiciousPaths,
      executableFiles,
      nestedArchives,
      highCompressionRatio,
      duplicateEntries,
      markupPayloads,
    },
    entries,
    zipInstance: zip,
  };
}

/**
 * Extracts a single file entry from the loaded ZIP as a Blob.
 */
export async function extractZipEntryBlob(
  zip: JSZip,
  entryName: string,
): Promise<Blob> {
  const fileObj = zip.file(entryName);
  if (!fileObj) {
    throw new Error(`File "${entryName}" not found inside archive.`);
  }
  return await fileObj.async("blob");
}

