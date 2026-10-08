import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

/* =========================================================
   TYPES
========================================================= */

export type GeneratorMode = "qr" | "barcode";

export type QRFormat = "text" | "url" | "email" | "phone" | "wifi";

export type BarcodeFormat =
  | "CODE128"
  | "CODE39"
  | "EAN13"
  | "EAN8"
  | "UPC"
  | "ITF14";

export type QRErrorCorrection = "L" | "M" | "Q" | "H";

export interface QRSettings {
  size: number;
  margin: number;
  errorCorrection: QRErrorCorrection;
  darkColor: string;
  lightColor: string;
}

export interface BarcodeSettings {
  width: number;
  height: number;
  displayValue: boolean;
  fontSize: number;
  margin: number;
  lineColor: string;
  background: string;
}

export interface BarcodeValidationResult {
  valid: boolean;
  message?: string;
}

export interface QRValidationResult {
  valid: boolean;
  message?: string;
  field?: "content" | "password" | "security";
}

export interface WiFiValidationResult {
  valid: boolean;
  message?: string;
  field?: "ssid" | "password" | "security";
}

/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const QR_DEFAULT_SETTINGS: QRSettings = {
  size: 320,
  margin: 4,
  errorCorrection: "M",
  darkColor: "#111827",
  lightColor: "#ffffff",
};

const BARCODE_DEFAULT_SETTINGS: BarcodeSettings = {
  width: 2,
  height: 100,
  displayValue: true,
  fontSize: 18,
  margin: 12,
  lineColor: "#111827",
  background: "#ffffff",
};

/* =========================================================
   LIMITS / SECURITY
========================================================= */

const SECURITY_WARNING =
  "Nice try. Malicious script/XSS payloads are not allowed.";

const MAX_TEXT_LENGTH = 4000;
const MAX_EMAIL_LENGTH = 254;
const MAX_URL_LENGTH = 2048;
const MAX_PHONE_LENGTH = 32;
const MAX_WIFI_PASSWORD_LENGTH = 63;
const MAX_WIFI_SSID_BYTES = 32;

/*
 * Defensive patterns for common script/XSS payloads.
 * These are checked before payload generation.
 */
