import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  History,
  KeyRound,
  LoaderCircle,
  UserRound,
} from "lucide-react";

import { showConfirm, showError, showSuccess } from "../../alert";
import { BACKEND_URL } from "../../config/backend";

type AccountProfile = {
  id: number;
  username: string;
  display_name: string | null;
  avatar: string | null;
  role: string;
  status: string;
  password_changed_at: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type AuthLog = {
  id: number;
  action: "login" | "logout" | "password_changed" | string;
  success: boolean;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  created_at: string;
};

type AccountResponse = {
  success: boolean;
  message?: string;
  data?: {
    profile?: AccountProfile;
    logs?: AuthLog[];
    csrf_token?: string;
  };
};

const HISTORY_PER_PAGE = 4;
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png"]);

const ALLOWED_AVATAR_EXTENSIONS = new Set(["jpg", "jpeg", "png"]);

function formatDatabaseDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getActionLabel(action: string) {
  switch (action) {
    case "login":
      return "Login";

    case "logout":
      return "Logout";

    case "password_changed":
      return "Password Changed";

    default:
      return action;
  }
}

function getActionClass(action: string) {
  switch (action) {
    case "login":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "logout":
      return "border-slate-200 bg-slate-50 text-slate-700";

    case "password_changed":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-xeoo-border bg-xeoo-surface-soft text-xeoo-text-muted";
  }
}

async function postAccount<T>(
  action: string,
  payload: Record<string, string> = {},
): Promise<T> {
  const body = new URLSearchParams();

  body.append("action", action);

  Object.entries(payload).forEach(([key, value]) => {
    body.append(key, value);
  });

  const response = await fetch(`${BACKEND_URL}/api/admin_account.php`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Accept: "application/json",
    },
    body,
  });

  let result: T | null = null;

  try {
    result = (await response.json()) as T;
  } catch {
    result = null;
  }

  if (!result) {
    throw new Error(
      `The server returned an invalid response. HTTP ${response.status}.`,
    );
  }

  const typedResult = result as {
    success?: boolean;
    message?: string;
  };

  if (!response.ok || typedResult.success === false) {
    throw new Error(
      typedResult.message || `Request failed. HTTP ${response.status}.`,
    );
  }

  return result;
}

