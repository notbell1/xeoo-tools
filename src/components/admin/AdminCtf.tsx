import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Users,
  Award,
  RefreshCw,
  Search,
  Sliders,
  Radio,
  UserX,
  UserCheck,
  RotateCcw,
  Loader2,
  Save,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ctfApi, CtfApiError } from "../../tools/ctf/ctfApi";
import type {
  AdminOverviewData,
  AdminPlayer,
  AdminChallenge,
  CtfSettings,
  AdminSecurityEvent,
} from "../../tools/ctf/ctfTypes";
import { showConfirm, showError, showSuccess, showPrompt } from "../../alert";

const CTF_PER_PAGE = 8;

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function getCountryLabel(code: string | null | undefined): string {
  if (!code) return "Global";
  const clean = code.trim().toUpperCase();
  if (clean === "GLOBAL" || clean === "GL" || clean === "WW" || clean === "XX") return "Global";
  try {
    return countryNames.of(clean) ?? clean;
  } catch {
    return clean;
  }
}

function CountryFlag({
  code,
  size = "xs",
}: {
  code: string | null | undefined;
  size?: "xs" | "sm";
}) {
  const country = code?.trim().toLowerCase();
  const flagUrl =
    country && /^[a-z]{2}$/.test(country) && country !== "gl" && country !== "xx"
      ? `https://flagcdn.com/w40/${country}.png`
      : null;

  const name = getCountryLabel(code);

  if (!flagUrl) {
    return (
      <span
        title={name}
        className={`inline-flex items-center justify-center rounded-[2px] border border-xeoo-border bg-xeoo-bg font-bold text-xeoo-muted ${
          size === "xs" ? "h-3.5 w-5 text-[8px]" : "h-4 w-6 text-[9px]"
        } shrink-0`}
      >
        🌐
      </span>
    );
  }

  return (
    <img
      src={flagUrl}
      alt={name}
      title={name}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={`shrink-0 rounded-[2px] border border-black/10 object-cover ${
        size === "xs" ? "h-3.5 w-5" : "h-4 w-6"
      }`}
    />
  );
}

interface CtfPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const CtfPagination: React.FC<CtfPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  if (totalItems === 0 || totalPages <= 1) return null;

  const firstItem = (currentPage - 1) * itemsPerPage + 1;
  const lastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-xeoo-border px-2.5 py-2 sm:px-3 bg-xeoo-surface">
      <span className="text-[10px] font-semibold text-xeoo-muted sm:text-xs">
        {firstItem}-{lastItem} / {totalItems}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:pointer-events-none disabled:opacity-40 sm:h-7 sm:w-7 cursor-pointer"
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft size={12} />
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={[
              "flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[10px] font-bold transition sm:h-7 sm:min-w-7 sm:px-2 sm:text-xs cursor-pointer",
              currentPage === page
                ? "bg-xeoo-primary text-white"
                : "border border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:bg-xeoo-surface-soft hover:text-xeoo-text",
            ].join(" ")}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:pointer-events-none disabled:opacity-40 sm:h-7 sm:w-7 cursor-pointer"
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

interface AdminCtfProps {
  onUnauthorized?: () => void;
}

type CtfAdminTab = "overview" | "players" | "challenges" | "settings" | "security";

const CTF_TABS: Array<{
  id: CtfAdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeColor: string;
  inactiveHover: string;
  iconColor: string;
}> = [
  {
    id: "overview",
    label: "Overview",
    icon: Radio,
    activeColor: "bg-blue-600",
    inactiveHover: "hover:text-blue-500 hover:bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    id: "players",
    label: "Players",
    icon: Users,
    activeColor: "bg-emerald-600",
    inactiveHover: "hover:text-emerald-500 hover:bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    id: "challenges",
    label: "Challenges",
    icon: Award,
    activeColor: "bg-amber-600",
    inactiveHover: "hover:text-amber-500 hover:bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    id: "settings",
    label: "Platform Settings",
    icon: Sliders,
    activeColor: "bg-purple-600",
    inactiveHover: "hover:text-purple-500 hover:bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    id: "security",
    label: "Security Logs",
    icon: AlertTriangle,
    activeColor: "bg-rose-600",
    inactiveHover: "hover:text-rose-500 hover:bg-rose-500/10",
    iconColor: "text-rose-500",
  },
];