const UNSAFE_PATTERNS: RegExp[] = [
  /<\s*\/?\s*(?:script|iframe|object|embed|svg|math|style|link|meta|base|form|img|video|audio|source|marquee|details|textarea|input|button)\b/i,

  /\bon[a-z]+\s*=/i,

  /\b(?:javascript|vbscript|data|file|blob)\s*:/i,

  /\b(?:document|window|globalThis)\s*\.\s*(?:cookie|location|domain|referrer|body|documentElement|head|currentScript)\b/i,

  /\b(?:localStorage|sessionStorage|indexedDB)\b/i,

  /\b(?:innerHTML|outerHTML|insertAdjacentHTML|document\.write)\b/i,

  /\b(?:eval|Function|setTimeout|setInterval)\s*\(/i,

  /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/i,

  /\b(?:__proto__)\b/i,

  /\bconstructor\s*\[/i,

  /\bprototype\s*\[/i,

  /<\s*!doctype\b/i,

  /<\s*\?xml\b/i,
];

/* =========================================================
   ENCODED INPUT DECODER
========================================================= */

function decodePotentiallyEncoded(value: string): string {
  let decoded = value;

  for (let index = 0; index < 3; index += 1) {
    try {
      const next = decodeURIComponent(decoded);

      if (next === decoded) {
        break;
      }

      decoded = next;
    } catch {
      break;
    }
  }

  return decoded
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x2f;/gi, "/")
    .replace(/&#x3a;/gi, ":")
    .replace(/&#x3c;/gi, "<")
    .replace(/&#x3e;/gi, ">")
    .replace(/&#60;/gi, "<")
    .replace(/&#62;/gi, ">");
}

/* =========================================================
   XSS DETECTION
========================================================= */

export function containsUnsafePayload(value: string): boolean {
  if (!value) {
    return false;
  }

  const decoded = decodePotentiallyEncoded(value);

  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(decoded)) {
    return true;
  }

  return UNSAFE_PATTERNS.some((pattern) => pattern.test(decoded));
}

/* =========================================================
   HOSTNAME / URL VALIDATION
========================================================= */

const DOMAIN_LABEL = "[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?";

const DOMAIN_PATTERN = new RegExp(`^(?:${DOMAIN_LABEL}\\.)+[a-z]{2,63}$`, "i");

const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;

function isValidIPv4(hostname: string): boolean {
  if (!IPV4_PATTERN.test(hostname)) {
    return false;
  }

  return hostname.split(".").every((part) => {
    const number = Number(part);

    return Number.isInteger(number) && number >= 0 && number <= 255;
  });
}

function isValidHostname(hostname: string): boolean {
  const normalized = hostname.trim().replace(/\.$/, "");

  if (!normalized || normalized.length > 253) {
    return false;
  }

  if (isValidIPv4(normalized)) {
    return true;
  }

  return DOMAIN_PATTERN.test(normalized);
}

/* =========================================================
   URL
========================================================= */

export function normalizeWebsiteUrl(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Website URL is required.");
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    throw new Error(
      `Website URL must not exceed ${MAX_URL_LENGTH} characters.`,
    );
  }

  if (containsUnsafePayload(trimmed)) {
    throw new Error(SECURITY_WARNING);
  }

  if (/\s/.test(trimmed)) {
    throw new Error("Website URL cannot contain spaces.");
  }

  let candidate = trimmed;

  /*
   * Allowed:
   * website.com
   * www.website.com
   * http://website.com
   * https://website.com
   */
  if (!/^https?:\/\//i.test(candidate)) {
    if (/^[a-z][a-z\d+.-]*:/i.test(candidate)) {
      throw new Error("Only HTTP and HTTPS URLs are allowed.");
    }

    candidate = `https://${candidate}`;
  }

  let parsed: URL;

  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("Enter a valid website URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are allowed.");
  }

  if (parsed.username || parsed.password) {
    throw new Error("Website URLs with embedded credentials are not allowed.");
  }

  if (!isValidHostname(parsed.hostname)) {
    throw new Error("Enter a valid website domain.");
  }

  return parsed.toString();
}

export function validateWebsiteUrl(value: string): QRValidationResult {
  try {
    normalizeWebsiteUrl(value);

    return {
      valid: true,
    };
  } catch (error) {
    return {
      valid: false,
      field: "content",
      message:
        error instanceof Error ? error.message : "Enter a valid website URL.",
    };
  }
}

/* =========================================================
   TEXT
========================================================= */

export function validateTextInput(value: string): QRValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      valid: false,
      field: "content",
      message: "Text content is required.",
    };
  }

  if (trimmed.length > MAX_TEXT_LENGTH) {
    return {
      valid: false,
      field: "content",
      message: `Text must not exceed ${MAX_TEXT_LENGTH} characters.`,
    };
  }

  if (containsUnsafePayload(trimmed)) {
    return {
      valid: false,
      field: "content",
      message: SECURITY_WARNING,
    };
  }

  return {
    valid: true,
  };
}

/* =========================================================
   EMAIL
========================================================= */

const EMAIL_PATTERN =
  /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

export function normalizeEmail(value: string): string {
  let email = value.trim();

  if (/^mailto:/i.test(email)) {
    email = email.replace(/^mailto:/i, "");
  }

  if (!email) {
    throw new Error("Email address is required.");
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    throw new Error(`Email must not exceed ${MAX_EMAIL_LENGTH} characters.`);
  }

  if (containsUnsafePayload(email)) {
    throw new Error(SECURITY_WARNING);
  }

  if (/\s/.test(email)) {
    throw new Error("Email cannot contain spaces.");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  const atIndex = email.lastIndexOf("@");

  const localPart = email.slice(0, atIndex);

  const domain = email.slice(atIndex + 1);

  if (localPart.length > 64 || !isValidHostname(domain)) {
    throw new Error("Enter a valid email address and domain.");
  }

  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..")
  ) {
    throw new Error("Enter a valid email address.");
  }

  return email;
}

export function validateEmail(value: string): QRValidationResult {
  try {
    normalizeEmail(value);

    return {
      valid: true,
    };
  } catch (error) {
    return {
      valid: false,
      field: "content",
      message:
        error instanceof Error ? error.message : "Enter a valid email address.",
    };
  }
}

/* =========================================================
   PHONE
========================================================= */

const PHONE_PATTERN = /^\+?[0-9\s().-]+$/;

export function normalizePhone(value: string): string {
  let phone = value.trim();

  if (/^tel:/i.test(phone)) {
    phone = phone.replace(/^tel:/i, "");
  }

  if (!phone) {
    throw new Error("Phone number is required.");
  }

  if (phone.length > MAX_PHONE_LENGTH) {
    throw new Error(
      `Phone number must not exceed ${MAX_PHONE_LENGTH} characters.`,
    );
  }

  if (containsUnsafePayload(phone)) {
    throw new Error(SECURITY_WARNING);
  }

  if (!PHONE_PATTERN.test(phone)) {
    throw new Error("Enter a valid phone number.");
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length < 8 || digits.length > 15) {
    throw new Error("Phone number must contain 8 to 15 digits.");
  }

  return phone;
}

export function validatePhone(value: string): QRValidationResult {
  try {
    normalizePhone(value);

    return {
      valid: true,
    };
  } catch (error) {
    return {
      valid: false,
      field: "content",
      message:
        error instanceof Error ? error.message : "Enter a valid phone number.",
    };
  }
}

/* =========================================================
   WIFI
========================================================= */

function getUtf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function hasInvalidControlCharacters(value: string): boolean {
  return /[\u0000-\u001F\u007F]/.test(value);
}

export function validateWiFiSSID(value: string): WiFiValidationResult {
  const ssid = value.trim();

  if (!ssid) {
    return {
      valid: false,
      field: "ssid",
      message: "Wi-Fi network name is required.",
    };
  }

  if (getUtf8ByteLength(ssid) > MAX_WIFI_SSID_BYTES) {
    return {
      valid: false,
      field: "ssid",
      message: "Wi-Fi network name must be 32 bytes or less.",
    };
  }

  if (hasInvalidControlCharacters(ssid)) {
    return {
      valid: false,
      field: "ssid",
      message: "Wi-Fi network name contains unsupported characters.",
    };
  }

  if (containsUnsafePayload(ssid)) {
    return {
      valid: false,
      field: "ssid",
      message: SECURITY_WARNING,
    };
  }

  return {
    valid: true,
  };
}

export function validateWiFiPassword(
  password: string,
  security: string,
): WiFiValidationResult {
  if (!["WPA", "WEP", "nopass"].includes(security)) {
    return {
      valid: false,
      field: "security",
      message: "Unsupported Wi-Fi security type.",
    };
  }

  if (containsUnsafePayload(password)) {
    return {
      valid: false,
      field: "password",
      message: SECURITY_WARNING,
    };
  }

  if (hasInvalidControlCharacters(password)) {
    return {
      valid: false,
      field: "password",
      message: "Wi-Fi password contains unsupported characters.",
    };
  }

  if (security === "nopass") {
    if (password.length > 0) {
      return {
        valid: false,
        field: "password",
        message: "Remove the password when using No Password security.",
      };
    }

    return {
      valid: true,
    };
  }

  if (security === "WPA") {
    if (password.length < 8 || password.length > MAX_WIFI_PASSWORD_LENGTH) {
      return {
        valid: false,
        field: "password",
        message: "WPA password must be 8 to 63 characters.",
      };
    }

    return {
      valid: true,
    };
  }

  /*
   * WEP:
   * 5 or 13 ASCII chars
   * OR
   * 10 or 26 hexadecimal chars
   */

  const asciiLengthValid = password.length === 5 || password.length === 13;

  const hexLengthValid =
    /^[0-9A-Fa-f]+$/.test(password) &&
    (password.length === 10 || password.length === 26);

  if (!asciiLengthValid && !hexLengthValid) {
    return {
      valid: false,
      field: "password",
      message:
        "WEP password must be 5 or 13 characters, or 10 or 26 hexadecimal characters.",
    };
  }

  return {
    valid: true,
  };
}

export function validateWiFiCredentials(
  ssid: string,
  password: string,
  security: string,
): WiFiValidationResult {
  const ssidResult = validateWiFiSSID(ssid);

  if (!ssidResult.valid) {
    return ssidResult;
  }

  return validateWiFiPassword(password, security);
}

/* =========================================================
   QR VALIDATION
========================================================= */

export function validateQRInput(
  format: QRFormat,
  value: string,
  wifiPassword = "",
  wifiSecurity = "WPA",
): QRValidationResult {
  switch (format) {
    case "url":
      return validateWebsiteUrl(value);

    case "email":
      return validateEmail(value);

    case "phone":
      return validatePhone(value);

    case "wifi": {
      const result = validateWiFiCredentials(value, wifiPassword, wifiSecurity);

      return {
        valid: result.valid,
        message: result.message,
        field:
          result.field === "ssid"
            ? "content"
            : result.field === "password"
              ? "password"
              : "security",
      };
    }

    case "text":
    default:
      return validateTextInput(value);
  }
}

/* =========================================================
   DEFAULT SETTINGS
========================================================= */

export function getDefaultQRSettings(): QRSettings {
  return {
    ...QR_DEFAULT_SETTINGS,
  };
}

export function getDefaultBarcodeSettings(): BarcodeSettings {
  return {
    ...BARCODE_DEFAULT_SETTINGS,
  };
}

/* =========================================================
   QR PAYLOAD
========================================================= */

export function buildQRPayload(
  value: string,
  format: QRFormat,
  wifiPassword = "",
  wifiSecurity = "WPA",
  wifiHidden = false,
): string {
  const trimmed = value.trim();

  switch (format) {
    case "url":
      return normalizeWebsiteUrl(trimmed);

    case "email":
      return `mailto:${normalizeEmail(trimmed)}`;

    case "phone":
      return `tel:${normalizePhone(trimmed)}`;

    case "wifi": {
      const validation = validateWiFiCredentials(
        trimmed,
        wifiPassword,
        wifiSecurity,
      );

      if (!validation.valid) {
        throw new Error(validation.message ?? "Invalid Wi-Fi configuration.");
      }

      const escapeWifiValue = (input: string): string =>
        input
          .replace(/\\/g, "\\\\")
          .replace(/;/g, "\\;")
          .replace(/,/g, "\\,")
          .replace(/:/g, "\\:");

      const ssid = escapeWifiValue(trimmed);

      const password = escapeWifiValue(wifiPassword);

      return `WIFI:T:${wifiSecurity};S:${ssid};P:${password};H:${wifiHidden ? "true" : "false"};;`;
    }

    case "text":
    default: {
      const validation = validateTextInput(trimmed);

      if (!validation.valid) {
        throw new Error(validation.message ?? "Invalid text content.");
      }

      return trimmed;
    }
  }
}

/* =========================================================
   QR GENERATION
========================================================= */

export async function generateQRDataURL(
  payload: string,
  settings: QRSettings = QR_DEFAULT_SETTINGS,
): Promise<string> {
  if (!payload.trim()) {
    throw new Error("QR Code data cannot be empty.");
  }

  if (containsUnsafePayload(payload)) {
    throw new Error(SECURITY_WARNING);
  }

  return QRCode.toDataURL(payload, {
    width: settings.size,
    margin: settings.margin,
    errorCorrectionLevel: settings.errorCorrection,
    color: {
      dark: settings.darkColor,
      light: settings.lightColor,
    },
  });
}

export async function generateQRSVG(
  payload: string,
  settings: QRSettings = QR_DEFAULT_SETTINGS,
): Promise<string> {
  if (!payload.trim()) {
    throw new Error("QR Code data cannot be empty.");
  }

  if (containsUnsafePayload(payload)) {
    throw new Error(SECURITY_WARNING);
  }

  return QRCode.toString(payload, {
    type: "svg",
    width: settings.size,
    margin: settings.margin,
    errorCorrectionLevel: settings.errorCorrection,
    color: {
      dark: settings.darkColor,
      light: settings.lightColor,
    },
  });
}

/* =========================================================
   BARCODE VALIDATION
========================================================= */

export function validateBarcodeValue(
  value: string,
  format: BarcodeFormat,
): BarcodeValidationResult {
  const normalized = value.trim();

  if (!normalized) {
    return {
      valid: false,
      message: "Barcode value is required.",
    };
  }

  if (containsUnsafePayload(normalized)) {
    return {
      valid: false,
      message: SECURITY_WARNING,
    };
  }

  switch (format) {
    case "EAN13":
      if (!/^\d{12,13}$/.test(normalized)) {
        return {
          valid: false,
          message: "EAN-13 must contain 12 or 13 digits.",
        };
      }
      break;

    case "EAN8":
      if (!/^\d{7,8}$/.test(normalized)) {
        return {
          valid: false,
          message: "EAN-8 must contain 7 or 8 digits.",
        };
      }
      break;

    case "UPC":
      if (!/^\d{11,12}$/.test(normalized)) {
        return {
          valid: false,
          message: "UPC-A must contain 11 or 12 digits.",
        };
      }
      break;

    case "ITF14":
      if (!/^\d{13,14}$/.test(normalized)) {
        return {
          valid: false,
          message: "ITF-14 must contain 13 or 14 digits.",
        };
      }
      break;

    case "CODE39":
      if (!/^[0-9A-Z\-. $/+%]+$/.test(normalized)) {
        return {
          valid: false,
          message:
            "CODE 39 supports uppercase letters, numbers, spaces, and - . $ / + %.",
        };
      }
      break;

    case "CODE128":
    default:
      if (normalized.length > 2000) {
        return {
          valid: false,
          message: "CODE 128 value must not exceed 2,000 characters.",
        };
      }
      break;
  }

  return {
    valid: true,
  };
}

/* =========================================================
   BARCODE GENERATION
========================================================= */

export function generateBarcodeSVG(
  value: string,
  format: BarcodeFormat,
  settings: BarcodeSettings = BARCODE_DEFAULT_SETTINGS,
): string {
  const validation = validateBarcodeValue(value, format);

  if (!validation.valid) {
    throw new Error(validation.message ?? "Invalid barcode value.");
  }

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  JsBarcode(svg, value.trim(), {
    format: getJsBarcodeFormat(format),
    width: settings.width,
    height: settings.height,
    displayValue: settings.displayValue,
    fontSize: settings.fontSize,
    margin: settings.margin,
    lineColor: settings.lineColor,
    background: settings.background,
    textMargin: 6,
  });

  return new XMLSerializer().serializeToString(svg);
}

function getJsBarcodeFormat(format: BarcodeFormat): string {
  switch (format) {
    case "EAN13":
      return "EAN13";

    case "EAN8":
      return "EAN8";

    case "UPC":
      return "UPC";

    case "ITF14":
      return "ITF14";

    case "CODE39":
      return "CODE39";

    case "CODE128":
    default:
      return "CODE128";
  }
}

/* =========================================================
   BARCODE SVG -> PNG
========================================================= */

export async function barcodeSVGToDataURL(svgMarkup: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgMarkup], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      const scale = 2;

      const width = image.naturalWidth || image.width;

      const height = image.naturalHeight || image.height;

      if (!width || !height) {
        URL.revokeObjectURL(url);

        reject(new Error("Barcode SVG size could not be determined."));

        return;
      }

      canvas.width = width * scale;

      canvas.height = height * scale;

      const context = canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(url);

        reject(new Error("Canvas is not available in this browser."));

        return;
      }

      context.fillStyle = "#ffffff";

      context.fillRect(0, 0, canvas.width, canvas.height);

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(url);

      resolve(canvas.toDataURL("image/png"));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);

      reject(new Error("Failed to convert barcode to PNG."));
    };

    image.src = url;
  });
}

/* =========================================================
   DOWNLOAD HELPERS
========================================================= */

export function downloadDataURL(dataURL: string, filename: string): void {
  const link = document.createElement("a");

  link.href = dataURL;

  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();
}

export function downloadSVG(svgMarkup: string, filename: string): void {
  const blob = new Blob([svgMarkup], {
    type: "image/svg+xml;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}

/* =========================================================
   CLIPBOARD
========================================================= */

export async function copyText(value: string): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error("Clipboard is not supported by this browser.");
  }

  await navigator.clipboard.writeText(value);
}

/* =========================================================
   SAFE FILENAME
========================================================= */

export function createSafeFilename(
  value: string,
  prefix: string,
  extension: string,
): string {
  const cleaned = value
    .trim()
    .replace(/https?:\/\//gi, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  const name = cleaned || "xeootools";

  return `${prefix}-${name}.${extension}`;
}
