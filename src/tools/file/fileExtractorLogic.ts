import JSZip from "jszip";

export interface ExtractedEntry {
  id: number;
  name: string;
  baseName: string;
  path: string;
  isFolder: boolean;
  uncompressedSize: number;
  compressedSize: number;
  date: Date | null;
}

export interface ArchiveExtractionSummary {
  archiveName: string;
  archiveSize: number;
  totalEntries: number;
  fileCount: number;
  folderCount: number;
  totalUncompressedSize: number;
  entries: ExtractedEntry[];
  zipInstance: JSZip;
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
 * Loads a ZIP archive and indexes its entries.
 */
export async function loadArchive(file: File): Promise<ArchiveExtractionSummary> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  const entries: ExtractedEntry[] = [];
  let fileCount = 0;
  let folderCount = 0;
  let totalUncompressedSize = 0;
  let counter = 1;

  zip.forEach((relativePath, zipObject) => {
    const isFolder = zipObject.dir || relativePath.endsWith("/");
    const uncompressedSize = (zipObject as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0;
    const compressedSize = (zipObject as unknown as { _data?: { compressedSize?: number } })._data?.compressedSize ?? 0;

    if (isFolder) {
      folderCount++;
    } else {
      fileCount++;
      totalUncompressedSize += uncompressedSize;
    }

    const segments = relativePath.split("/").filter(Boolean);
    const baseName = segments[segments.length - 1] || relativePath;

    entries.push({
      id: counter++,
      name: relativePath,
      baseName,
      path: relativePath,
      isFolder,
      uncompressedSize,
      compressedSize,
      date: zipObject.date || null,
    });
  });

  return {
    archiveName: file.name,
    archiveSize: file.size,
    totalEntries: entries.length,
    fileCount,
    folderCount,
    totalUncompressedSize,
    entries,
    zipInstance: zip,
  };
}

/**
 * Extracts a single file entry from the archive as a Blob.
 */
export async function extractSingleFile(zip: JSZip, path: string): Promise<Blob> {
  const fileObject = zip.file(path);
  if (!fileObject) {
    throw new Error(`File not found in archive: ${path}`);
  }
  return await fileObject.async("blob");
}

