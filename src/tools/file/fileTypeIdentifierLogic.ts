export interface FileSignatureDefinition {
  name: string;
  category: string;
  mime: string;
  extensions: string[];
  check: (bytes: Uint8Array) => boolean;
  signatureHex: string;
}

export interface TypeIdentificationResult {
  fileName: string;
  fileSize: number;
  extension: string;
  browserMime: string;
  detectedName: string;
  detectedCategory: string;
  detectedMime: string;
  signatureHex: string;
  headerHex: string;
  headerAscii: string;
  isExtensionMismatch: boolean;
  mismatchWarning?: string;
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const SIGNATURES: FileSignatureDefinition[] = [
  {
    name: "PNG Image",
    category: "Image",
    mime: "image/png",
    extensions: ["png"],
    signatureHex: "89 50 4E 47 0D 0A 1A 0A",
    check: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    name: "JPEG Image",
    category: "Image",
    mime: "image/jpeg",
    extensions: ["jpg", "jpeg", "jpe", "jif"],
    signatureHex: "FF D8 FF",
    check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    name: "GIF Image",
    category: "Image",
    mime: "image/gif",
    extensions: ["gif"],
    signatureHex: "47 49 46 38",
    check: (b) =>
      b.length >= 4 &&
      b[0] === 0x47 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x38,
  },
  {
    name: "PDF Document",
    category: "Document",
    mime: "application/pdf",
    extensions: ["pdf"],
    signatureHex: "25 50 44 46 (%PDF)",
    check: (b) =>
      b.length >= 4 &&
      b[0] === 0x25 &&
      b[1] === 0x50 &&
      b[2] === 0x44 &&
      b[3] === 0x46,
  },
  {
    name: "ZIP Archive",
    category: "Archive",
    mime: "application/zip",
    extensions: ["zip", "docx", "xlsx", "pptx", "jar", "apk"],
    signatureHex: "50 4B 03 04 (PK..)",
    check: (b) =>
      b.length >= 4 &&
      b[0] === 0x50 &&
      b[1] === 0x4b &&
      (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07) &&
      (b[3] === 0x04 || b[3] === 0x06 || b[3] === 0x08),
  },
  {
    name: "GZIP Archive",
    category: "Archive",
    mime: "application/gzip",
    extensions: ["gz", "tgz"],
    signatureHex: "1F 8B",
    check: (b) => b.length >= 2 && b[0] === 0x1f && b[1] === 0x8b,
  },
  {
    name: "RAR Archive",
    category: "Archive",
    mime: "application/vnd.rar",
    extensions: ["rar"],
    signatureHex: "52 61 72 21 1A 07",
    check: (b) =>
      b.length >= 6 &&
      b[0] === 0x52 &&
      b[1] === 0x61 &&
      b[2] === 0x72 &&
      b[3] === 0x21 &&
      b[4] === 0x1a &&
      b[5] === 0x07,
  },
  {
    name: "7-Zip Archive",
    category: "Archive",
    mime: "application/x-7z-compressed",
    extensions: ["7z"],
    signatureHex: "37 7A BC AF 27 1C",
    check: (b) =>
      b.length >= 6 &&
      b[0] === 0x37 &&
      b[1] === 0x7a &&
      b[2] === 0xbc &&
      b[3] === 0xaf &&
      b[4] === 0x27 &&
      b[5] === 0x1c,
  },
  {
    name: "WebP Image",
    category: "Image",
    mime: "image/webp",
    extensions: ["webp"],
    signatureHex: "52 49 46 46 .... 57 45 42 50 (RIFF..WEBP)",
    check: (b) =>
      b.length >= 12 &&
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
  {
    name: "WAV Audio",
    category: "Audio",
    mime: "audio/wav",
    extensions: ["wav"],
    signatureHex: "52 49 46 46 .... 57 41 56 45 (RIFF..WAVE)",
    check: (b) =>
      b.length >= 12 &&
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x41 &&
      b[10] === 0x56 &&
      b[11] === 0x45,
  },
  {
    name: "MP3 Audio",
    category: "Audio",
    mime: "audio/mpeg",
    extensions: ["mp3"],
    signatureHex: "49 44 33 (ID3) / FF FB",
    check: (b) =>
      (b.length >= 3 && b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) ||
      (b.length >= 2 && b[0] === 0xff && (b[1] === 0xfb || b[1] === 0xf3)),
  },
  {
    name: "MP4 Video",
    category: "Video",
    mime: "video/mp4",
    extensions: ["mp4", "m4v", "mov"],
    signatureHex: ".... 66 74 79 70 (ftyp)",
    check: (b) =>
      b.length >= 8 &&
      b[4] === 0x66 &&
      b[5] === 0x74 &&
      b[6] === 0x79 &&
      b[7] === 0x70,
  },
  {
    name: "AVI Video",
    category: "Video",
    mime: "video/x-msvideo",
    extensions: ["avi"],
    signatureHex: "52 49 46 46 .... 41 56 49 20 (RIFF..AVI)",
    check: (b) =>
      b.length >= 12 &&
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x41 &&
      b[9] === 0x56 &&
      b[10] === 0x49 &&
      b[11] === 0x20,
  },
  {
    name: "Windows Executable / DLL (PE)",
    category: "Executable",
    mime: "application/x-msdownload",
    extensions: ["exe", "dll", "sys", "scr"],
    signatureHex: "4D 5A (MZ)",
    check: (b) => b.length >= 2 && b[0] === 0x4d && b[1] === 0x5a,
  },
  {
    name: "Linux Executable (ELF)",
    category: "Executable",
    mime: "application/x-executable",
    extensions: ["elf", "bin", "so"],
    signatureHex: "7F 45 4C 46 (.ELF)",
    check: (b) =>
      b.length >= 4 &&
      b[0] === 0x7f &&
      b[1] === 0x45 &&
      b[2] === 0x4c &&
      b[3] === 0x46,
  },
  {
    name: "BMP Image",
    category: "Image",
    mime: "image/bmp",
    extensions: ["bmp"],
    signatureHex: "42 4D (BM)",
    check: (b) => b.length >= 2 && b[0] === 0x42 && b[1] === 0x4d,
  },
  {
    name: "WebM / Matroska Video",
    category: "Video",
    mime: "video/webm",
    extensions: ["webm", "mkv"],
    signatureHex: "1A 45 DF A3",
    check: (b) =>
      b.length >= 4 &&
      b[0] === 0x1a &&
      b[1] === 0x45 &&
      b[2] === 0xdf &&
      b[3] === 0xa3,
  },
  {
    name: "SQLite Database",
    category: "Database",
    mime: "application/x-sqlite3",
    extensions: ["sqlite", "db", "sqlite3"],
    signatureHex: "53 51 4C 69 74 65 (SQLite format 3)",
    check: (b) =>
      b.length >= 15 &&
      b[0] === 0x53 &&
      b[1] === 0x51 &&
      b[2] === 0x4c &&
      b[3] === 0x69 &&
      b[4] === 0x74 &&
      b[5] === 0x65,
  },
  {
    name: "XML / SVG Document",
    category: "Markup",
    mime: "application/xml",
    extensions: ["xml", "svg", "html", "htm"],
    signatureHex: "3C 3F 78 6D (<?xml) / 3C 73 76 67 (<svg)",
    check: (b) =>
      (b.length >= 4 && b[0] === 0x3c && b[1] === 0x3f && b[2] === 0x78 && b[3] === 0x6d) ||
      (b.length >= 4 && b[0] === 0x3c && b[1] === 0x73 && b[2] === 0x76 && b[3] === 0x67) ||
      (b.length >= 5 && b[0] === 0x3c && (b[1] === 0x21 || b[1] === 0x68 || b[1] === 0x48)),
  },
];

/**
 * Identifies file type based on header magic bytes.
 */
export async function identifyFileType(file: File): Promise<TypeIdentificationResult> {
  const headerSlice = file.slice(0, 32);
  const buffer = await headerSlice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Hex and ASCII header representations
  const hexParts: string[] = [];
  let asciiStr = "";

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    hexParts.push(byte.toString(16).padStart(2, "0").toUpperCase());
    asciiStr += byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".";
  }

  const headerHex = hexParts.join(" ");
  const headerAscii = asciiStr;

  // Extract filename extension
  const nameParts = file.name.split(".");
  const extension = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : "";

  // Find match in signatures
  const matched = SIGNATURES.find((sig) => sig.check(bytes));

  let detectedName = "Unknown / Plain Binary";
  let detectedCategory = "Generic";
  let detectedMime = file.type || "application/octet-stream";
  let signatureHex = "None identified";
  let isExtensionMismatch = false;
  let mismatchWarning: string | undefined;

  if (matched) {
    detectedName = matched.name;
    detectedCategory = matched.category;
    detectedMime = matched.mime;
    signatureHex = matched.signatureHex;

    if (extension && !matched.extensions.includes(extension)) {
      isExtensionMismatch = true;
      mismatchWarning = `File extension ".${extension}" does not match signature "${detectedName}". Potential file extension masquerading or renaming.`;
    }
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    extension: extension ? `.${extension}` : "None",
    browserMime: file.type || "None reported",
    detectedName,
    detectedCategory,
    detectedMime,
    signatureHex,
    headerHex,
    headerAscii,
    isExtensionMismatch,
    mismatchWarning,
  };
}

