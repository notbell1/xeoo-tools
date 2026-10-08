export interface StandardJwtClaims {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

export interface JwtDecodeResult {
  valid: boolean;
  error?: string;
  rawHeader: string;
  rawPayload: string;
  rawSignature: string;
  headerObj: Record<string, unknown> | null;
  payloadObj: Record<string, unknown> | null;
  formattedHeader: string;
  formattedPayload: string;
  standardClaims: StandardJwtClaims;
  expirationStatus: "active" | "expired" | "no_exp";
  expirationDisplay: string;
  issuedAtDisplay: string;
  notBeforeDisplay: string;
}

/**
 * Safely decodes a Base64URL encoded string to a UTF-8 string.
 */
export function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new TextDecoder().decode(bytes);
}

/**
 * Formats a UNIX timestamp (seconds) into a readable date.
 */
function formatUnixTimestamp(timestamp?: number): string {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
    return "Not specified";
  }
  const date = new Date(timestamp * 1000);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toUTCString();
}

/**
 * Decodes a raw JWT string into header, payload, signature, and standard claims.
 */
export function decodeJwt(token: string): JwtDecodeResult {
  const trimmed = token.trim();

  if (!trimmed) {
    return {
      valid: false,
      error: "Please enter a JWT token to decode.",
      rawHeader: "",
      rawPayload: "",
      rawSignature: "",
      headerObj: null,
      payloadObj: null,
      formattedHeader: "",
      formattedPayload: "",
      standardClaims: {},
      expirationStatus: "no_exp",
      expirationDisplay: "—",
      issuedAtDisplay: "—",
      notBeforeDisplay: "—",
    };
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      valid: false,
      error: `Invalid JWT format. A valid token must have 3 period-separated parts (Header.Payload.Signature). Found ${parts.length} part(s).`,
      rawHeader: "",
      rawPayload: "",
      rawSignature: "",
      headerObj: null,
      payloadObj: null,
      formattedHeader: "",
      formattedPayload: "",
      standardClaims: {},
      expirationStatus: "no_exp",
      expirationDisplay: "—",
      issuedAtDisplay: "—",
      notBeforeDisplay: "—",
    };
  }

  const [part0, part1, part2] = parts as [string, string, string];

  let headerJson = "";
  let payloadJson = "";
  let headerObj: Record<string, unknown> | null = null;
  let payloadObj: Record<string, unknown> | null = null;

  try {
    headerJson = base64UrlDecode(part0);
  } catch {
    return {
      valid: false,
      error: "Failed to decode JWT Header. Invalid Base64URL encoding.",
      rawHeader: part0,
      rawPayload: part1,
      rawSignature: part2,
      headerObj: null,
      payloadObj: null,
      formattedHeader: "",
      formattedPayload: "",
      standardClaims: {},
      expirationStatus: "no_exp",
      expirationDisplay: "—",
      issuedAtDisplay: "—",
      notBeforeDisplay: "—",
    };
  }

  try {
    payloadJson = base64UrlDecode(part1);
  } catch {
    return {
      valid: false,
      error: "Failed to decode JWT Payload. Invalid Base64URL encoding.",
      rawHeader: part0,
      rawPayload: part1,
      rawSignature: part2,
      headerObj: null,
      payloadObj: null,
      formattedHeader: "",
      formattedPayload: "",
      standardClaims: {},
      expirationStatus: "no_exp",
      expirationDisplay: "—",
      issuedAtDisplay: "—",
      notBeforeDisplay: "—",
    };
  }

  try {
    headerObj = JSON.parse(headerJson) as Record<string, unknown>;
  } catch {
    return {
      valid: false,
      error: "Decoded header is not valid JSON.",
      rawHeader: part0,
      rawPayload: part1,
      rawSignature: part2,
      headerObj: null,
      payloadObj: null,
      formattedHeader: headerJson,
      formattedPayload: "",
      standardClaims: {},
      expirationStatus: "no_exp",
      expirationDisplay: "—",
      issuedAtDisplay: "—",
      notBeforeDisplay: "—",
    };
  }

  try {
    payloadObj = JSON.parse(payloadJson) as Record<string, unknown>;
  } catch {
    return {
      valid: false,
      error: "Decoded payload is not valid JSON.",
      rawHeader: part0,
      rawPayload: part1,
      rawSignature: part2,
      headerObj,
      payloadObj: null,
      formattedHeader: JSON.stringify(headerObj, null, 2),
      formattedPayload: payloadJson,
      standardClaims: {},
      expirationStatus: "no_exp",
      expirationDisplay: "—",
      issuedAtDisplay: "—",
      notBeforeDisplay: "—",
    };
  }

  const standardClaims: StandardJwtClaims = {
    iss: typeof payloadObj.iss === "string" ? payloadObj.iss : undefined,
    sub: typeof payloadObj.sub === "string" ? payloadObj.sub : undefined,
    aud:
      typeof payloadObj.aud === "string" || Array.isArray(payloadObj.aud)
        ? (payloadObj.aud as string | string[])
        : undefined,
    exp: typeof payloadObj.exp === "number" ? payloadObj.exp : undefined,
    nbf: typeof payloadObj.nbf === "number" ? payloadObj.nbf : undefined,
    iat: typeof payloadObj.iat === "number" ? payloadObj.iat : undefined,
    jti: typeof payloadObj.jti === "string" ? payloadObj.jti : undefined,
  };

  let expirationStatus: "active" | "expired" | "no_exp" = "no_exp";
  let expirationDisplay = "No expiration (exp) claim set";

  if (standardClaims.exp !== undefined) {
    const now = Math.floor(Date.now() / 1000);
    const expDateStr = formatUnixTimestamp(standardClaims.exp);
    if (standardClaims.exp < now) {
      const diffMinutes = Math.round((now - standardClaims.exp) / 60);
      expirationStatus = "expired";
      expirationDisplay = `Expired: ${expDateStr} (${diffMinutes} min ago)`;
    } else {
      const diffMinutes = Math.round((standardClaims.exp - now) / 60);
      expirationStatus = "active";
      expirationDisplay = `Active: Expires ${expDateStr} (in ~${diffMinutes} min)`;
    }
  }

  return {
    valid: true,
    rawHeader: part0,
    rawPayload: part1,
    rawSignature: part2,
    headerObj,
    payloadObj,
    formattedHeader: JSON.stringify(headerObj, null, 2),
    formattedPayload: JSON.stringify(payloadObj, null, 2),
    standardClaims,
    expirationStatus,
    expirationDisplay,
    issuedAtDisplay: formatUnixTimestamp(standardClaims.iat),
    notBeforeDisplay: formatUnixTimestamp(standardClaims.nbf),
  };
}

