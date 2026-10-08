export interface PossibleHashMatch {
  name: string;
  category: "General Digest" | "Password Hash" | "Checksum" | "Cryptographic KDF";
  confidence: "High" | "Medium" | "Low";
  details: string;
}

export interface HashIdentificationResult {
  input: string;
  length: number;
  isHex: boolean;
  isBase64: boolean;
  hasSpecialPrefix: boolean;
  matches: PossibleHashMatch[];
}

/**
 * Identifies probable hash algorithms based on format, prefixes, and length.
 */
export function identifyHash(rawHash: string): HashIdentificationResult {
  const trimmed = rawHash.trim();
  const length = trimmed.length;

  const isHex = /^[0-9a-fA-F]+$/.test(trimmed);
  const isBase64 = /^[0-9a-zA-Z+/=_-]+$/.test(trimmed);
  const hasSpecialPrefix = trimmed.startsWith("$");

  const matches: PossibleHashMatch[] = [];

  // 1. Prefix checks (High confidence)
  if (trimmed.startsWith("$2a$") || trimmed.startsWith("$2b$") || trimmed.startsWith("$2y$")) {
    matches.push({
      name: "bcrypt (Blowfish)",
      category: "Password Hash",
      confidence: "High",
      details: "Standard modular crypt format for OpenBSD bcrypt password hashes.",
    });
  } else if (trimmed.startsWith("$argon2id$") || trimmed.startsWith("$argon2i$") || trimmed.startsWith("$argon2d$")) {
    matches.push({
      name: "Argon2",
      category: "Password Hash",
      confidence: "High",
      details: "Password Hashing Competition winning algorithm in PHC format.",
    });
  } else if (trimmed.startsWith("$6$")) {
    matches.push({
      name: "SHA-512 Crypt",
      category: "Password Hash",
      confidence: "High",
      details: "Standard Unix/Linux shadow password hash format using SHA-512.",
    });
  } else if (trimmed.startsWith("$5$")) {
    matches.push({
      name: "SHA-256 Crypt",
      category: "Password Hash",
      confidence: "High",
      details: "Standard Unix/Linux shadow password hash format using SHA-256.",
    });
  } else if (trimmed.startsWith("$1$")) {
    matches.push({
      name: "MD5 Crypt",
      category: "Password Hash",
      confidence: "High",
      details: "Standard FreeBSD/Linux legacy password format ($1$).",
    });
  } else if (trimmed.startsWith("$pbkdf2")) {
    matches.push({
      name: "PBKDF2",
      category: "Cryptographic KDF",
      confidence: "High",
      details: "Password-Based Key Derivation Function 2 modular format.",
    });
  }

  // 2. Length-based hexadecimal checks
  if (isHex) {
    switch (length) {
      case 8:
        matches.push({
          name: "CRC-32",
          category: "Checksum",
          confidence: "High",
          details: "32-bit cyclic redundancy checksum commonly used in ZIP and Ethernet frames.",
        });
        matches.push({
          name: "Adler-32",
          category: "Checksum",
          confidence: "Low",
          details: "Checksum algorithm used in zlib compression.",
        });
        break;

      case 16:
        matches.push({
          name: "MySQL 3.23 / 4.0",
          category: "Password Hash",
          confidence: "Medium",
          details: "Legacy MySQL old password hash.",
        });
        matches.push({
          name: "CRC-64",
          category: "Checksum",
          confidence: "Low",
          details: "64-bit cyclic redundancy check.",
        });
        break;

      case 32:
        matches.push({
          name: "MD5",
          category: "General Digest",
          confidence: "High",
          details: "128-bit hash standard. Widely used for file integrity checksums.",
        });
        matches.push({
          name: "NTLM",
          category: "Password Hash",
          confidence: "High",
          details: "Microsoft Windows NT LAN Manager MD4-based password hash.",
        });
        matches.push({
          name: "MD4",
          category: "General Digest",
          confidence: "Medium",
          details: "128-bit predecessor to MD5.",
        });
        matches.push({
          name: "RIPEMD-128",
          category: "General Digest",
          confidence: "Low",
          details: "128-bit cryptographic hash function.",
        });
        break;

      case 40:
        matches.push({
          name: "SHA-1",
          category: "General Digest",
          confidence: "High",
          details: "160-bit digest produced by Secure Hash Algorithm 1 (and Git commit IDs).",
        });
        matches.push({
          name: "RIPEMD-160",
          category: "General Digest",
          confidence: "Medium",
          details: "160-bit cryptographic hash function used in Bitcoin address generation.",
        });
        matches.push({
          name: "MySQL 4.1+ (SHA-1 pair)",
          category: "Password Hash",
          confidence: "Medium",
          details: "Double-SHA1 password hashing used in modern MySQL.",
        });
        break;

      case 56:
        matches.push({
          name: "SHA-224",
          category: "General Digest",
          confidence: "High",
          details: "224-bit truncated variant of SHA-256.",
        });
        matches.push({
          name: "SHA3-224",
          category: "General Digest",
          confidence: "Medium",
          details: "224-bit Keccak permutation member.",
        });
        break;

      case 64:
        matches.push({
          name: "SHA-256",
          category: "General Digest",
          confidence: "High",
          details: "256-bit member of the SHA-2 family. Industry standard for integrity and digital signatures.",
        });
        matches.push({
          name: "SHA3-256",
          category: "General Digest",
          confidence: "Medium",
          details: "256-bit Keccak-based cryptographic hash function.",
        });
        matches.push({
          name: "BLAKE2s",
          category: "General Digest",
          confidence: "Medium",
          details: "256-bit high-speed cryptographic hash optimized for 8 to 32-bit platforms.",
        });
        break;

      case 96:
        matches.push({
          name: "SHA-384",
          category: "General Digest",
          confidence: "High",
          details: "384-bit truncated variant of SHA-512.",
        });
        matches.push({
          name: "SHA3-384",
          category: "General Digest",
          confidence: "Medium",
          details: "384-bit Keccak permutation member.",
        });
        break;

      case 128:
        matches.push({
          name: "SHA-512",
          category: "General Digest",
          confidence: "High",
          details: "512-bit member of the SHA-2 family. Widely used in security systems.",
        });
        matches.push({
          name: "SHA3-512",
          category: "General Digest",
          confidence: "Medium",
          details: "512-bit member of the SHA-3 family.",
        });
        matches.push({
          name: "BLAKE2b",
          category: "General Digest",
          confidence: "Medium",
          details: "512-bit high-speed cryptographic hash function optimized for 64-bit platforms.",
        });
        matches.push({
          name: "Whirlpool",
          category: "General Digest",
          confidence: "Low",
          details: "512-bit cryptographic hash created by Vincent Rijmen and Paulo Barreto.",
        });
        break;
    }
  }

  // 3. Fallback for unclassified formats
  if (matches.length === 0 && length > 0) {
    if (isBase64 && length === 44 && trimmed.endsWith("=")) {
      matches.push({
        name: "Base64-encoded SHA-256",
        category: "General Digest",
        confidence: "Medium",
        details: "256-bit raw binary digest encoded in standard RFC 4648 Base64.",
      });
    } else if (isBase64 && length === 88 && trimmed.endsWith("==")) {
      matches.push({
        name: "Base64-encoded SHA-512",
        category: "General Digest",
        confidence: "Medium",
        details: "512-bit raw binary digest encoded in standard RFC 4648 Base64.",
      });
    } else {
      matches.push({
        name: "Unrecognized / Custom Hash Format",
        category: "General Digest",
        confidence: "Low",
        details: `String is ${length} characters long. It does not match standard hexadecimal lengths or common crypt prefixes.`,
      });
    }
  }

  return {
    input: trimmed,
    length,
    isHex,
    isBase64,
    hasSpecialPrefix,
    matches,
  };
}

