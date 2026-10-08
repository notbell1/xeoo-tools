import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  CheckCircle2,
  Calendar,
  Loader2,
  ArrowRight,
  LogIn,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Save,
  KeyRound,
} from "lucide-react";
import { ctfApi } from "./ctfApi";
import { useCtfAuth } from "./ctfAuth";
import type { PlayerProfileResponse, PlayerSolve } from "./ctfTypes";
import { COUNTRIES, COUNTRIES_MAP } from "./ctfConstants";
import { showError, showSuccess } from "../../alert";

export const CtfProfile: React.FC = () => {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    refreshSession,
  } = useCtfAuth();
  const [profile, setProfile] = useState<PlayerProfileResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"dossier" | "settings">("dossier");

  // Profile Edit Form State
  const [editUsername, setEditUsername] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editCountry, setEditCountry] = useState<string>("GLOBAL");
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [changingPassword, setChangingPassword] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let mounted = true;
    ctfApi
      .getProfile()
      .then((res) => {
        if (mounted && res.success && res.data) {
          setProfile(res.data);
          if (res.data.user) {
            setEditUsername(res.data.user.username || "");
            setEditEmail(res.data.user.email || "");
            setEditCountry(res.data.user.country_code || "GLOBAL");
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setEditUsername(user.username || "");
      setEditEmail(user.email || "");
      setEditCountry(user.country_code || "GLOBAL");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim() || !editEmail.trim()) {
      showError("Username and email are required.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await ctfApi.updateProfile({
        username: editUsername.trim(),
        email: editEmail.trim(),
        country_code: editCountry,
      });

      if (res.success) {
        showSuccess("Profile successfully updated.");
        await refreshSession();
      } else {
        showError(res.error || "Failed to update profile.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "A connection error occurred.";
      showError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showError("The current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      showError("The new password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("The new password confirmation does not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await ctfApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (res.success) {
        showSuccess("Password successfully changed.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showError(res.error || "Failed to change password.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "There is an error.";
      showError(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2.5">
        <Loader2 className="h-6 w-6 animate-spin text-xeoo-primary" />
        <p className="text-xs font-mono text-xeoo-muted">
          Loading account data...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-xeoo-border bg-xeoo-surface rounded-xl p-6 text-center space-y-3 shadow-xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-xeoo-primary/10 text-xeoo-primary">
            <User className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-xeoo-text">Login Required</h2>
          <p className="text-xs text-xeoo-muted">
            Please log in to view your profile data, challenge history, and
            account settings.
          </p>
          <div className="flex justify-center pt-2">
            <Link
              to="/ctf/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-xeoo-primary px-4 py-2 text-xs font-semibold text-white hover:bg-xeoo-primary-hover transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Login Akun
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const country = COUNTRIES_MAP[user.country_code] || {
    name: "Global",
    flag: "🌐",
  };

  return (
    <div className="mx-auto max-w-5xl px-3 py-5 sm:px-6 lg:px-8 space-y-5">
      {/* Operator ID Card */}
      <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-13 w-13 items-center justify-center rounded-xl bg-xeoo-primary/10 text-xeoo-primary text-xl font-bold font-mono border border-xeoo-primary/20">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-xeoo-text font-mono">
                  {user.username}
                </h1>
                <span className="text-base leading-none" title={country.name}>
                  {country.flag}
                </span>
                <span className="text-xs text-xeoo-muted font-mono">
                  ({country.name})
                </span>
              </div>
              <p className="text-xs text-xeoo-muted font-mono">{user.email}</p>
              {user.created_at && (
                <div className="flex items-center gap-1 mt-1 text-[11px] text-xeoo-muted font-mono">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Registered: {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-5 border-t sm:border-t-0 sm:border-l border-xeoo-border pt-3 sm:pt-0 sm:pl-5">
            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase font-mono text-xeoo-muted">
                Total Score
              </p>
              <p className="text-xl font-bold font-mono text-xeoo-primary">
                {profile?.stats?.score ?? 0} PTS
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase font-mono text-xeoo-muted">
                Solved Cases
              </p>
              <p className="text-xl font-bold font-mono text-xeoo-text">
                {profile?.stats?.solved_count ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-xeoo-border">
        <button
          type="button"
          onClick={() => setActiveTab("dossier")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "dossier"
              ? "border-xeoo-primary text-xeoo-primary"
              : "border-transparent text-xeoo-muted hover:text-xeoo-text"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Solved History ({profile?.solves?.length ?? 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "settings"
              ? "border-xeoo-primary text-xeoo-primary"
              : "border-transparent text-xeoo-muted hover:text-xeoo-text"
          }`}
        >
          <Settings className="h-3.5 w-3.5" />
          Account Settings
        </button>
      </div>

      {/* Tab 1: Dossier / Solved Cases */}
      {activeTab === "dossier" && (
        <div className="rounded-xl border border-xeoo-border bg-xeoo-surface overflow-hidden shadow-xs">
          <div className="p-3 border-b border-xeoo-border flex items-center justify-between bg-xeoo-surface-soft">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-xeoo-success" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-xeoo-text">
                List of Verified Cases
              </h2>
            </div>
            <span className="text-xs font-mono text-xeoo-muted">
              {profile?.solves?.length ?? 0} Solved
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b border-xeoo-border bg-xeoo-surface-soft font-mono uppercase text-xeoo-text font-bold">
                <tr>
                  <th className="py-2.5 px-3.5 border-r border-xeoo-border">
                    Case File
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-xeoo-border">
                    Tier
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-xeoo-border">
                    Poin
                  </th>
                  <th className="py-2.5 px-3.5 text-right">Waktu Solve</th>
                </tr>
              </thead>
              <tbody>
                {!profile?.solves || profile.solves.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-xeoo-muted font-mono"
                    >
                      No challenges completed yet. Complete challenges to earn
                      points!
                    </td>
                  </tr>
                ) : (
                  profile.solves.map((solve: PlayerSolve, idx) => (
                    <tr
                      key={solve.challenge_id}
                      className={`border-b border-xeoo-border last:border-b-0 ${
                        idx % 2 === 0
                          ? "bg-xeoo-surface"
                          : "bg-xeoo-surface-soft/60"
                      } hover:bg-xeoo-surface-soft transition-colors`}
                    >
                      <td className="py-2.5 px-3.5 border-r border-xeoo-border">
                        <Link
                          to={`/ctf/challenge/${solve.slug}`}
                          className="font-semibold text-xeoo-text hover:text-xeoo-primary flex items-center gap-1.5"
                        >
                          {solve.title}
                          <ArrowRight className="h-3 w-3 opacity-60" />
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-xeoo-border">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                            solve.difficulty === "easy"
                              ? "bg-xeoo-success/15 text-xeoo-success"
                              : solve.difficulty === "medium"
                                ? "bg-xeoo-warning/15 text-xeoo-warning"
                                : "bg-xeoo-danger/15 text-xeoo-danger"
                          }`}
                        >
                          {solve.difficulty}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-xeoo-primary border-r border-xeoo-border">
                        +{solve.points_awarded}p
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono text-xeoo-muted text-[11px]">
                        {new Date(solve.solved_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: User Settings (Edit Profile & Change Password) */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Form 1: Edit Profile */}
          <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-xeoo-border pb-3">
              <User className="h-4 w-4 text-xeoo-primary" />
              <h2 className="text-sm font-bold text-xeoo-text">
                Change Profile Information
              </h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-xeoo-text mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 text-xs text-xeoo-text font-mono focus:border-xeoo-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-xeoo-text mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 text-xs text-xeoo-text font-mono focus:border-xeoo-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-xeoo-text mb-1">
                  Region (Country)
                </label>
                <div className="relative">
                  <select
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 text-xs text-xeoo-text font-mono focus:border-xeoo-primary focus:outline-hidden pr-8"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-xeoo-muted text-xs">
                    ▼
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-xeoo-primary px-4 py-2 text-xs font-semibold text-white hover:bg-xeoo-primary-hover disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {savingProfile ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Change Password */}
          <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-xeoo-border pb-3">
              <Lock className="h-4 w-4 text-xeoo-primary" />
              <h2 className="text-sm font-bold text-xeoo-text">
                Change Password
              </h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-xeoo-text mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 pr-9 text-xs text-xeoo-text font-mono focus:border-xeoo-primary focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-xeoo-muted hover:text-xeoo-text cursor-pointer"
                  >
                    {showCurrentPass ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-xeoo-text mb-1">
                  New Password (min. 8 karakter)
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum of 8 characters"
                    className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 pr-9 text-xs text-xeoo-text font-mono focus:border-xeoo-primary focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-xeoo-muted hover:text-xeoo-text cursor-pointer"
                  >
                    {showNewPass ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-xeoo-text mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2 pr-9 text-xs text-xeoo-text font-mono focus:border-xeoo-primary focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-xeoo-muted hover:text-xeoo-text cursor-pointer"
                  >
                    {showConfirmPass ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-xeoo-primary px-4 py-2 text-xs font-semibold text-white hover:bg-xeoo-primary-hover disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {changingPassword ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="h-3.5 w-3.5" />
                  )}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
