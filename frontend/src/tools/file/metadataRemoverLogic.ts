export interface MetadataRemovalResult {
  originalName: string;
  originalSize: number;
  cleanName: string;
  cleanSize: number;
  format: string;
  cleanBlob: Blob;
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const SUPPORTED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "txt", "csv", "json", "md"]);

export function isFormatSupported(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return SUPPORTED_EXTENSIONS.has(ext);
}

/**
 * Strips metadata from supported files client-side.
 */
export async function removeFileMetadata(file: File): Promise<MetadataRemovalResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error(
      `Format .${ext} is not supported for client-side metadata stripping. Supported formats: JPEG, PNG, WebP, Text/JSON/CSV.`
    );
  }

  let cleanBlob: Blob;
  let detectedFormat = ext.toUpperCase();

  // Raster Images (JPEG, PNG, WEBP)
  // By drawing image onto HTML5 canvas and re-encoding, all EXIF, GPS coordinates,
  // camera serial numbers, and ancillary chunks are completely omitted.
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
    const objectUrl = URL.createObjectURL(file);

    try {
      cleanBlob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Unable to create 2D canvas context."));
            return;
          }

          ctx.drawImage(img, 0, 0);

          let mimeType = "image/jpeg";
          let quality = 0.95;

          if (ext === "png") {
            mimeType = "image/png";
            quality = 1.0;
          } else if (ext === "webp") {
            mimeType = "image/webp";
            quality = 0.95;
          }

          canvas.toBlob(
            (b) => {
              URL.revokeObjectURL(objectUrl);
              if (b) resolve(b);
              else reject(new Error("Failed to export cleaned image blob."));
            },
            mimeType,
            quality
          );
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to load image for sanitization."));
        };

        img.src = objectUrl;
      });
    } catch (err) {
      URL.revokeObjectURL(objectUrl);
      throw err;
    }
  } else {
    // Text-based files: Strip BOM (Byte Order Mark) and null bytes
    const text = await file.text();
    // Strip UTF-8 BOM (\uFEFF) and control characters
    const cleanedText = text.replace(/^\uFEFF/, "").replace(/\0/g, "");
    cleanBlob = new Blob([cleanedText], { type: file.type || "text/plain;charset=utf-8" });
    detectedFormat = "Plain Text";
  }

  const cleanName = `clean_${file.name}`;

  return {
    originalName: file.name,
    originalSize: file.size,
    cleanName,
    cleanSize: cleanBlob.size,
    format: detectedFormat,
    cleanBlob,
  };
}

