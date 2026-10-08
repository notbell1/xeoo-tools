/**
 * XeooTools — Defacement CTF Subsystem: TypeScript Types
 */

export type ChallengeDifficulty = "easy" | "medium" | "hard";

export type ArtifactType = "html" | "css" | "javascript" | "image" | "json" | "text" | "metadata";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  error_code?: string;
}

export interface CtfUser {
  id: number;
  username: string;
  email: string;
  country_code: string;
  created_at?: string;
}

export interface CtfSettings {
  ctf_enabled: boolean;
  registration_enabled: boolean;
  login_enabled: boolean;
  password_reset_enabled?: boolean;
  submissions_enabled: boolean;
  leaderboard_enabled: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  soon_message: string;
}

export interface CtfSessionState {
  authenticated: boolean;
  user: CtfUser | null;
  solved_count: number;
  solved_challenge_ids: number[];
  total_score: number;
  total_challenges: number;
  csrf_token: string;
  settings: CtfSettings;
}

export interface ChallengeSummary {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: ChallengeDifficulty;
  points: number;
  estimated_minutes: number;
  case_reference: string;
  solves_count: number;
  solved: boolean;
}

export interface ChallengeArtifact {
  id: string;
  name: string;
  type: ArtifactType;
  role: "primary" | "supporting" | "confirmation" | "decoy";
  content: string;
  metadata?: Record<string, string | number> | null;
}

export interface ChallengeStage {
  id: string;
  title: string;
  objective: string;
  clue?: string;
  observation?: string;
  extraction_method?: string;
  interpretation?: string;
  next_action?: string;
}

export interface ChallengeHint {
  id: number;
  title: string;
  cost: number;
  unlocked: boolean;
  hint_text?: string | null;
}

export interface ChallengeDetail {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: ChallengeDifficulty;
  points: number;
  estimated_minutes: number;
  case_reference: string;
  scenario: string;
  objective: string;
  flag_format: string;
  solved: boolean;
  artifacts: ChallengeArtifact[];
  stages: ChallengeStage[];
  hints: ChallengeHint[];
}

export interface SubmitResult {
  solved: boolean;
  points_awarded: number;
  challenge_id?: number;
  title?: string;
  message?: string;
  already_solved?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  country_code: string;
  solved: number;
  total_challenges: number;
  score: number;
  last_solve_time: string | null;
}

export interface LeaderboardResponse {
  total_challenges: number;
  total_participants: number;
  top3: LeaderboardEntry[];
  top10: LeaderboardEntry[];
  rankings: LeaderboardEntry[];
}

export interface PlayerSolve {
  challenge_id: number;
  points_awarded: number;
  solved_at: string;
  title: string;
  difficulty: ChallengeDifficulty;
  category: string;
  case_reference: string;
  slug?: string;
}

export interface PlayerProfileResponse {
  user: CtfUser;
  stats: {
    rank: number;
    score: number;
    solved_count: number;
    total_attempts: number;
    successful_attempts: number;
  };
  solves: PlayerSolve[];
}

export interface AdminPlayer {
  id: number;
  username: string;
  email: string;
  country_code: string;
  is_banned: boolean;
  ban_reason: string | null;
  banned_at: string | null;
  created_at: string;
  active_sessions_count: number;
  solved_count: number;
  total_attempts_count: number;
  score: number;
}

export interface AdminChallenge {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: ChallengeDifficulty;
  points: number;
  case_reference: string;
  status: "published" | "draft" | "disabled";
  sort_order: number;
  solves_count: number;
  artifacts_count: number;
  stages_count: number;
  hints_count: number;
}

export interface AdminSecurityEvent {
  id: number;
  user_id: number | null;
  username?: string | null;
  event_type: string;
  ip_address: string;
  endpoint: string;
  details: string | null;
  sarcastic_note: string | null;
  created_at: string;
}

export interface AdminOverviewData {
  metrics: {
    total_players: number;
    active_players: number;
    banned_players: number;
    total_challenges: number;
    published_challenges: number;
    total_solves: number;
    total_points_awarded: number;
    recent_security_events: number;
  };
  settings: CtfSettings;
  recent_events: AdminSecurityEvent[];
}

export interface AdminPlayersResponse {
  players: AdminPlayer[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminChallengesResponse {
  challenges: AdminChallenge[];
  total: number;
}

export interface AdminSecurityResponse {
  security_events: AdminSecurityEvent[];
  total: number;
}
