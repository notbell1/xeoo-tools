export type IPType = "IPv4" | "IPv6";

export type IPLookupData = {
  ip: string;
  version: IPType;

  hostname: string | null;

  city: string | null;
  region: string | null;
  regionCode: string | null;

  country: string | null;
  countryCode: string | null;
  countryCodeIso3: string | null;

  postal: string | null;

  continent: string | null;

  latitude: number | null;
  longitude: number | null;

  timezone: string | null;
  utcOffset: string | null;

  callingCode: string | null;

  currency: string | null;
  currencyName: string | null;

  languages: string | null;

  asn: string | null;
  organization: string | null;
};

export type IPLookupResponse = {
  success: boolean;
  message?: string;
  data?: {
    ip: string;
    type: IPType;

    hostname: string | null;

    location: {
      country_code: string | null;
      country: string | null;
      region: string | null;
      region_code: string | null;
      city: string | null;
      postal_code: string | null;

      continent: string | null;
      continent_code: string | null;

      latitude: number | null;
      longitude: number | null;
    };

    network: {
      asn: string | null;
      organization: string | null;
      domain: string | null;
      type: string | null;
    };

    timezone: {
      id: string | null;
      utc_offset: string | null;
    };

    country_meta: {
      iso3: string | null;
      continent: string | null;
      calling_code: string | null;
      currency: string | null;
      currency_name: string | null;
      languages: string | null;
    };

    source: string;
  };
};

const API_BASE = import.meta.env.VITE_API_URL || "/php/api";

/**
 * Normalize user input.
 */
export function normalizeIP(value: string): string {
  return value.trim();
}

/**
 * IPv4 validation.
 */
function isValidIPv4(value: string): boolean {
  const parts = value.split(".");

  if (parts.length !== 4) {
    return false;
  }

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) {
      return false;
    }

    if (part.length > 1 && part.startsWith("0")) {
      return false;
    }

    const number = Number(part);

    return number >= 0 && number <= 255;
  });
}

/**
 * IPv6 validation.
 *
 * Uses the browser/platform URL parser rather than relying on a large
 * handwritten IPv6 regex.
 */
function isValidIPv6(value: string): boolean {
  if (!value.includes(":")) {
    return false;
  }

  if (value.includes(":::")) {
    return false;
  }

  const parts = value.split(":");

  if (parts.length < 3 || parts.length > 8) {
    return false;
  }

  let compressionCount = 0;

  for (const part of parts) {
    if (part === "") {
      compressionCount += 1;
      continue;
    }

    if (!/^[0-9a-fA-F]{1,4}$/.test(part)) {
      /*
       * IPv4-mapped IPv6 can contain a dotted IPv4 tail.
       */
      if (part.includes(".")) {
        if (!isValidIPv4(part)) {
          return false;
        }

        continue;
      }

      return false;
    }
  }

  if (compressionCount > 2) {
    return false;
  }

  /*
   * If "::" is not present, exactly 8 groups are required.
   */
  if (!value.includes("::")) {
    const normalParts = parts.filter(Boolean);

    return normalParts.length === 8;
  }

  /*
   * "::" must compress at least one group.
   */
  const expandedGroups = parts.filter(Boolean).length;

  return expandedGroups < 8;
}

/**
 * Validate IPv4 or IPv6.
 */
export function isValidIP(value: string): boolean {
  const normalized = normalizeIP(value);

  if (!normalized) {
    return false;
  }

  return isValidIPv4(normalized) || isValidIPv6(normalized);
}

/**
 * Format coordinates for display.
 */
export function formatCoordinate(
  value: number | null,
): string {
  if (value === null || !Number.isFinite(value)) {
    return "Unavailable";
  }

  return value.toFixed(6);
}

/**
 * Build OpenStreetMap URL.
 */
export function buildMapUrl(
  latitude: number | null,
  longitude: number | null,
): string | null {
  if (
    latitude === null ||
    longitude === null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  if (latitude < -90 || latitude > 90) {
    return null;
  }

  if (longitude < -180 || longitude > 180) {
    return null;
  }

  return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(
    latitude,
  )}&mlon=${encodeURIComponent(
    longitude,
  )}#map=10/${encodeURIComponent(
    latitude,
  )}/${encodeURIComponent(longitude)}`;
}

/**
 * Convert backend response into the frontend structure.
 */
export function normalizeBackendData(
  payload: IPLookupResponse,
): IPLookupData {
  if (!payload.data) {
    throw new Error(
      payload.message || "The IP lookup service returned no data.",
    );
  }

  const data = payload.data;

  return {
    ip: data.ip,

    version: data.type,

    hostname: data.hostname ?? null,

    city: data.location.city ?? null,

    region: data.location.region ?? null,

    regionCode:
      data.location.region_code ??
      null,

    country:
      data.location.country ??
      data.location.country_code ??
      null,

    countryCode:
      data.location.country_code ??
      null,

    countryCodeIso3:
      data.country_meta?.iso3 ??
      null,

    postal:
      data.location.postal_code ??
      null,

    continent:
      data.location.continent ??
      data.country_meta?.continent ??
      null,

    latitude:
      typeof data.location.latitude === "number"
        ? data.location.latitude
        : null,

    longitude:
      typeof data.location.longitude === "number"
        ? data.location.longitude
        : null,

    timezone:
      data.timezone?.id ??
      null,

    utcOffset:
      data.timezone?.utc_offset ??
      null,

    callingCode:
      data.country_meta?.calling_code ??
      null,

    currency:
      data.country_meta?.currency ??
      null,

    currencyName:
      data.country_meta?.currency_name ??
      null,

    languages:
      data.country_meta?.languages ??
      null,

    asn:
      data.network?.asn ??
      null,

    organization:
      data.network?.organization ??
      null,
  };
}

/**
 * Lookup an IP.
 *
 * Empty value means:
 * "lookup current public IP".
 */
export async function lookupIP(
  ip?: string,
): Promise<IPLookupData> {
  const normalized =
    ip !== undefined
      ? normalizeIP(ip)
      : "";

  if (normalized && !isValidIP(normalized)) {
    throw new Error(
      "Enter a valid IPv4 or IPv6 address.",
    );
  }

  const endpoint = normalized
    ? `${API_BASE}/ip-lookup.php?ip=${encodeURIComponent(normalized)}`
    : `${API_BASE}/ip-lookup.php`;

  const response = await fetch(endpoint, {
    method: "GET",

    headers: {
      Accept: "application/json",
    },

    cache: "no-store",
  });

  let payload: IPLookupResponse;

  try {
    payload =
      (await response.json()) as IPLookupResponse;
  } catch {
    throw new Error(
      `The IP lookup service returned an invalid response (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      payload.message ||
        `IP lookup failed with HTTP ${response.status}.`,
    );
  }

  if (!payload.success) {
    throw new Error(
      payload.message ||
        "The IP lookup service could not return valid data.",
    );
  }

  return normalizeBackendData(payload);
}