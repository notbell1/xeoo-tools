// XeooTools Local File Encryption Engine (XEENC v1)
// 100% Client-side Web Crypto API (AES-256-GCM + PBKDF2-SHA-256)

export const MAGIC_HEADER = "XEENC";
export const FORMAT_VERSION = 1;
export const PBKDF2_ITERATIONS = 310000;
export const SALT_LENGTH = 16;
export const IV_LENGTH = 12;

export interface EncryptedFileMetadata {
  originalFileName: string;
  originalFileSize: number;
  originalFileType: string;
  originalSha256: string;
  createdAt: string; // ISO string
  iterations: number;
  formatVersion: number;
}

export interface EncryptionResult {
  encryptedBlob: Blob;
  encryptedFileName: string;
  metadata: EncryptedFileMetadata;
  sha256Hex: string;
}

export interface DecryptionResult {
  decryptedBlob: Blob;
  originalFileName: string;
  originalFileSize: number;
  originalFileType: string;
  sha256Hex: string;
  isIntegrityVerified: boolean;
  metadata: EncryptedFileMetadata;
}

export interface ReminderConfig {
  originalFileName: string;
  encryptedFileName: string;
  metadata: EncryptedFileMetadata;
  passwordHint: string;
  notes: string;
  includePassword?: boolean;
  password?: string;
  reminderFileName?: string;
}

/**
 * Format bytes into human readable string (e.g. 4.82 MB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Format date to standard format YYYY-MM-DD HH:mm:ss
 */
export function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

/**
 * Compute SHA-256 hash of an ArrayBuffer
 */
export async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Derive AES-256-GCM CryptoKey from password and salt using PBKDF2-SHA-256
 */
async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt a local File with password
 */
export async function encryptFile(
  file: File,
  password: string,
): Promise<EncryptionResult> {
  if (!password || password.length < 1) {
    throw new Error("Password cannot be empty.");
  }

  const fileBuffer = await file.arrayBuffer();
  const sha256Hex = await computeSha256(fileBuffer);
  const createdAt = new Date().toISOString();

  const metadata: EncryptedFileMetadata = {
    originalFileName: file.name,
    originalFileSize: file.size,
    originalFileType: file.type || "application/octet-stream",
    originalSha256: sha256Hex,
    createdAt,
    iterations: PBKDF2_ITERATIONS,
    formatVersion: FORMAT_VERSION,
  };

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt, PBKDF2_ITERATIONS);

  // Encrypt file payload
  const encryptedPayload = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    fileBuffer,
  );

  // Serialize Metadata
  const metadataJson = JSON.stringify(metadata);
  const metadataBytes = new TextEncoder().encode(metadataJson);
  const metadataLength = metadataBytes.length;

  // Header serialization:
  // [5 bytes MAGIC "XEENC"] + [1 byte VERSION] + [16 bytes SALT] + [12 bytes IV] + [4 bytes META_LEN uint32BE] + [META_BYTES] + [CIPHERTEXT]
  const magicBytes = new TextEncoder().encode(MAGIC_HEADER);
  const versionByte = new Uint8Array([FORMAT_VERSION]);

  const metaLenBuffer = new ArrayBuffer(4);
  new DataView(metaLenBuffer).setUint32(0, metadataLength, false);
  const metaLenBytes = new Uint8Array(metaLenBuffer);

  const combinedBlob = new Blob(
    [
      magicBytes,
      versionByte,
      salt,
      iv,
      metaLenBytes,
      metadataBytes,
      encryptedPayload,
    ],
    { type: "application/octet-stream" },
  );

  const encryptedFileName = `${file.name}.xeenc`;

  return {
    encryptedBlob: combinedBlob,
    encryptedFileName,
    metadata,
    sha256Hex,
  };
}

/**
 * Decrypt a .xeenc file with password
 */