export const AdminCtf: React.FC<AdminCtfProps> = ({ onUnauthorized }) => {
  const [activeTab, setActiveTab] = useState<CtfAdminTab>("overview");
  const [refreshingSubsystem, setRefreshingSubsystem] = useState<boolean>(false);

  // Overview data
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);

  // Players data
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [playerSearch, setPlayerSearch] = useState<string>("");
  const [playersLoading, setPlayersLoading] = useState<boolean>(false);

  // Challenges data
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);

  // Settings data
  const [settings, setSettings] = useState<CtfSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Security logs
  const [securityEvents, setSecurityEvents] = useState<AdminSecurityEvent[]>([]);

  // Pagination states
  const [overviewPage, setOverviewPage] = useState<number>(1);
  const [playersPage, setPlayersPage] = useState<number>(1);
  const [challengesPage, setChallengesPage] = useState<number>(1);
  const [securityPage, setSecurityPage] = useState<number>(1);

  // Stable ref for onUnauthorized
  const onUnauthorizedRef = useRef(onUnauthorized);
  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  }, [onUnauthorized]);

  // Load Overview
  const loadOverview = useCallback(async () => {
    try {
      const res = await ctfApi.adminOverview();
      if (res.success && res.data) {
        setOverview(res.data);
      }
    } catch (err: unknown) {
      if (
        (err instanceof CtfApiError && (err.status === 401 || err.status === 403)) ||
        (err instanceof Error && err.message.toLowerCase().includes("credentials required"))
      ) {
        onUnauthorizedRef.current?.();
      }
    }
  }, []);

  // Load Players
  const loadPlayers = useCallback(async (search = "") => {
    setPlayersLoading(true);
    try {
      const res = await ctfApi.adminPlayers(search);
      if (res.success && res.data) {
        setPlayers(res.data.players || []);
      }
    } catch (err: unknown) {
      if (
        (err instanceof CtfApiError && (err.status === 401 || err.status === 403)) ||
        (err instanceof Error && err.message.toLowerCase().includes("credentials required"))
      ) {
        onUnauthorizedRef.current?.();
      }
    } finally {
      setPlayersLoading(false);
    }
  }, []);

  // Load Challenges
  const loadChallenges = useCallback(async () => {
    try {
      const res = await ctfApi.adminChallenges();
      if (res.success && res.data) {
        setChallenges(res.data.challenges || []);
      }
    } catch {
      // ignore
    }
  }, []);

  // Load Settings
  const loadSettings = useCallback(async () => {
    try {
      const res = await ctfApi.adminSettings();
      if (res.success && res.data) {
        setSettings(res.data.settings);
      }
    } catch {
      // ignore
    }
  }, []);

  // Load Security
  const loadSecurity = useCallback(async () => {
    try {
      const res = await ctfApi.adminSecurity(100);
      if (res.success && res.data) {
        setSecurityEvents(res.data.security_events || []);
      }
    } catch {
      // ignore
    }
  }, []);

  // Initial Load - Guarded with ref to run strictly once on mount
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    Promise.all([
      loadOverview(),
      loadPlayers(),
      loadChallenges(),
      loadSettings(),
      loadSecurity(),
    ]);
  }, [loadOverview, loadPlayers, loadChallenges, loadSettings, loadSecurity]);

  // Handle Manual Refresh
  const handleManualRefresh = async () => {
    setRefreshingSubsystem(true);
    try {
      await Promise.all([
        loadOverview(),
        loadPlayers(playerSearch),
        loadChallenges(),
        loadSettings(),
        loadSecurity(),
      ]);
      showSuccess("Data Refreshed", "CTF subsystem data has been successfully reloaded.");
    } finally {
      setRefreshingSubsystem(false);
    }
  };

  // Handle Player Action
  const handlePlayerAction = async (
    action: "ban" | "unban" | "reset_sessions" | "adjust_score" | "reset_progress",
    player: AdminPlayer
  ) => {
    const payload: Record<string, unknown> = {
      user_id: player.id,
      player_id: player.id,
    };

    if (action === "ban") {
      const ok = await showConfirm(
        `Ban Operator ${player.username}?`,
        "This operator will no longer be able to log in to the CTF platform."
      );
      if (!ok) return;
      payload.reason = "Banned by administrator";
    } else if (action === "unban") {
      const ok = await showConfirm(
        `Restore Operator ${player.username}?`,
        "Operator access will be reinstated."
      );
      if (!ok) return;
    } else if (action === "reset_sessions") {
      const ok = await showConfirm(
        "Revoke Sessions?",
        `Terminate all active login sessions for ${player.username}?`
      );
      if (!ok) return;
    } else if (action === "reset_progress") {
      const ok = await showConfirm(
        "Reset Progress?",
        `Clear all solves and points for ${player.username}? This action cannot be undone.`
      );
      if (!ok) return;
    } else if (action === "adjust_score") {
      const input = await showPrompt(
        "Adjust Score",
        `Enter score adjustment for operator ${player.username} (e.g. 50 or -50):`,
        "e.g. 50"
      );
      if (!input) return;
      const points = parseInt(input, 10);
      if (isNaN(points)) {
        showError("Invalid Value", "Please enter a valid numeric value.");
        return;
      }
      payload.amount = points;
      payload.points = points;
      payload.reason = "Manual adjustment by administrator";
    }

    try {
      const res = await ctfApi.adminPlayerAction(action, payload);
      if (res.success) {
        showSuccess("Action Applied", `Action for ${player.username} has been applied.`);
        loadPlayers(playerSearch);
        loadOverview();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to execute action";
      showError("Action Failed", msg);
    }
  };

  // Toggle Challenge Active State
  const handleToggleChallenge = async (challenge: AdminChallenge) => {
    const nextStatus = challenge.status === "published" ? "disabled" : "published";
    try {
      const res = await ctfApi.adminToggleChallenge(challenge.id, nextStatus === "published");
      if (res.success) {
        setChallenges((prev) =>
          prev.map((c) => (c.id === challenge.id ? { ...c, status: nextStatus } : c))
        );
        showSuccess(
          "Challenge Updated",
          `${challenge.title} is now ${nextStatus === "published" ? "Active" : "Disabled"}.`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update challenge status";
      showError("Update Failed", msg);
    }
  };

  // Save Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    const ok = await showConfirm(
      "Save CTF Settings?",
      "Are you sure you want to apply these changes to the CTF platform?"
    );
    if (!ok) return;

    setSavingSettings(true);
    try {
      const res = await ctfApi.adminUpdateSettings(settings);
      if (res.success) {
        if (res.data?.settings) {
          setSettings(res.data.settings);
        }
        showSuccess("Settings Saved", "CTF platform configuration has been successfully updated.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update configuration";
      showError("Save Failed", msg);
    } finally {
      setSavingSettings(false);
    }
  };

  // Memoized paginated players
  const paginatedPlayers = useMemo(() => {
    const start = (playersPage - 1) * CTF_PER_PAGE;
    return players.slice(start, start + CTF_PER_PAGE);
  }, [players, playersPage]);
  const playersTotalPages = Math.max(1, Math.ceil(players.length / CTF_PER_PAGE));

  // Memoized paginated challenges
  const paginatedChallenges = useMemo(() => {
    const start = (challengesPage - 1) * CTF_PER_PAGE;
    return challenges.slice(start, start + CTF_PER_PAGE);
  }, [challenges, challengesPage]);
  const challengesTotalPages = Math.max(1, Math.ceil(challenges.length / CTF_PER_PAGE));

  // Memoized paginated security events
  const paginatedSecurityEvents = useMemo(() => {
    const start = (securityPage - 1) * CTF_PER_PAGE;
    return securityEvents.slice(start, start + CTF_PER_PAGE);
  }, [securityEvents, securityPage]);
  const securityTotalPages = Math.max(1, Math.ceil(securityEvents.length / CTF_PER_PAGE));

  // Memoized paginated overview recent events
  const overviewRecentEvents = overview?.recent_events ?? [];
  const paginatedOverviewEvents = useMemo(() => {
    const start = (overviewPage - 1) * CTF_PER_PAGE;
    return overviewRecentEvents.slice(start, start + CTF_PER_PAGE);
  }, [overviewRecentEvents, overviewPage]);
  const overviewTotalPages = Math.max(1, Math.ceil(overviewRecentEvents.length / CTF_PER_PAGE));

  return (
    <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-sm">
      {/* Unified Subsystem Tab Navigation & Actions Header */}
      <div className="border-b border-xeoo-border p-2 sm:p-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-xeoo-surface">
        <div className="grid grid-cols-2 min-[540px]:grid-cols-3 md:flex md:flex-wrap items-center gap-1.5 w-full md:w-auto">
          {CTF_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center justify-center md:justify-start gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  tab.id === "security" ? "col-span-2 min-[540px]:col-span-1 md:col-auto" : ""
                } ${
                  active
                    ? `${tab.activeColor} text-white shadow-xs font-bold`
                    : `text-xeoo-muted ${tab.inactiveHover} bg-transparent`
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-white" : tab.iconColor}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={refreshingSubsystem}
          onClick={handleManualRefresh}
          className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs font-semibold text-xeoo-text hover:bg-xeoo-surface-soft cursor-pointer disabled:opacity-50 transition-colors w-full md:w-auto"
          title="Refresh CTF subsystem data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshingSubsystem ? "animate-spin" : ""}`} />
          <span>{refreshingSubsystem ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 sm:p-4 bg-xeoo-surface border-b border-xeoo-border">
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3 shadow-xs">
              <p className="text-[10px] font-mono uppercase text-xeoo-muted">Total Operators</p>
              <p className="text-xl font-bold font-mono text-xeoo-text mt-0.5">
                {overview?.metrics?.total_players ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3 shadow-xs">
              <p className="text-[10px] font-mono uppercase text-xeoo-muted">Verified Solves</p>
              <p className="text-xl font-bold font-mono text-xeoo-success mt-0.5">
                {overview?.metrics?.total_solves ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3 shadow-xs">
              <p className="text-[10px] font-mono uppercase text-xeoo-muted">Total Challenges</p>
              <p className="text-xl font-bold font-mono text-xeoo-primary mt-0.5">
                {overview?.metrics?.total_challenges ?? challenges.length}
              </p>
            </div>
            <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3 shadow-xs">
              <p className="text-[10px] font-mono uppercase text-xeoo-muted">Security Tamper Flags</p>
              <p className="text-xl font-bold font-mono text-xeoo-danger mt-0.5">
                {overview?.metrics?.recent_security_events ?? 0}
              </p>
            </div>
          </div>

          {/* Recent Security Activity Table */}
          <div>
            <div className="p-2.5 sm:p-3 border-b border-xeoo-border bg-xeoo-surface flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-xeoo-text flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-xeoo-warning" />
                Recent Activity & Tamper Logs
              </h2>
              <span className="text-xs font-mono text-xeoo-muted">
                Total: {overviewRecentEvents.length} Logs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="border-b border-xeoo-border bg-xeoo-surface-soft font-mono uppercase text-[11px] text-xeoo-text font-bold">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-xeoo-border w-12 text-center">No.</th>
                    <th className="py-2.5 px-3 border-r border-xeoo-border w-36">Timestamp</th>
                    <th className="py-2.5 px-3 border-r border-xeoo-border">Event Type</th>
                    <th className="py-2.5 px-3 border-r border-xeoo-border">Operator</th>
                    <th className="py-2.5 px-3 border-r border-xeoo-border">IP Address</th>
                    <th className="py-2.5 px-3">Details & Response</th>
                  </tr>
                </thead>
                <tbody>
                  {overviewRecentEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xeoo-muted font-mono">
                        No tamper events recorded. System is secure.
                      </td>
                    </tr>
                  ) : (
                    paginatedOverviewEvents.map((ev, idx) => (
                      <tr
                        key={ev.id}
                        className={`border-b border-xeoo-border last:border-b-0 ${
                          idx % 2 === 0 ? "bg-xeoo-surface" : "bg-xeoo-surface-soft/60"
                        } hover:bg-xeoo-surface-soft transition-colors`}
                      >
                        <td className="py-2 px-3 font-mono text-[11px] text-xeoo-muted text-center border-r border-xeoo-border">
                          {(overviewPage - 1) * CTF_PER_PAGE + idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-xeoo-muted border-r border-xeoo-border">
                          {new Date(ev.created_at).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 border-r border-xeoo-border">
                          <span className="rounded bg-xeoo-danger/10 text-xeoo-danger border border-xeoo-danger/30 px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase">
                            {ev.event_type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-xeoo-text border-r border-xeoo-border">
                          {ev.username || "Guest"}
                        </td>
                        <td className="py-2 px-3 font-mono text-xeoo-muted border-r border-xeoo-border">
                          {ev.ip_address}
                        </td>
                        <td className="py-2 px-3 font-mono text-xeoo-text text-[11px] truncate max-w-sm">
                          {ev.details || ev.sarcastic_note || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {overviewRecentEvents.length > 0 && (
              <CtfPagination
                currentPage={overviewPage}
                totalPages={overviewTotalPages}
                totalItems={overviewRecentEvents.length}
                itemsPerPage={CTF_PER_PAGE}
                onPageChange={setOverviewPage}
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PLAYERS MANAGEMENT */}
      {activeTab === "players" && (
        <div>
          {/* Search bar inside header */}
          <div className="p-2.5 sm:p-3 border-b border-xeoo-border flex items-center justify-between gap-3 bg-xeoo-surface">
            <div className="relative w-full sm:w-72">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xeoo-muted">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                value={playerSearch}
                onChange={(e) => {
                  setPlayerSearch(e.target.value);
                  setPlayersPage(1);
                  loadPlayers(e.target.value);
                }}
                placeholder="Search username or email..."
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg py-1.5 pl-8 pr-3 text-xs text-xeoo-text focus:outline-none focus:border-xeoo-primary"
              />
            </div>
            <span className="text-xs font-mono text-xeoo-muted hidden sm:inline">
              Total: {players.length} Operators
            </span>
          </div>

          {/* Players Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b border-xeoo-border bg-xeoo-surface-soft font-mono uppercase text-[11px] text-xeoo-text font-bold">
                <tr>
                  <th className="py-2.5 px-3 border-r border-xeoo-border w-12 text-center">No.</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border">Operator</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border">Email</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border text-center">Country</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border text-center">Solves</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border text-right">Score</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {playersLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xeoo-muted">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-xeoo-primary mb-1" />
                      <span className="font-mono text-xs">Loading operators...</span>
                    </td>
                  </tr>
                ) : players.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-xeoo-muted font-mono">
                      No operator records found.
                    </td>
                  </tr>
                ) : (
                  paginatedPlayers.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`border-b border-xeoo-border last:border-b-0 ${
                        idx % 2 === 0 ? "bg-xeoo-surface" : "bg-xeoo-surface-soft/60"
                      } hover:bg-xeoo-surface-soft transition-colors`}
                    >
                      <td className="py-2 px-3 font-mono text-[11px] text-xeoo-muted text-center border-r border-xeoo-border">
                        {(playersPage - 1) * CTF_PER_PAGE + idx + 1}
                      </td>
                      <td className="py-2 px-3 font-bold text-xeoo-text font-mono border-r border-xeoo-border">
                        {p.username}
                      </td>
                      <td className="py-2 px-3 font-mono text-xeoo-muted border-r border-xeoo-border">
                        {p.email}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-xeoo-border">
                        <div
                          className="inline-flex items-center gap-1.5 rounded bg-xeoo-surface-soft border border-xeoo-border px-2 py-0.5"
                          title={getCountryLabel(p.country_code)}
                        >
                          <CountryFlag code={p.country_code} size="xs" />
                          <span className="text-[11px] font-mono font-semibold text-xeoo-text">
                            {p.country_code?.trim().toUpperCase() || "GL"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-mono border-r border-xeoo-border">
                        <span className="rounded bg-xeoo-surface-soft border border-xeoo-border px-1.5 py-0.5 text-[11px]">
                          {p.solved_count}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-xeoo-primary border-r border-xeoo-border">
                        {p.score}p
                      </td>
                      <td className="py-2 px-3 text-center border-r border-xeoo-border">
                        {p.is_banned ? (
                          <span className="rounded bg-xeoo-danger/10 text-xeoo-danger border border-xeoo-danger/30 px-1.5 py-0.5 text-[10px] font-mono font-bold">
                            BANNED
                          </span>
                        ) : (
                          <span className="rounded bg-xeoo-success/10 text-xeoo-success border border-xeoo-success/30 px-1.5 py-0.5 text-[10px] font-mono font-bold">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {p.is_banned ? (
                            <button
                              type="button"
                              title="Restore operator access"
                              onClick={() => handlePlayerAction("unban", p)}
                              className="p-1 rounded text-xeoo-success hover:bg-xeoo-success/10 cursor-pointer"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              title="Ban operator"
                              onClick={() => handlePlayerAction("ban", p)}
                              className="p-1 rounded text-xeoo-danger hover:bg-xeoo-danger/10 cursor-pointer"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            title="Adjust operator score"
                            onClick={() => handlePlayerAction("adjust_score", p)}
                            className="p-1 rounded text-xeoo-primary hover:bg-xeoo-primary/10 cursor-pointer"
                          >
                            <Award className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            title="Reset operator progress"
                            onClick={() => handlePlayerAction("reset_progress", p)}
                            className="p-1 rounded text-xeoo-muted hover:text-xeoo-danger hover:bg-xeoo-danger/10 cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {players.length > 0 && (
            <CtfPagination
              currentPage={playersPage}
              totalPages={playersTotalPages}
              totalItems={players.length}
              itemsPerPage={CTF_PER_PAGE}
              onPageChange={setPlayersPage}
            />
          )}
        </div>
      )}

      {/* TAB 3: CHALLENGES */}
      {activeTab === "challenges" && (
        <div>
          <div className="p-2.5 sm:p-3 border-b border-xeoo-border flex items-center justify-between bg-xeoo-surface">
            <h2 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
              CTF Challenge Case Files
            </h2>
            <span className="text-xs font-mono text-xeoo-muted">
              Total: {challenges.length} Cases
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b border-xeoo-border bg-xeoo-surface-soft font-mono uppercase text-[11px] text-xeoo-text font-bold">
                <tr>
                  <th className="py-2.5 px-3 border-r border-xeoo-border w-12 text-center">No.</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border w-24">Ref</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border">Case Title</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border">Category</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border text-center">Tier</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border text-center">Points</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border text-center">Solves</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {challenges.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-xeoo-muted font-mono">
                      No challenge case files found.
                    </td>
                  </tr>
                ) : (
                  paginatedChallenges.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`border-b border-xeoo-border last:border-b-0 ${
                        idx % 2 === 0 ? "bg-xeoo-surface" : "bg-xeoo-surface-soft/60"
                      } hover:bg-xeoo-surface-soft transition-colors`}
                    >
                      <td className="py-2 px-3 font-mono text-[11px] text-xeoo-muted text-center border-r border-xeoo-border">
                        {(challengesPage - 1) * CTF_PER_PAGE + idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-xeoo-muted border-r border-xeoo-border">
                        {c.case_reference}
                      </td>
                    <td className="py-2 px-3 font-semibold text-xeoo-text border-r border-xeoo-border">
                      {c.title}
                    </td>
                    <td className="py-2 px-3 font-mono text-xeoo-muted uppercase text-[10px] border-r border-xeoo-border">
                      {c.category}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-xeoo-border">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                          c.difficulty === "easy"
                            ? "bg-xeoo-success/15 text-xeoo-success"
                            : c.difficulty === "medium"
                            ? "bg-xeoo-warning/15 text-xeoo-warning"
                            : "bg-xeoo-danger/15 text-xeoo-danger"
                        }`}
                      >
                        {c.difficulty}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-xeoo-primary border-r border-xeoo-border">
                      {c.points}p
                    </td>
                    <td className="py-2 px-3 text-center font-mono border-r border-xeoo-border">
                      {c.solves_count}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-xeoo-border">
                      {c.status === "published" ? (
                        <span className="rounded bg-xeoo-success/10 text-xeoo-success px-1.5 py-0.5 text-[10px] font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="rounded bg-xeoo-muted/10 text-xeoo-muted px-1.5 py-0.5 text-[10px] font-semibold">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleChallenge(c)}
                        className={`rounded px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition-colors ${
                          c.status === "published"
                            ? "bg-xeoo-danger/10 text-xeoo-danger hover:bg-xeoo-danger/20"
                            : "bg-xeoo-success/10 text-xeoo-success hover:bg-xeoo-success/20"
                        }`}
                      >
                        {c.status === "published" ? "Disable" : "Publish"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {challenges.length > 0 && (
            <CtfPagination
              currentPage={challengesPage}
              totalPages={challengesTotalPages}
              totalItems={challenges.length}
              itemsPerPage={CTF_PER_PAGE}
              onPageChange={setChallengesPage}
            />
          )}
        </div>
      )}

      {/* TAB 4: SETTINGS (Subsystem Access Switches) */}
      {activeTab === "settings" && settings && (
        <form onSubmit={handleSaveSettings} className="w-full p-4 sm:p-5 space-y-4 bg-xeoo-surface">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-xeoo-text flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-xeoo-primary" />
              Subsystem Access Switches
            </h2>
            <p className="text-xs text-xeoo-muted mt-0.5">
              Configure platform access, operator authentication, flag submissions, and maintenance mode.
            </p>
          </div>

          {/* Full Width Responsive Grid of Switch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                key: "ctf_enabled",
                label: "CTF Platform Active",
                desc: "Enable or disable global player access to CTF.",
              },
              {
                key: "registration_enabled",
                label: "Public Registration Open",
                desc: "Allow new players to enroll badge handles.",
              },
              {
                key: "login_enabled",
                label: "Player Login Allowed",
                desc: "Allow existing players to authenticate.",
              },
              {
                key: "submissions_enabled",
                label: "Flag Submissions Active",
                desc: "Accept flag submissions and score points.",
              },
              {
                key: "leaderboard_enabled",
                label: "Public Leaderboard Enabled",
                desc: "Display global standings and Hall of Fame.",
              },
              {
                key: "maintenance_mode",
                label: "Maintenance Mode",
                desc: "Display maintenance screen to players.",
              },
            ].map((sw) => {
              const k = sw.key as keyof CtfSettings;
              const checked = Boolean(settings[k]);

              return (
                <label
                  key={sw.key}
                  className={`flex items-center justify-between p-3.5 rounded-lg border transition-all cursor-pointer ${
                    checked
                      ? "border-xeoo-primary/40 bg-xeoo-primary/5 hover:bg-xeoo-primary/10"
                      : "border-xeoo-border bg-xeoo-surface-soft/40 hover:bg-xeoo-surface-soft"
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <p className="text-xs font-semibold text-xeoo-text flex items-center gap-1.5">
                      {sw.label}
                      {checked && (
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-xeoo-success" />
                      )}
                    </p>
                    <p className="text-[11px] text-xeoo-muted leading-tight">{sw.desc}</p>
                  </div>

                  {/* Compact Interactive Toggle Switch */}
                  <div className="relative inline-flex items-center shrink-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          [k]: e.target.checked,
                        })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-9 h-5 rounded-full transition-colors ${
                        checked ? "bg-xeoo-primary" : "bg-xeoo-border"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform mt-0.5 ml-0.5 ${
                          checked ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Notice Messages Section */}
          <div className="pt-4 border-t border-xeoo-border grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-xeoo-text">
                Maintenance Notice Message
              </label>
              <input
                type="text"
                value={settings.maintenance_message}
                onChange={(e) =>
                  setSettings({ ...settings, maintenance_message: e.target.value })
                }
                placeholder="XeooTools Defacement CTF is temporarily offline for scheduled system updates."
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-3 py-2 text-xs text-xeoo-text focus:outline-none focus:border-xeoo-primary"
              />
              <p className="text-[10px] text-xeoo-muted">
                Notice displayed to players when Maintenance Mode is enabled.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-xeoo-text">
                Coming Soon Notice Message
              </label>
              <input
                type="text"
                value={settings.soon_message}
                onChange={(e) =>
                  setSettings({ ...settings, soon_message: e.target.value })
                }
                placeholder="XeooTools Defacement CTF investigation cases are launching soon."
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-bg px-3 py-2 text-xs text-xeoo-text focus:outline-none focus:border-xeoo-primary"
              />
              <p className="text-[10px] text-xeoo-muted">
                Notice displayed when the CTF platform is inactive.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-1.5 rounded-lg bg-xeoo-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-xeoo-primary-hover disabled:opacity-50 cursor-pointer transition-colors"
            >
              {savingSettings ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save CTF Settings
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: SECURITY LOGS */}
      {activeTab === "security" && (
        <div>
          <div className="p-2.5 sm:p-3 border-b border-xeoo-border flex items-center justify-between bg-xeoo-surface">
            <h2 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
              Security Logs & Tamper Detections
            </h2>
            <span className="text-xs font-mono text-xeoo-muted">
              Total: {securityEvents.length} Logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b border-xeoo-border bg-xeoo-surface-soft font-mono uppercase text-[11px] text-xeoo-text font-bold">
                <tr>
                  <th className="py-2.5 px-3 border-r border-xeoo-border w-12 text-center">No.</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border w-36">Timestamp</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border">Event Type</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border">Operator</th>
                  <th className="py-2.5 px-3 border-r border-xeoo-border">IP Address</th>
                  <th className="py-2.5 px-3">Details & Response</th>
                </tr>
              </thead>
              <tbody>
                {securityEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xeoo-muted font-mono">
                      No tamper attempts logged. Normal system state.
                    </td>
                  </tr>
                ) : (
                  paginatedSecurityEvents.map((ev, idx) => (
                    <tr
                      key={ev.id}
                      className={`border-b border-xeoo-border last:border-b-0 ${
                        idx % 2 === 0 ? "bg-xeoo-surface" : "bg-xeoo-surface-soft/60"
                      } hover:bg-xeoo-surface-soft transition-colors`}
                    >
                      <td className="py-2 px-3 font-mono text-[11px] text-xeoo-muted text-center border-r border-xeoo-border">
                        {(securityPage - 1) * CTF_PER_PAGE + idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-xeoo-muted border-r border-xeoo-border">
                        {new Date(ev.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 border-r border-xeoo-border">
                        <span className="rounded bg-xeoo-danger/10 text-xeoo-danger border border-xeoo-danger/30 px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase">
                          {ev.event_type}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-xeoo-text border-r border-xeoo-border">
                        {ev.username || "Guest"}
                      </td>
                      <td className="py-2 px-3 font-mono text-xeoo-muted border-r border-xeoo-border">
                        {ev.ip_address}
                      </td>
                      <td className="py-2 px-3 font-mono text-xeoo-text text-[11px] truncate max-w-sm">
                        {ev.details || ev.sarcastic_note || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {securityEvents.length > 0 && (
            <CtfPagination
              currentPage={securityPage}
              totalPages={securityTotalPages}
              totalItems={securityEvents.length}
              itemsPerPage={CTF_PER_PAGE}
              onPageChange={setSecurityPage}
            />
          )}
        </div>
      )}
    </section>
  );
};

export default AdminCtf;
