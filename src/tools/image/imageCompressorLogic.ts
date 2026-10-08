export type CompressionFormat =
  | "auto"
  | "jpeg"
  | "png"
  | "webp"
  | "avif";

export type CompressionResult = {
  id: string;
  originalName: string;
  file: File;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  reduction: number;
  mimeType: string;
  format: string;
  fileName: string;
};

const MIME_BY_FORMAT: Record<
  Exclude<CompressionFormat, "auto">,
  string
> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

const SUPPORTED_INPUT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const SUPPORTED_INPUT_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
]);

export function createImageId(file: File): string {
  return [
    file.name,
    file.size,
    file.lastModified,
    Math.random().toString(36).slice(2),
  ].join("-");
}

export function getFileExtension(
  fileName: string,
): string {
  return (
    fileName
      .split(".")
      .pop()
      ?.toLowerCase() ?? ""
  );
}

export function isSupportedPhoto(
  file: File,
): boolean {
  const extension = getFileExtension(
    file.name,
  );

  return (
    SUPPORTED_INPUT_MIME_TYPES.has(
      file.type,
    ) ||
    SUPPORTED_INPUT_EXTENSIONS.has(
      extension,
    )
  );
}

export function formatBytes(
  bytes: number,
): string {
  if (
    !Number.isFinite(bytes) ||
    bytes <= 0
  ) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024),
    ),
    units.length - 1,
  );

  const value =
    bytes / 1024 ** index;

  if (index === 0) {
    return `${Math.round(value)} ${units[index]}`;
  }

  return `${value.toFixed(
    value >= 100
      ? 0
      : value >= 10
        ? 1
        : 2,
  )} ${units[index]}`;
}

export function formatReduction(
  originalSize: number,
  compressedSize: number,
): string {
  if (originalSize <= 0) {
    return "0%";
  }

  const percentage =
    ((originalSize -
      compressedSize) /
      originalSize) *
    100;

  if (percentage >= 0) {
    return `${percentage.toFixed(
      1,
    )}% smaller`;
  }

  return `${Math.abs(
    percentage,
  ).toFixed(1)}% larger`;
}

export function getOutputFormatLabel(
  mimeType: string,
): string {
  switch (mimeType) {
    case "image/jpeg":
      return "JPEG";

    case "image/png":
      return "PNG";

    case "image/webp":
      return "WebP";

    case "image/avif":
      return "AVIF";

    default:
      return "IMAGE";
  }
}

export function getOutputExtension(
  mimeType: string,
): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/avif":
      return "avif";

    default:
      return "bin";
  }
}

export function supportsMimeType(
  mimeType: string,
): boolean {
  try {
    const canvas =
      document.createElement(
        "canvas",
      );

    canvas.width = 1;
    canvas.height = 1;

    const dataUrl =
      canvas.toDataURL(
        mimeType,
      );

    return dataUrl.startsWith(
      `data:${mimeType}`,
    );
  } catch {
    return false;
  }
}

export function getSupportedOutputFormats(): CompressionFormat[] {
  const formats: CompressionFormat[] = [
    "auto",
    "jpeg",
    "png",
    "webp",
  ];

  if (
    supportsMimeType(
      "image/avif",
    )
  ) {
    formats.push("avif");
  }

  return formats;
}

export function resolveOutputMimeType(
  sourceType: string,
  format: CompressionFormat,
): string {
  if (format !== "auto") {
    return MIME_BY_FORMAT[format];
  }

  if (
    sourceType ===
    "image/jpeg"
  ) {
    return "image/jpeg";
  }

  if (
    sourceType ===
    "image/png"
  ) {
    return "image/png";
  }

  if (
    sourceType ===
    "image/webp"
  ) {
    return "image/webp";
  }

  if (
    sourceType ===
      "image/avif" &&
    supportsMimeType(
      "image/avif",
    )
  ) {
    return "image/avif";
  }

  return "image/webp";
}

function sanitizeBaseName(
  originalName: string,
): string {
  return (
    originalName
      .replace(
        /\.[^/.]+$/,
        "",
      )
      .replace(
        /[<>:"/\\|?*\u0000-\u001F]/g,
        "",
      )
      .replace(
        /\s+/g,
        " ",
      )
      .trim() ||
    "image"
  );
}

export function buildCompressedFileName(
  originalName: string,
  mimeType: string,
): string {
  const baseName =
    sanitizeBaseName(
      originalName,
    );

  const extension =
    getOutputExtension(
      mimeType,
    );

  return `${baseName}-xeoo-compress.${extension}`;
}

export async function compressImage(
  id: string,
  file: File,
  quality: number,
  format: CompressionFormat,
): Promise<CompressionResult> {
  const sourceUrl =
    URL.createObjectURL(file);

  try {
    const image =
      await loadImage(
        sourceUrl,
      );

    const mimeType =
      resolveOutputMimeType(
        file.type,
        format,
      );

    if (
      mimeType !==
        "image/png" &&
      !supportsMimeType(
        mimeType,
      )
    ) {
      throw new Error(
        `${getOutputFormatLabel(
          mimeType,
        )} output is not supported by this browser.`,
      );
    }

    const canvas =
      document.createElement(
        "canvas",
      );

    canvas.width =
      image.naturalWidth;

    canvas.height =
      image.naturalHeight;

    const context =
      canvas.getContext(
        "2d",
      );

    if (!context) {
      throw new Error(
        "Unable to create the image processing canvas.",
      );
    }

    if (
      mimeType ===
      "image/jpeg"
    ) {
      context.fillStyle =
        "#ffffff";

      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height,
      );
    }

    context.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const blob =
      await canvasToBlob(
        canvas,
        mimeType,
        quality,
      );

    if (!blob) {
      throw new Error(
        "The browser could not create the compressed image.",
      );
    }

    const url =
      URL.createObjectURL(
        blob,
      );

    const reduction =
      file.size > 0
        ? ((file.size -
            blob.size) /
            file.size) *
          100
        : 0;

    return {
      id,
      originalName:
        file.name,
      file,
      blob,
      url,
      width:
        image.naturalWidth,
      height:
        image.naturalHeight,
      originalSize:
        file.size,
      compressedSize:
        blob.size,
      reduction,
      mimeType,
      format:
        getOutputFormatLabel(
          mimeType,
        ),
      fileName:
        buildCompressedFileName(
          file.name,
          mimeType,
        ),
    };
  } finally {
    URL.revokeObjectURL(
      sourceUrl,
    );
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise(
    (resolve) => {
      const outputQuality =
        mimeType ===
        "image/png"
          ? undefined
          : Math.max(
              0.1,
              Math.min(
                1,
                quality / 100,
              ),
            );

      canvas.toBlob(
        resolve,
        mimeType,
        outputQuality,
      );
    },
  );
}

function loadImage(
  source: string,
): Promise<HTMLImageElement> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const image =
        new Image();

      image.onload =
        () => resolve(image);

      image.onerror = () =>
        reject(
          new Error(
            "Unable to read one of the selected photos.",
          ),
        );

      image.src = source;
    },
  );
}