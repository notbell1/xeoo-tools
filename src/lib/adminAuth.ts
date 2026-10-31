import { BACKEND_URL } from "../config/backend";

const ADMIN_CSRF_STORAGE_KEY = "xeoo_admin_csrf";

/**
 * Returns the cached admin CSRF token, or fetches a new one from the session endpoint if missing.
 */
export async function getAdminCsrfToken(): Promise<string> {
  const cached = sessionStorage.getItem(ADMIN_CSRF_STORAGE_KEY);
  if (cached && cached.trim()) {
    return cached.trim();
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth.php`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "application/json",
      },
      body: new URLSearchParams({ action: "me" }),
    });

    if (res.ok) {
      const json = await res.json();
      const token = json?.data?.csrf_token;
      if (typeof token === "string" && token.trim()) {
        const cleanToken = token.trim();
        sessionStorage.setItem(ADMIN_CSRF_STORAGE_KEY, cleanToken);
        return cleanToken;
      }
    }
  } catch (error) {
    console.warn("Unable to fetch admin CSRF token:", error);
  }

  return "";
}

export function setAdminCsrfToken(token: string): void {
  if (typeof token === "string" && token.trim()) {
    sessionStorage.setItem(ADMIN_CSRF_STORAGE_KEY, token.trim());
  }
}

export function clearAdminCsrfToken(): void {
  sessionStorage.removeItem(ADMIN_CSRF_STORAGE_KEY);
}

