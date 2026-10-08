import JSZip from "jszip";

export interface FileChunkItem {
  partIndex: number;
  partName: string;
  size: number;
  blob: Blob;
}

export interface SplitResult {
  originalName: string;
  originalSize: number;
  chunkSize: number;
  totalParts: number;
  chunks: FileChunkItem[];
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Calculates number of parts given file size and chunk size.
 */
export function calculatePartsCount(fileSize: number, chunkSizeBytes: number): number {
  if (chunkSizeBytes <= 0 || fileSize <= 0) return 1;
  return Math.ceil(fileSize / chunkSizeBytes);
}

/**
 * Splits a file into chunks using File.slice()
 */
export function splitFile(file: File, chunkSizeBytes: number): SplitResult {
  if (chunkSizeBytes <= 0) {
    throw new Error("Invalid chunk size specified.");
  }

  const totalParts = Math.ceil(file.size / chunkSizeBytes);
  const chunks: FileChunkItem[] = [];
  const padLength = Math.max(2, String(totalParts).length);

  for (let i = 0; i < totalParts; i++) {
    const start = i * chunkSizeBytes;
    const end = Math.min(file.size, start + chunkSizeBytes);
    const chunkBlob = file.slice(start, end);
    const partNumStr = String(i + 1).padStart(padLength, "0");
    const partName = `${file.name}.part${partNumStr}`;

    chunks.push({
      partIndex: i + 1,
      partName,
      size: chunkBlob.size,
      blob: chunkBlob,
    });
  }

  return {
    originalName: file.name,
    originalSize: file.size,
    chunkSize: chunkSizeBytes,
    totalParts,
    chunks,
  };
}

/**
 * Bundles all split chunks into a single ZIP for 1-click download.
 */
export async function createZipOfChunks(
  result: SplitResult,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  for (const chunk of result.chunks) {
    zip.file(chunk.partName, chunk.blob);
  }

  return await zip.generateAsync(
    {
      type: "blob",
      compression: "STORE",
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );
}

