export type FileHashAlgorithm =
  | "SHA-256"
  | "SHA-512"
  | "SHA-384"
  | "SHA-1"
  | "MD5";

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface FileHashResultItem {
  algorithm: FileHashAlgorithm;
  hash: string;
  bitLength: number;
}

export interface VerificationResult {
  hasExpected: boolean;
  isMatch: boolean;
  matchedAlgorithm?: FileHashAlgorithm;
  details: string;
}

/**
 * Formats byte size into human readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const num = bytes / Math.pow(k, i);
  return `${num.toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`;
}

/**
 * Pure JS RFC 1321 MD5 calculation over Uint8Array buffer.
 */
function md5Uint8Array(bytes: Uint8Array): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  function md5cmn(
    q: number,
    a: number,
    b: number,
    x: number,
    s: number,
    t: number,
  ): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }

  function md5ff(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number,
  ): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function md5gg(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number,
  ): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function md5hh(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number,
  ): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function md5ii(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number,
  ): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const byteLength = bytes.length;
  const nWords = ((byteLength + 8) >> 6) + 1;
  const x = new Int32Array(nWords * 16);

  for (let i = 0; i < byteLength; i++) {
    x[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  x[byteLength >> 2] |= 0x80 << ((byteLength % 4) * 8);
  x[nWords * 16 - 2] = (byteLength * 8) & 0xffffffff;
  x[nWords * 16 - 1] = Math.floor(byteLength / 0x20000000);

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5ff(a, b, c, d, x[i + 0], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i + 0], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i + 0], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

    a = md5ii(a, b, c, d, x[i + 0], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const hexChars = "0123456789abcdef";
  let result = "";
  const words = [a, b, c, d];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const byte = (words[i] >> (j * 8)) & 0xff;
      result += hexChars[(byte >> 4) & 0x0f] + hexChars[byte & 0x0f];
    }
  }

  return result;
}

/**
 * Calculates hash from an ArrayBuffer using Web Crypto or MD5.
 */
export async function calculateBufferHash(
  buffer: ArrayBuffer,
  algorithm: FileHashAlgorithm,
  uppercase: boolean = false,
): Promise<string> {
  let hex = "";

  if (algorithm === "MD5") {
    hex = md5Uint8Array(new Uint8Array(buffer));
  } else {
    const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  return uppercase ? hex.toUpperCase() : hex.toLowerCase();
}

/**
 * Calculates all supported hash algorithms for an ArrayBuffer.
 */
export async function calculateAllBufferHashes(
  buffer: ArrayBuffer,
  uppercase: boolean = false,
): Promise<FileHashResultItem[]> {
  const algorithms: { algo: FileHashAlgorithm; bitLength: number }[] = [
    { algo: "SHA-256", bitLength: 256 },
    { algo: "SHA-512", bitLength: 512 },
    { algo: "SHA-384", bitLength: 384 },
    { algo: "SHA-1", bitLength: 160 },
    { algo: "MD5", bitLength: 128 },
  ];

  const results: FileHashResultItem[] = [];

  for (const { algo, bitLength } of algorithms) {
    const hash = await calculateBufferHash(buffer, algo, uppercase);
    results.push({
      algorithm: algo,
      hash,
      bitLength,
    });
  }

  return results;
}

/**
 * Verifies calculated hashes against an expected checksum provided by the user.
 */
export function verifyChecksum(
  expectedInput: string,
  calculatedHashes: FileHashResultItem[],
): VerificationResult {
  const normalizedExpected = expectedInput.trim().toLowerCase();

  if (!normalizedExpected) {
    return {
      hasExpected: false,
      isMatch: false,
      details: "Enter an expected checksum to verify integrity.",
    };
  }

  const matched = calculatedHashes.find(
    (item) => item.hash.toLowerCase() === normalizedExpected,
  );

  if (matched) {
    return {
      hasExpected: true,
      isMatch: true,
      matchedAlgorithm: matched.algorithm,
      details: `Checksum MATCH verified with ${matched.algorithm}! File is authentic and unmodified.`,
    };
  }

  return {
    hasExpected: true,
    isMatch: false,
    details:
      "Checksum MISMATCH! The expected checksum does not match any computed hash.",
  };
}