async function postAccountFormData<T>(formData: FormData): Promise<T> {
  const response = await fetch(`${BACKEND_URL}/api/admin_account.php`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  let result: T | null = null;

  try {
    result = (await response.json()) as T;
  } catch {
    result = null;
  }

  if (!result) {
    throw new Error(
      `The server returned an invalid response. HTTP ${response.status}.`,
    );
  }

  const typedResult = result as {
    success?: boolean;
    message?: string;
  };

  if (!response.ok || typedResult.success === false) {
    throw new Error(
      typedResult.message || `Request failed. HTTP ${response.status}.`,
    );
  }

  return result;
}

function getInitial(profile: AccountProfile | null, fallbackUsername: string) {
  const source =
    profile?.display_name || profile?.username || fallbackUsername || "A";

  return source.slice(0, 1).toUpperCase();
}

function getAvatarExtension(fileName: string) {
  const cleanName = fileName.trim().toLowerCase();

  const parts = cleanName.split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts[parts.length - 1];
}

export default function AdminAccount({ username = "" }: { username?: string }) {
  const [profile, setProfile] = useState<AccountProfile | null>(null);

  const [logs, setLogs] = useState<AuthLog[]>([]);

  const [csrfToken, setCsrfToken] = useState("");

  const [loading, setLoading] = useState(true);

  const [changeDialogOpen, setChangeDialogOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const [newUsername, setNewUsername] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [historyPage, setHistoryPage] = useState(1);

  const loadAccount = useCallback(async () => {
    setLoading(true);

    try {
      const [accountResult, logsResult] = await Promise.all([
        postAccount<AccountResponse>("me"),
        postAccount<AccountResponse>("logs"),
      ]);

      const nextProfile = accountResult.data?.profile ?? null;

      const nextLogs = logsResult.data?.logs ?? [];

      const nextCsrfToken = accountResult.data?.csrf_token ?? "";

      setProfile(nextProfile);
      setLogs(nextLogs);
      setCsrfToken(nextCsrfToken);
      setHistoryPage(1);
    } catch (error) {
      console.error("Load admin account error:", error);

      await showError(
        "Failed to load account",
        error instanceof Error
          ? error.message
          : "Account information could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const historyTotalPages = useMemo(
    () => Math.max(1, Math.ceil(logs.length / HISTORY_PER_PAGE)),
    [logs.length],
  );

  const paginatedLogs = useMemo(() => {
    const start = (historyPage - 1) * HISTORY_PER_PAGE;

    return logs.slice(start, start + HISTORY_PER_PAGE);
  }, [logs, historyPage]);

  useEffect(() => {
    setHistoryPage((page) => Math.min(page, historyTotalPages));
  }, [historyTotalPages]);

  const profileUsername = profile?.username || username || "Admin";

  const initial = getInitial(profile, username);

  const avatarUrl = profile?.avatar
    ? profile.avatar.startsWith("http")
      ? profile.avatar
      : `${BACKEND_URL}/${profile.avatar.replace(/^\/+/, "")}`
    : null;

  const displayedAvatar = avatarPreview || avatarUrl;

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (newPassword.length >= 8) {
      score += 1;
    }

    if (/[A-Z]/.test(newPassword)) {
      score += 1;
    }

    if (/[0-9]/.test(newPassword)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(newPassword)) {
      score += 1;
    }

    if (!newPassword) {
      return {
        label: "",
        width: "0%",
        className: "bg-transparent",
      };
    }

    if (score <= 1) {
      return {
        label: "Weak",
        width: "25%",
        className: "bg-red-500",
      };
    }

    if (score === 2) {
      return {
        label: "Currently",
        width: "50%",
        className: "bg-amber-500",
      };
    }

    if (score === 3) {
      return {
        label: "Good",
        width: "75%",
        className: "bg-blue-500",
      };
    }

    return {
      label: "Strong",
      width: "100%",
      className: "bg-emerald-500",
    };
  }, [newPassword]);

  const resetChangeForm = () => {
    setNewUsername("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const closeChangeDialog = () => {
    if (saving) {
      return;
    }

    resetChangeForm();
    setChangeDialogOpen(false);
  };

  const openChangeDialog = () => {
    resetChangeForm();
    setChangeDialogOpen(true);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    const extension = getAvatarExtension(file.name);

    if (!ALLOWED_AVATAR_EXTENSIONS.has(extension)) {
      event.target.value = "";

      void showError(
        "Photo format not supported",
        "Avatars can only be JPG, JPEG, or PNG.",
      );

      return;
    }

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      event.target.value = "";

      void showError(
        "Invalid file type",
        "Avatars can only be JPG, JPEG, or PNG images.",
      );

      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      event.target.value = "";

      void showError("File too large", "Maximum avatar size is 2 MB.");

      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));

    event.target.value = "";
  };

  const submitChanges = async () => {
    const usernameValue = newUsername.trim();

    const passwordValue = newPassword;

    const confirmValue = confirmPassword;

    const wantsUsernameChange = usernameValue !== "";

    const wantsPasswordChange = passwordValue !== "";

    const wantsAvatarChange = avatarFile !== null;

    if (!wantsUsernameChange && !wantsPasswordChange && !wantsAvatarChange) {
      await showError(
        "No changes",
        "Change your username or password, or select a new photo first.",
      );

      return;
    }

    if (!csrfToken) {
      await showError(
        "Security session not available",
        "Reload the administrator page and try again.",
      );

      return;
    }

    if (wantsUsernameChange) {
      if (usernameValue.length < 3) {
        await showError(
          "Username is too short",
          "Username must be at least 3 characters long.",
        );

        return;
      }

      if (usernameValue.length > 100) {
        await showError(
          "Username is too long",
          "Username maximum 100 characters.",
        );

        return;
      }

      if (!/^[A-Za-z0-9._-]+$/.test(usernameValue)) {
        await showError(
          "Invalid username",
          "Usernames may only contain letters, numbers, dots, underscores, and hyphens.",
        );

        return;
      }

      if (usernameValue === profileUsername) {
        await showError(
          "Same username",
          "The new username is the same as the current username.",
        );

        return;
      }
    }

    if (wantsPasswordChange) {
      if (!currentPassword) {
        await showError(
          "Current password is empty",
          "Enter the current password to change the password.",
        );

        return;
      }

      if (passwordValue.length < 8) {
        await showError(
          "Password too short",
          "New password must be at least 8 characters long.",
        );

        return;
      }

      if (passwordValue !== confirmValue) {
        await showError(
          "Passwords do not match",
          "New password confirmation must match.",
        );

        return;
      }
    }

    if ((wantsUsernameChange || wantsPasswordChange) && !currentPassword) {
      await showError(
        "Current password is required",
        "Enter your current password to change your username or password.",
      );

      return;
    }

    const changes: string[] = [];

    if (wantsUsernameChange) {
      changes.push(`username becomes "${usernameValue}"`);
    }

    if (wantsPasswordChange) {
      changes.push("password");
    }

    if (wantsAvatarChange) {
      changes.push("profile picture");
    }

    const confirmed = await showConfirm(
      "Save account changes?",
      `The following changes will be saved: ${changes.join(", ")}.`,
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("action", "update_account");

      formData.append("csrf_token", csrfToken);

      if (wantsUsernameChange) {
        formData.append("username", usernameValue);
      }

      if (wantsUsernameChange || wantsPasswordChange) {
        formData.append("current_password", currentPassword);
      }

      if (wantsPasswordChange) {
        formData.append("new_password", passwordValue);
      }

      if (wantsAvatarChange && avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const result = await postAccountFormData<AccountResponse>(formData);

      if (result.data?.csrf_token) {
        setCsrfToken(result.data.csrf_token);
      }

      await showSuccess(
        "Account updated",
        "Account changes successfully saved.",
      );

      closeChangeDialog();

      await loadAccount();
    } catch (error) {
      console.error("Update account error:", error);

      await showError(
        "Failed to update account",
        error instanceof Error
          ? error.message
          : "Account changes cannot be saved.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex min-h-48 w-full items-center justify-center rounded-xl border border-xeoo-border bg-xeoo-surface">
          <div className="flex items-center gap-2.5">
            <LoaderCircle
              size={18}
              className="animate-spin text-xeoo-primary"
            />

            <span className="text-sm font-semibold text-xeoo-text">
              Loading administrator account...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full lg:max-h-screen">
        <div className="w-full space-y-4">
          {/* PROFILE */}
          <section className="w-full rounded-xl border border-xeoo-border bg-xeoo-surface">
            <div className="flex min-w-0 items-center gap-4 px-4 py-4 sm:px-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-xeoo-primary text-base font-black text-white sm:h-14 sm:w-14">
                {displayedAvatar ? (
                  <img
                    src={displayedAvatar}
                    alt="Admin avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-extrabold text-xeoo-text sm:text-lg">
                  {profile?.display_name || profileUsername}
                </h2>

                <p className="mt-0.5 truncate text-xs text-xeoo-muted">
                  @{profileUsername}
                </p>
              </div>

              <button
                type="button"
                onClick={openChangeDialog}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-xeoo-primary px-3.5 text-xs font-bold text-white transition hover:bg-xeoo-primary-hover shadow-xs"
              >
                <KeyRound size={14} />
                <span>Change</span>
              </button>
            </div>
          </section>

          {/* ACCOUNT + HISTORY */}
          <div className="grid w-full min-w-0 items-start gap-4 lg:grid-cols-[minmax(250px,0.7fr)_minmax(0,1.3fr)]">
            {/* ACCOUNT */}
            <section className="h-fit min-w-0 self-start overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface">
              <div className="border-b border-xeoo-border px-3.5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-xeoo-surface-soft text-xeoo-text">
                    <UserRound size={14} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs font-extrabold text-xeoo-text">
                      Account
                    </h3>

                    <p className="text-[10px] text-xeoo-muted">
                      Administrator account information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-xeoo-border">
                <div className="flex items-start justify-between gap-3 px-3.5 py-2.5">
                  <span className="shrink-0 text-[10px] font-semibold text-xeoo-muted">
                    Username
                  </span>

                  <span className="min-w-0 wrap-break-words text-right text-[11px] font-bold text-xeoo-text">
                    {profileUsername}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 px-3.5 py-2.5">
                  <span className="shrink-0 text-[10px] font-semibold text-xeoo-muted">
                    Role
                  </span>

                  <span className="text-right text-[11px] font-bold text-xeoo-text">
                    Administrator
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 px-3.5 py-2.5">
                  <span className="shrink-0 text-[10px] font-semibold text-xeoo-muted">
                    Password
                  </span>

                  <span className="text-right text-[11px] font-bold text-xeoo-text">
                    {formatDatabaseDate(profile?.password_changed_at)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 px-3.5 py-2.5">
                  <span className="shrink-0 text-[10px] font-semibold text-xeoo-muted">
                    Last Login
                  </span>

                  <span className="text-right text-[11px] font-bold text-xeoo-text">
                    {formatDatabaseDate(profile?.last_login_at)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 px-3.5 py-2.5">
                  <span className="shrink-0 text-[10px] font-semibold text-xeoo-muted">
                    Last IP
                  </span>

                  <span className="min-w-0 break-all text-right font-mono text-[10px] font-semibold text-xeoo-text">
                    {profile?.last_login_ip || "-"}
                  </span>
                </div>
              </div>
            </section>

            {/* HISTORY */}
            <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface lg:max-h-[calc(100dvh-13rem)]">
              <div className="shrink-0 border-b border-xeoo-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-xeoo-surface-soft text-xeoo-text">
                    <History size={15} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-xeoo-text">
                      Login & Activity History
                    </h3>

                    <p className="text-[10px] text-xeoo-muted">
                      Administrator authentication history.
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="divide-y divide-xeoo-border">
                  {paginatedLogs.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <History
                        size={20}
                        className="mx-auto text-xeoo-text-light"
                      />

                      <p className="mt-2 text-xs font-semibold text-xeoo-text">
                        There is no authentication history.
                      </p>
                    </div>
                  ) : (
                    paginatedLogs.map((log) => (
                      <div key={log.id} className="px-4 py-3">
                        <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-[1.05fr_0.75fr_0.95fr_1.5fr] lg:items-start">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-bold text-xeoo-text">
                                {getActionLabel(log.action)}
                              </p>

                              <span
                                className={[
                                  "shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold",
                                  getActionClass(log.action),
                                ].join(" ")}
                              >
                                {log.action}
                              </span>
                            </div>

                            <p className="mt-1 text-[10px] text-xeoo-muted">
                              {formatDatabaseDate(log.created_at)}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-xeoo-muted">
                              IP Address
                            </p>

                            <p className="mt-0.5 break-all font-mono text-[10px] font-semibold leading-4 text-xeoo-text">
                              {log.ip_address || "-"}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-xeoo-muted">
                              Session
                            </p>

                            <p className="mt-0.5 break-all font-mono text-[10px] font-semibold leading-4 text-xeoo-text">
                              {log.session_id || "-"}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-xeoo-muted">
                                  User Agent
                                </p>

                                <p
                                  className="mt-0.5 wrap-break-words text-[10px] font-semibold leading-4 text-xeoo-text"
                                  title={log.user_agent || undefined}
                                >
                                  {log.user_agent || "-"}
                                </p>
                              </div>

                              <span
                                className={[
                                  "shrink-0 rounded-md border px-2 py-0.5 text-[9px] font-bold",
                                  log.success
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-red-200 bg-red-50 text-red-700",
                                ].join(" ")}
                              >
                                {log.success ? "Success" : "Failed"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {logs.length > 0 && (
                <div className="shrink-0 border-t border-xeoo-border bg-xeoo-surface-soft px-4 py-2.5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[10px] text-xeoo-muted">
                      Showing{" "}
                      <span className="font-bold text-xeoo-text">
                        {(historyPage - 1) * HISTORY_PER_PAGE + 1}
                      </span>{" "}
                      –{" "}
                      <span className="font-bold text-xeoo-text">
                        {Math.min(historyPage * HISTORY_PER_PAGE, logs.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-xeoo-text">
                        {logs.length}
                      </span>
                    </p>

                    {historyTotalPages > 1 && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled={historyPage <= 1}
                          onClick={() =>
                            setHistoryPage((page) => Math.max(1, page - 1))
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Previous page"
                        >
                          <ChevronLeft size={13} />
                        </button>

                        <span className="min-w-16 text-center text-[10px] font-bold text-xeoo-text">
                          {historyPage} / {historyTotalPages}
                        </span>

                        <button
                          type="button"
                          disabled={historyPage >= historyTotalPages}
                          onClick={() =>
                            setHistoryPage((page) =>
                              Math.min(historyTotalPages, page + 1),
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-text-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Next page"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* CHANGE ACCOUNT MODAL */}
      {changeDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-2 sm:items-center sm:p-4">
          <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-2xl sm:max-h-[calc(100dvh-2rem)]">
            {/* HEADER */}
            <div className="shrink-0 border-b border-xeoo-border px-4 py-3 sm:px-5 sm:py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-xeoo-primary text-white">
                  <KeyRound size={14} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-extrabold text-xeoo-text sm:text-base">
                    Edit Account
                  </h2>

                  <p className="text-[10px] text-xeoo-muted">
                    Manage your profile photo, username, and password.
                  </p>
                </div>
              </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid gap-3 p-3 sm:gap-4 sm:p-5 md:grid-cols-[210px_minmax(0,1fr)]">
                {/* PHOTO */}
                <section className="min-w-0 rounded-xl border border-xeoo-border bg-xeoo-surface-soft p-3 sm:p-4">
                  <div className="flex items-center gap-3 md:flex-col md:text-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-xeoo-primary text-xl font-black text-white sm:h-20 sm:w-20 md:h-24 md:w-24">
                      {displayedAvatar ? (
                        <img
                          src={displayedAvatar}
                          alt="Preview avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initial
                      )}
                    </div>

                    <div className="min-w-0 flex-1 md:w-full md:flex-none">
                      <p className="text-xs font-bold text-xeoo-text">
                        Profile picture
                      </p>

                      <p className="mt-0.5 text-[9px] leading-4 text-xeoo-muted md:mt-1">
                        Only JPG, JPEG, or PNG. Maximum 2 MB.
                      </p>

                      <label
                        htmlFor="account-avatar"
                        className="mt-2 inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[10px] font-bold text-xeoo-text transition hover:bg-xeoo-surface-soft"
                      >
                        Choose Image
                      </label>

                      <input
                        id="account-avatar"
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        onChange={handleAvatarChange}
                        disabled={saving}
                        className="sr-only"
                      />

                      {avatarFile && (
                        <p className="mt-1.5 break-all text-[9px] font-semibold text-xeoo-text">
                          {avatarFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* ACCOUNT / PASSWORD */}
                <section className="min-w-0 rounded-xl border border-xeoo-border bg-xeoo-surface p-3 sm:p-4">
                  <div className="mb-3">
                    <h3 className="text-xs font-extrabold text-xeoo-text">
                      Account & Security
                    </h3>

                    <p className="mt-0.5 text-[10px] text-xeoo-muted">
                      Leave the fields you do not wish to change blank.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* USERNAME */}
                    <div>
                      <label
                        htmlFor="account-new-username"
                        className="mb-1.5 block text-[10px] font-bold text-xeoo-text"
                      >
                        New Username
                      </label>

                      <input
                        id="account-new-username"
                        type="text"
                        value={newUsername}
                        onChange={(event) => setNewUsername(event.target.value)}
                        disabled={saving}
                        maxLength={100}
                        autoComplete="username"
                        placeholder={`Still "${profileUsername}"`}
                        className="h-9 w-full rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-3 focus:ring-xeoo-primary-soft disabled:cursor-not-allowed disabled:bg-xeoo-surface-soft"
                      />
                    </div>

                    {/* CURRENT PASSWORD */}
                    <div>
                      <label
                        htmlFor="account-current-password"
                        className="mb-1.5 block text-[10px] font-bold text-xeoo-text"
                      >
                        Current Password
                      </label>

                      <div className="relative">
                        <input
                          id="account-current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(event) =>
                            setCurrentPassword(event.target.value)
                          }
                          disabled={saving}
                          autoComplete="current-password"
                          placeholder="Username/password required."
                          className="h-9 w-full rounded-lg border border-xeoo-border bg-xeoo-surface px-3 pr-10 text-[11px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-3 focus:ring-xeoo-primary-soft disabled:cursor-not-allowed disabled:bg-xeoo-surface-soft"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword((value) => !value)
                          }
                          disabled={saving}
                          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-xeoo-muted transition hover:bg-xeoo-surface-soft"
                          aria-label="Show current password"
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={13} />
                          ) : (
                            <Eye size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* NEW PASSWORD */}
                    <div>
                      <label
                        htmlFor="account-new-password"
                        className="mb-1.5 block text-[10px] font-bold text-xeoo-text"
                      >
                        New Password
                      </label>

                      <div className="relative">
                        <input
                          id="account-new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(event.target.value)
                          }
                          disabled={saving}
                          autoComplete="new-password"
                          placeholder="Leave blank if not changed"
                          className="h-9 w-full rounded-lg border border-xeoo-border bg-xeoo-surface px-3 pr-10 text-[11px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-3 focus:ring-xeoo-primary-soft disabled:cursor-not-allowed disabled:bg-xeoo-surface-soft"
                        />

                        <button
                          type="button"
                          onClick={() => setShowNewPassword((value) => !value)}
                          disabled={saving}
                          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-xeoo-muted transition hover:bg-xeoo-surface-soft"
                          aria-label="Show new password"
                        >
                          {showNewPassword ? (
                            <EyeOff size={13} />
                          ) : (
                            <Eye size={13} />
                          )}
                        </button>
                      </div>

                      {newPassword && (
                        <div className="mt-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-xeoo-muted">
                              Strength
                            </span>

                            <span className="text-[9px] font-bold text-xeoo-text">
                              {passwordStrength.label}
                            </span>
                          </div>

                          <div className="mt-1 h-1 overflow-hidden rounded-full bg-xeoo-surface-soft">
                            <div
                              className={[
                                "h-full rounded-full transition-all",
                                passwordStrength.className,
                              ].join(" ")}
                              style={{
                                width: passwordStrength.width,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div>
                      <label
                        htmlFor="account-confirm-password"
                        className="mb-1.5 block text-[10px] font-bold text-xeoo-text"
                      >
                        Confirm New Password
                      </label>

                      <div className="relative">
                        <input
                          id="account-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          disabled={saving}
                          autoComplete="new-password"
                          placeholder="Repeat new password"
                          className="h-9 w-full rounded-lg border border-xeoo-border bg-xeoo-surface px-3 pr-10 text-[11px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-3 focus:ring-xeoo-primary-soft disabled:cursor-not-allowed disabled:bg-xeoo-surface-soft"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((value) => !value)
                          }
                          disabled={saving}
                          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-xeoo-muted transition hover:bg-xeoo-surface-soft"
                          aria-label="Show password confirmation"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={13} />
                          ) : (
                            <Eye size={13} />
                          )}
                        </button>
                      </div>

                      {confirmPassword && (
                        <p
                          className={[
                            "mt-1 text-[9px] font-semibold",
                            confirmPassword === newPassword
                              ? "text-emerald-600"
                              : "text-red-600",
                          ].join(" ")}
                        >
                          {confirmPassword === newPassword
                            ? "Password matches."
                            : "Passwords do not match."}
                        </p>
                      )}
                    </div>

                    {/* SECURITY NOTE */}
                    <div className="rounded-lg border border-xeoo-border bg-xeoo-surface-soft px-3 py-2">
                      <div className="flex items-start gap-2">
                        <p className="text-[9px] leading-4 text-xeoo-muted">
                          Changing the photo alone does not currently require a
                          password. The username/password is still verified by
                          the server.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* FOOTER */}
            <div className="sticky bottom-0 z-10 flex shrink-0 flex-col-reverse gap-2 border-t border-xeoo-border bg-xeoo-surface-soft px-3 py-3 sm:flex-row sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={closeChangeDialog}
                disabled={saving}
                className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface px-4 text-[11px] font-bold text-xeoo-text transition hover:bg-xeoo-surface-soft disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void submitChanges()}
                disabled={saving}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-4 text-[11px] font-bold text-white transition hover:bg-xeoo-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto shadow-xs"
              >
                {saving ? (
                  <>
                    <LoaderCircle size={13} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
