export interface UuidOptions {
  uppercase?: boolean;
  withoutHyphens?: boolean;
  braces?: boolean;
}

/**
 * Generates an RFC 4122 compliant UUID v4 string.
 * Uses native crypto.randomUUID() when available, or crypto.getRandomValues().
 */
export function generateSingleUuid(options: UuidOptions = {}): string {
  let uuid = "";

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    uuid = crypto.randomUUID();
  } else {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // RFC 4122 v4 variant & version bit manipulation
    bytes[6] = (bytes[6]! & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8]! & 0x3f) | 0x80; // Variant 1

    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0"));
    uuid = [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }

  if (options.withoutHyphens) {
    uuid = uuid.replace(/-/g, "");
  }

  if (options.uppercase) {
    uuid = uuid.toUpperCase();
  } else {
    uuid = uuid.toLowerCase();
  }

  if (options.braces) {
    uuid = `{${uuid}}`;
  }

  return uuid;
}

/**
 * Generates multiple UUIDs.
 */
export function generateMultipleUuids(
  count: number = 1,
  options: UuidOptions = {}
): string[] {
  const safeCount = Math.min(100, Math.max(1, count));
  const list: string[] = [];
  for (let i = 0; i < safeCount; i++) {
    list.push(generateSingleUuid(options));
  }
  return list;
}

