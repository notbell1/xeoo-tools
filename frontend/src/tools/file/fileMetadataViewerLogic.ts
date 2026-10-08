export interface MetadataRow {
  property: string;
  value: string;
  copyable?: boolean;
}

export interface FileMetadataResult {
  fileName: string;
  fileSize: number;
  basicInfo: MetadataRow[];
  extendedInfo: MetadataRow[];
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
 * Extracts available client-side file metadata.
 */
export async function extractFileMetadata(file: File): Promise<FileMetadataResult> {
  const ext = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() || "" : "";
  const lastModDate = new Date(file.lastModified);

  const basicInfo: MetadataRow[] = [
    { property: "File Name", value: file.name, copyable: true },
    { property: "File Size", value: `${formatBytes(file.size)} (${file.size.toLocaleString()} bytes)`, copyable: true },
    { property: "MIME Type", value: file.type || "application/octet-stream", copyable: true },
    { property: "File Extension", value: ext ? `.${ext}` : "None", copyable: true },
    { property: "Last Modified (Local)", value: lastModDate.toLocaleString(), copyable: true },
    { property: "Last Modified (ISO UTC)", value: lastModDate.toISOString(), copyable: true },
    { property: "Timestamp (Unix ms)", value: String(file.lastModified), copyable: true },
  ];

  const extendedInfo: MetadataRow[] = [];

  // If Image: read image dimensions
  if (file.type.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"].includes(ext)) {
    try {
      const url = URL.createObjectURL(file);
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          extendedInfo.push({ property: "Image Width", value: `${img.naturalWidth} px` });
          extendedInfo.push({ property: "Image Height", value: `${img.naturalHeight} px` });
          extendedInfo.push({
            property: "Aspect Ratio",
            value: `${img.naturalWidth} : ${img.naturalHeight} (${(img.naturalWidth / img.naturalHeight).toFixed(2)})`,
          });
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        img.src = url;
      });
    } catch {
      // Ignore image parse errors
    }
  }

  // If Text-based: read lines and words
  if (
    file.type.startsWith("text/") ||
    ["txt", "md", "json", "csv", "xml", "html", "css", "js", "ts", "py", "sql"].includes(ext) ||
    file.type.includes("json") ||
    file.type.includes("xml")
  ) {
    if (file.size <= 5 * 1024 * 1024) {
      try {
        const text = await file.text();
        const lines = text.split(/\r\n|\r|\n/).length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;

        extendedInfo.push({ property: "Line Count", value: lines.toLocaleString() });
        extendedInfo.push({ property: "Word Count", value: words.toLocaleString() });
        extendedInfo.push({ property: "Character Count", value: chars.toLocaleString() });
      } catch {
        // Ignore text parse errors
      }
    }
  }

  // If Audio / Video: read duration
  if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
    try {
      const url = URL.createObjectURL(file);
      await new Promise<void>((resolve) => {
        const media = document.createElement(file.type.startsWith("video/") ? "video" : "audio");
        media.preload = "metadata";
        media.onloadedmetadata = () => {
          if (!isNaN(media.duration) && isFinite(media.duration)) {
            const minutes = Math.floor(media.duration / 60);
            const seconds = Math.floor(media.duration % 60);
            extendedInfo.push({
              property: "Duration",
              value: `${minutes}m ${seconds}s (${media.duration.toFixed(2)} seconds)`,
            });
            if (media instanceof HTMLVideoElement && media.videoWidth > 0) {
              extendedInfo.push({
                property: "Video Resolution",
                value: `${media.videoWidth} x ${media.videoHeight}`,
              });
            }
          }
          URL.revokeObjectURL(url);
          resolve();
        };
        media.onerror = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        media.src = url;
      });
    } catch {
      // Ignore media duration errors
    }
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    basicInfo,
    extendedInfo,
  };
}