export async function decryptFile(
  file: File,
  password: string,
): Promise<DecryptionResult> {
  if (!password) {
    throw new Error("Please provide the decryption password.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const totalLength = arrayBuffer.byteLength;

  const minHeaderLen = 5 + 1 + SALT_LENGTH + IV_LENGTH + 4;
  if (totalLength < minHeaderLen) {
    throw new Error("Invalid .xeenc file: file is too small or corrupted.");
  }

  let offset = 0;
  const magicBytes = new Uint8Array(arrayBuffer, offset, 5);
  const magicStr = new TextDecoder().decode(magicBytes);
  offset += 5;

  if (magicStr !== MAGIC_HEADER) {
    throw new Error(
      "Unrecognized file format: magic header does not match XEENC.",
    );
  }

  const version = new Uint8Array(arrayBuffer, offset, 1)[0];
  offset += 1;

  if (version !== FORMAT_VERSION) {
    throw new Error(
      `Unsupported XEENC format version (${version}). Expected version ${FORMAT_VERSION}.`,
    );
  }

  const salt = new Uint8Array(arrayBuffer, offset, SALT_LENGTH);
  offset += SALT_LENGTH;

  const iv = new Uint8Array(arrayBuffer, offset, IV_LENGTH);
  offset += IV_LENGTH;

  const metaLenView = new DataView(arrayBuffer, offset, 4);
  const metaLen = metaLenView.getUint32(0, false);
  offset += 4;

  if (offset + metaLen > totalLength) {
    throw new Error("Corrupted .xeenc file: metadata header overflow.");
  }

  const metaBytes = new Uint8Array(arrayBuffer, offset, metaLen);
  offset += metaLen;

  let metadata: EncryptedFileMetadata;
  try {
    const metaStr = new TextDecoder().decode(metaBytes);
    metadata = JSON.parse(metaStr);
  } catch {
    throw new Error("Corrupted metadata header inside encrypted file.");
  }

  const ciphertext = new Uint8Array(arrayBuffer, offset);

  // Derive key and decrypt payload
  const key = await deriveKey(
    password,
    salt,
    metadata.iterations || PBKDF2_ITERATIONS,
  );

  let decryptedBuffer: ArrayBuffer;
  try {
    decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      ciphertext,
    );
  } catch {
    throw new Error("Incorrect password or corrupted file data.");
  }

  // Verify SHA-256 Integrity
  const actualSha256 = await computeSha256(decryptedBuffer);
  const isIntegrityVerified =
    actualSha256.toLowerCase() === metadata.originalSha256.toLowerCase();

  const decryptedBlob = new Blob([decryptedBuffer], {
    type: metadata.originalFileType || "application/octet-stream",
  });

  return {
    decryptedBlob,
    originalFileName: metadata.originalFileName || "decrypted_file",
    originalFileSize: metadata.originalFileSize || decryptedBuffer.byteLength,
    originalFileType: metadata.originalFileType || "application/octet-stream",
    sha256Hex: actualSha256,
    isIntegrityVerified,
    metadata,
  };
}

/**
 * Sanitize custom reminder filename (no path traversal, alphanumeric + standard punctuation)
 */
export function sanitizeReminderFileName(
  rawName: string,
  defaultName: string,
): string {
  if (!rawName || !rawName.trim()) {
    return defaultName;
  }

  let clean = rawName.trim().replace(/[\\/:*?"<>|]/g, "_");
  clean = clean.replace(/\.\./g, "_");

  if (!clean.toLowerCase().endsWith(".txt")) {
    clean += ".txt";
  }

  return clean || defaultName;
}

/**
 * Generate formatted Plain Text Reminder content
 */
export function generateReminderText(config: ReminderConfig): string {
  const dateObj = config.metadata.createdAt
    ? new Date(config.metadata.createdAt)
    : new Date();
  const createdStr = formatDate(dateObj);
  const sizeFormatted = formatBytes(config.metadata.originalFileSize);

  const lines: string[] = [
    "=================================================================",
    "              XEOOTOOLS FILE ENCRYPTION REMINDER                 ",
    "=================================================================",
    "",
    `Encrypted File:       ${config.encryptedFileName}`,
    `Original File:        ${config.metadata.originalFileName}`,
    `Original File Size:   ${sizeFormatted} (${config.metadata.originalFileSize.toLocaleString()} Bytes)`,
    `Original SHA-256:     ${config.metadata.originalSha256}`,
    "",
    `Encryption Format:    XEENC v${config.metadata.formatVersion || 1}`,
    `Algorithm:            AES-256-GCM`,
    `Key Derivation:       PBKDF2-SHA-256`,
    `PBKDF2 Iterations:    ${(config.metadata.iterations || PBKDF2_ITERATIONS).toLocaleString()}`,
    `Created At:           ${createdStr}`,
    "",
    "-----------------------------------------------------------------",
    "                      USER REMINDER DETAILS                      ",
    "-----------------------------------------------------------------",
    `Password Hint:        ${config.passwordHint.trim() || "(None provided)"}`,
    `Notes:                ${config.notes.trim() || "(None provided)"}`,
    "",
  ];

  if (config.includePassword && config.password) {
    lines.push(
      "-----------------------------------------------------------------",
      "                 *** STORED ENCRYPTION PASSWORD ***              ",
      "-----------------------------------------------------------------",
      `Password:             ${config.password}`,
      "",
      "=================================================================",
      "                          SECURITY WARNING                       ",
      "=================================================================",
      "WARNING: Anyone with access to this reminder file can read the   ",
      "password and decrypt your protected file. Keep this file secure! ",
      "=================================================================",
    );
  } else {
    lines.push(
      "=================================================================",
      "                          SECURITY NOTICE                        ",
      "=================================================================",
      "The encryption password is NOT stored in this reminder.          ",
      "You must remember your original password to decrypt the file.   ",
      "=================================================================",
    );
  }

  return lines.join("\n");
}
