import { BACKEND_URL } from "../config/backend";

const VISITOR_COOKIE_NAME = "xeoo_vid";
const COOKIE_MAX_AGE_DAYS = 365;

/**
 * Get or create an anonymous visitor ID.
 * Persisted in cookies (1 year) with fallback to localStorage.
 */
export function getOrCreateVisitorId(): string {
  if (typeof document === "undefined") return "";

  // Check cookie
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${VISITOR_COOKIE_NAME}=([^;]+)`));
  if (match && match[2] && match[2].length >= 16) {
    return match[2];
  }

  // Check localStorage fallback
  try {
    const localId = localStorage.getItem(VISITOR_COOKIE_NAME);
    if (localId && localId.length >= 16) {
      setVisitorCookie(localId);
      return localId;
    }
  } catch {
    // Ignore storage errors
  }

  // Generate new anonymous ID (UUIDv4 without dashes or random hex)
  let newId = "";
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    newId = crypto.randomUUID().replace(/-/g, "");
  } else {
    newId = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  }

  setVisitorCookie(newId);
  try {
    localStorage.setItem(VISITOR_COOKIE_NAME, newId);
  } catch {
    // Ignore storage errors
  }

  return newId;
}

function setVisitorCookie(value: string) {
  if (typeof document === "undefined") return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${VISITOR_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

// In-memory cache to prevent tracking duplicate rapid transitions within 1 second
let lastTrackedPath = "";
let lastTrackedTime = 0;

export interface TrackPayload {
  path?: string;
  page_title?: string;
  page_type?: "tool" | "category" | "general";
  referrer?: string;
}

/**
 * Send track ping to backend traffic API
 */
export async function trackPageView(payload?: TrackPayload): Promise<void> {
  if (typeof window === "undefined") return;

  const pathname = payload?.path || window.location.pathname;

  // Never track admin panel routes
  if (pathname.startsWith("/mimin")) {
    return;
  }

  const now = Date.now();
  if (lastTrackedPath === pathname && now - lastTrackedTime < 1000) {
    return;
  }

  lastTrackedPath = pathname;
  lastTrackedTime = now;

  const visitorId = getOrCreateVisitorId();

  // Determine page type
  let pageType: "tool" | "category" | "general" = payload?.page_type || "general";
  if (!payload?.page_type) {
    if (pathname.startsWith("/tools/")) {
      pageType = "tool";
    } else if (pathname.startsWith("/category/")) {
      pageType = "category";
    }
  }

  // Extract UTM params
  const searchParams = new URLSearchParams(window.location.search);
  const utmSource = searchParams.get("utm_source") || null;
  const utmMedium = searchParams.get("utm_medium") || null;
  const utmCampaign = searchParams.get("utm_campaign") || null;

  const bodyData = {
    visitor_id: visitorId,
    path: pathname,
    page_title: payload?.page_title || document.title || "XeooTools",
    page_type: pageType,
    referrer: payload?.referrer || document.referrer || null,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    screen_width: window.innerWidth || null,
  };

  const endpoint = `${BACKEND_URL}/api/traffic/track.php`;
  const jsonString = JSON.stringify(bodyData);

  try {
    // Attempt sendBeacon first for reliability during page unload/navigation
    if (navigator.sendBeacon) {
      const blob = new Blob([jsonString], { type: "application/json; charset=UTF-8" });
      const success = navigator.sendBeacon(endpoint, blob);
      if (success) return;
    }

    // Fallback to fetch with credentials to maintain admin session verification
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      keepalive: true,
      body: jsonString,
    });
  } catch {
    // Fail silently so tracking never interferes with user experience
  }
}

