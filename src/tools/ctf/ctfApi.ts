import { BACKEND_URL } from "../../config/backend";
import type {
  ApiResponse,
  ChallengeDetail,
  ChallengeSummary,
  LeaderboardResponse,
  PlayerProfileResponse,
  CtfSessionState,
  CtfSettings,
  SubmitResult,
  AdminOverviewData,
  AdminPlayersResponse,
  AdminChallengesResponse,
  AdminSecurityResponse,
} from "./ctfTypes";

const CTF_BASE_URL = `${BACKEND_URL}/ctf`;

let inMemoryCsrfToken = "";

export function setCsrfToken(token: string) {
  if (token) {
    inMemoryCsrfToken = token;
    try {
      sessionStorage.setItem("xeoo_ctf_csrf", token);
    } catch {
      // ignore
    }
  }
}

export function getCsrfToken(): string {
  if (!inMemoryCsrfToken) {
    try {
      inMemoryCsrfToken = sessionStorage.getItem("xeoo_ctf_csrf") || "";
    } catch {
      // ignore
    }
  }
  return inMemoryCsrfToken;
}

export class CtfApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status = 500, data: unknown = null) {
    super(message);
    this.name = "CtfApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${CTF_BASE_URL}${endpoint}`;
  const method = (options.method || "GET").toUpperCase();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (method !== "GET" && method !== "HEAD") {
    const csrf = getCsrfToken();
    if (csrf) {
      headers["X-CSRF-Token"] = csrf;
      headers["X-CTF-CSRF-Token"] = csrf;
    }
    if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  let json: ApiResponse<T>;
  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new CtfApiError("Invalid JSON response from CTF backend", response.status);
  }

  // Update CSRF token if returned in response data
  if (json.data && typeof json.data === "object" && "csrf_token" in (json.data as Record<string, unknown>)) {
    const token = (json.data as unknown as { csrf_token: string }).csrf_token;
    if (typeof token === "string" && token) {
      setCsrfToken(token);
    }
  }

  if (!response.ok || !json.success) {
    throw new CtfApiError(json.message || json.error || "Request failed", response.status, json.data);
  }

  return json;
}

export const ctfApi = {
  // Session & Auth
  async getSession(): Promise<ApiResponse<CtfSessionState>> {
    const res = await request<CtfSessionState>("/auth/session.php");
    if (res.data?.csrf_token) {
      setCsrfToken(res.data.csrf_token);
    }
    return res;
  },

  async login(login: string, password: string): Promise<ApiResponse<{ user: unknown; csrf_token: string }>> {
    return request("/auth/login.php", {
      method: "POST",
      body: JSON.stringify({ login, identity: login, username: login, password }),
    });
  },

  async register(payload: {
    username: string;
    email: string;
    password: string;
    password_confirmation?: string;
    confirm_password?: string;
    country_code: string;
  }): Promise<ApiResponse<{ user: unknown; csrf_token: string }>> {
    const passConfirm = payload.password_confirmation || payload.confirm_password || payload.password;
    return request("/auth/register.php", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        password_confirmation: passConfirm,
        confirm_password: passConfirm,
      }),
    });
  },

  async logout(): Promise<ApiResponse<{ logged_out: boolean }>> {
    return request("/auth/logout.php", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  async forgotPassword(email: string): Promise<ApiResponse<{ reset_token?: string }>> {
    return request("/auth/forgot-password.php", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(payload: {
    token: string;
    password: string;
  }): Promise<ApiResponse<{ reset_success: boolean }>> {
    return request("/auth/reset-password.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Player Profile & Settings
  async getProfile(): Promise<ApiResponse<PlayerProfileResponse>> {
    return request<PlayerProfileResponse>("/player/profile.php");
  },

  async updateProfile(payload: {
    username: string;
    email: string;
    country_code: string;
  }): Promise<ApiResponse<{ user: unknown }>> {
    return request("/player/settings.php", {
      method: "POST",
      body: JSON.stringify({ action: "update_profile", ...payload }),
    });
  },

  async changePassword(payload: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<ApiResponse<{ password_changed: boolean }>> {
    return request("/player/settings.php", {
      method: "POST",
      body: JSON.stringify({ action: "change_password", ...payload }),
    });
  },

  // Challenges
  async getChallenges(params?: {
    category?: string;
    difficulty?: string;
  }): Promise<ApiResponse<{ challenges: ChallengeSummary[]; total_challenges: number; total_score: number }>> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "all") query.set("category", params.category);
    if (params?.difficulty && params.difficulty !== "all") query.set("difficulty", params.difficulty);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/challenges/list.php${qs}`);
  },

  async getChallengeDetail(slug: string): Promise<ApiResponse<{ challenge: ChallengeDetail }>> {
    return request<{ challenge: ChallengeDetail }>(`/challenges/detail.php?slug=${encodeURIComponent(slug)}`);
  },

  async submitFlag(challengeId: number, flag: string): Promise<ApiResponse<SubmitResult>> {
    return request<SubmitResult>("/challenges/submit.php", {
      method: "POST",
      body: JSON.stringify({ challenge_id: challengeId, flag }),
    });
  },

  async unlockHint(challengeId: number, hintId: number): Promise<ApiResponse<{ hint_id: number; cost: number; content: string }>> {
    return request("/challenges/hint.php", {
      method: "POST",
      body: JSON.stringify({ challenge_id: challengeId, hint_id: hintId }),
    });
  },

  // Leaderboard
  async getLeaderboard(): Promise<ApiResponse<LeaderboardResponse>> {
    return request<LeaderboardResponse>("/leaderboard/index.php");
  },

  // Admin APIs (Authenticated via Mimin session)
  async adminOverview(): Promise<ApiResponse<AdminOverviewData>> {
    return request<AdminOverviewData>("/admin/overview.php");
  },

  async adminPlayers(search = "", limit = 50, offset = 0): Promise<ApiResponse<AdminPlayersResponse>> {
    const qs = new URLSearchParams({ search, limit: String(limit), offset: String(offset) }).toString();
    return request<AdminPlayersResponse>(`/admin/players.php?${qs}`);
  },

  async adminPlayerAction(
    action: "ban" | "unban" | "reset_sessions" | "adjust_score" | "reset_progress",
    payload: Record<string, unknown>
  ): Promise<ApiResponse<{ success: boolean }>> {
    return request("/admin/players.php", {
      method: "POST",
      body: JSON.stringify({ action, ...payload }),
    });
  },

  async adminChallenges(): Promise<ApiResponse<AdminChallengesResponse>> {
    return request<AdminChallengesResponse>("/admin/challenges.php");
  },

  async adminToggleChallenge(id: number, isActive: boolean): Promise<ApiResponse<{ updated: boolean }>> {
    return request("/admin/challenges.php", {
      method: "POST",
      body: JSON.stringify({ action: "toggle", id, is_active: isActive }),
    });
  },

  async adminSettings(): Promise<ApiResponse<{ settings: CtfSettings }>> {
    return request<{ settings: CtfSettings }>("/admin/settings.php");
  },

  async adminUpdateSettings(settings: Partial<CtfSettings>): Promise<ApiResponse<{ settings?: CtfSettings; updated?: boolean }>> {
    return request("/admin/settings.php", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  },

  async adminSecurity(limit = 100): Promise<ApiResponse<AdminSecurityResponse>> {
    return request<AdminSecurityResponse>(`/admin/security.php?limit=${limit}`);
  },
};

