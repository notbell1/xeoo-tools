export interface ChunkToMerge {
  id: string;
  file: File;
  name: string;
  size: number;
}

export interface MergeResult {
  mergedBlob: Blob;
  outputFileName: string;
  totalSize: number;
  partsCount: number;
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
 * Natural sort helper for chunk filenames (e.g. .part01, .part02, .part10).
 */
export function naturalSortChunks(chunks: ChunkToMerge[]): ChunkToMerge[] {
  return [...chunks].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
  );
}

/**
 * Guesses default output file name from chunk name.
 * e.g. "archive.zip.part01" -> "archive.zip"
 *      "movie.mp4.001" -> "movie.mp4"
 */
export function guessOutputFileName(firstChunkName: string): string {
  if (!firstChunkName) return "merged_file";

  // Strip .partXX, .partX, .001, etc.
  const partPattern = /\.(part\d+|\d{3,4})$/i;
  if (partPattern.test(firstChunkName)) {
    return firstChunkName.replace(partPattern, "");
  }

  return `merged_${firstChunkName}`;
}

/**
 * Merges chunks into a single Blob in sequence.
 */
export function mergeChunks(chunks: ChunkToMerge[], outputFileName: string): MergeResult {
  if (!chunks || chunks.length === 0) {
    throw new Error("No file chunks selected to merge.");
  }

  const fileBlobs = chunks.map((c) => c.file);
  const totalSize = chunks.reduce((acc, c) => acc + c.size, 0);
  const mergedBlob = new Blob(fileBlobs);

  const cleanName = outputFileName.trim() || guessOutputFileName(chunks[0].name);

  return {
    mergedBlob,
    outputFileName: cleanName,
    totalSize,
    partsCount: chunks.length,
  };
}

