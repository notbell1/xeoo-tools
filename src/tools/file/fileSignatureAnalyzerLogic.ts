export interface HexDumpRow {
  offset: string;
  hexGroup1: string;
  hexGroup2: string;
  rawHex: string;
  ascii: string;
}

export interface SignatureAnalysisResult {
  fileName: string;
  fileSize: number;
  byteCount: number;
  identifiedSignature: string;
  hexString: string;
  asciiString: string;
  rows: HexDumpRow[];
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function detectKnownMagic(bytes: Uint8Array): string {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "PNG Image Header (\\x89PNG\\r\\n\\x1a\\n)";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "JPEG SOI Marker (\\xFF\\xD8\\xFF)";
  }
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "PDF Document Header (%PDF)";
  }
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return "ZIP Local File Header (PK\\x03\\x04)";
  }
  if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return "GIF Image Header (GIF8)";
  }
  if (bytes.length >= 2 && bytes[0] === 0x4d && bytes[1] === 0x5a) {
    return "DOS / Windows PE Executable (MZ)";
  }
  if (bytes.length >= 4 && bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
    return "Linux ELF Executable (\\x7FELF)";
  }
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
    return "GZIP Compressed Archive (\\x1F\\x8B)";
  }
  if (bytes.length >= 6 && bytes[0] === 0x37 && bytes[1] === 0x7a && bytes[2] === 0xbc && bytes[3] === 0xaf) {
    return "7-Zip Archive Header (7z\\xBC\\xAF)";
  }
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    const format = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    return `RIFF Container (${format})`;
  }
  return "Unknown / Custom Binary Header";
}

/**
 * Analyzes the first N bytes of a file and formats into a hex dump.
 */
export async function analyzeFileSignature(
  file: File,
  byteCount: number
): Promise<SignatureAnalysisResult> {
  const actualBytesToRead = Math.min(file.size, byteCount);
  const slice = file.slice(0, actualBytesToRead);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const identifiedSignature = detectKnownMagic(bytes);

  const rows: HexDumpRow[] = [];
  const fullHexArr: string[] = [];
  let fullAsciiStr = "";

  for (let offset = 0; offset < bytes.length; offset += 16) {
    const chunk = bytes.slice(offset, offset + 16);
    const offsetHex = offset.toString(16).padStart(6, "0").toUpperCase();

    const g1: string[] = [];
    const g2: string[] = [];
    let asciiRow = "";

    for (let i = 0; i < 16; i++) {
      if (i < chunk.length) {
        const b = chunk[i];
        const h = b.toString(16).padStart(2, "0").toUpperCase();
        fullHexArr.push(h);

        if (i < 8) g1.push(h);
        else g2.push(h);

        const ch = b >= 32 && b <= 126 ? String.fromCharCode(b) : ".";
        asciiRow += ch;
        fullAsciiStr += ch;
      } else {
        if (i < 8) g1.push("  ");
        else g2.push("  ");
        asciiRow += " ";
      }
    }

    rows.push({
      offset: offsetHex,
      hexGroup1: g1.join(" "),
      hexGroup2: g2.join(" "),
      rawHex: [...g1, ...g2].join(" "),
      ascii: asciiRow,
    });
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    byteCount: bytes.length,
    identifiedSignature,
    hexString: fullHexArr.join(" "),
    asciiString: fullAsciiStr,
    rows,
  };
}

