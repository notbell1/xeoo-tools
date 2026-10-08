import JSZip from "jszip";

export interface FileToCompress {
  id: string;
  file: File;
  name: string;
  size: number;
}

export type CompressionLevel = 0 | 1 | 6 | 9;

export interface CompressionOptions {
  level: CompressionLevel;
  archiveName: string;
}

export interface CompressionResult {
  archiveBlob: Blob;
  archiveName: string;
  originalTotalSize: number;
  compressedSize: number;
  fileCount: number;
  compressionRatio: number; // percentage space saved
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatRatio(percent: number): string {
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
}

/**
 * Compresses multiple files into a ZIP archive using JSZip.
 */
export async function compressFiles(
  files: FileToCompress[],
  options: CompressionOptions,
  onProgress?: (percent: number) => void
): Promise<CompressionResult> {
  if (!files || files.length === 0) {
    throw new Error("No files selected for compression.");
  }

  const zip = new JSZip();
  let originalTotalSize = 0;

  for (const item of files) {
    originalTotalSize += item.size;
    zip.file(item.name, item.file);
  }

  const isStored = options.level === 0;
  const compressionType = isStored ? "STORE" : "DEFLATE";
  const compressionOptions = isStored ? undefined : { level: options.level };

  const archiveBlob = await zip.generateAsync(
    {
      type: "blob",
      compression: compressionType,
      compressionOptions,
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  const compressedSize = archiveBlob.size;
  const compressionRatio =
    originalTotalSize > 0
      ? Math.max(0, ((originalTotalSize - compressedSize) / originalTotalSize) * 100)
      : 0;

  const rawName = options.archiveName.trim();
  const archiveName = rawName
    ? rawName.toLowerCase().endsWith(".zip")
      ? rawName
      : `${rawName}.zip`
    : "compressed_archive.zip";

  return {
    archiveBlob,
    archiveName,
    originalTotalSize,
    compressedSize,
    fileCount: files.length,
    compressionRatio,
  };
}

