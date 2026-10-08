import { useEffect, useState } from "react";

import type { FormEvent } from "react";

import { Eye, EyeOff, LockKeyhole, LogIn, UserRound } from "lucide-react";

import { showError, showSuccess } from "../alert";

import { BACKEND_URL } from "../config/backend";

type AuthResponse = {
  success: boolean;
  message?: string;
  data?: {
    user?: {
      id?: number;
      username?: string;
      display_name?: string | null;
      avatar?: string | null;
      role?: string;
      status?: string;
      last_login_at?: string | null;
      last_login_ip?: string | null;
    };
  };
};

export default function LoginMimin() {
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "XeooTools — Admin Login";

    return () => {
      document.title = "XeooTools — Free Online Tools";
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      await showError("Required Field", "Please enter your username.");

      return;
    }

    if (!password) {
      await showError(
        "Required Field",
        "Please enter your password.",
      );

      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const body = new URLSearchParams();

      body.append("action", "login");
      body.append("username", cleanUsername);
      body.append("password", password);

      const response = await fetch(`${BACKEND_URL}/api/auth.php`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Accept: "application/json",
        },
        body,
      });

      let result: AuthResponse | null = null;

      try {
        result = (await response.json()) as AuthResponse;
      } catch {
        result = null;
      }

      console.log("Login response:", {
        status: response.status,
        ok: response.ok,
        result,
      });

      if (!result) {
        throw new Error(
          `The server returned an invalid response. HTTP ${response.status}.`,
        );
      }

      if (!response.ok || !result.success) {
        const message =
          result.message?.trim() ||
          (response.status === 401
            ? "Incorrect username or password."
            : response.status === 403
              ? "Admin access denied."
              : response.status === 422
                ? "Incomplete or invalid login credentials."
                : `Login failed. HTTP ${response.status}.`);

        await showError("Login failed", message);

        return;
      }

      const loggedUsername =
        result.data?.user?.display_name?.trim() ||
        result.data?.user?.username?.trim() ||
        cleanUsername;

      await showSuccess("Login successful", `Welcome back, ${loggedUsername}.`);

      window.location.href = "/mimin/dashboard";
    } catch (error) {
      console.error("Login error:", error);

      if (error instanceof TypeError) {
        await showError(
          "Server unreachable",
          "Cannot connect to backend server. Please verify your local Laragon Apache and MySQL services are running.",
        );

        return;
      }

      await showError(
        "Server error",
        error instanceof Error
          ? error.message
          : "An error occurred while processing login.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-xeoo-bg px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-xeoo-border bg-xeoo-surface p-6 shadow-sm sm:p-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-xeoo-dark text-sm font-bold text-white">
            X
          </div>

          <div className="mt-5">
            <h1 className="text-xl font-bold tracking-tight text-xeoo-text">
              Admin Login
            </h1>

            <p className="mt-1.5 text-sm leading-5 text-xeoo-muted">
              Sign in to the XeooTools administration panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-xs font-semibold text-xeoo-text-soft"
              >
                Username
              </label>

              <div className="relative">
                <UserRound
                  size={16}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xeoo-muted"
                />

                <input
                  id="username"
                  type="text"
                  name="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={loading}
                  className="h-10 w-full rounded-lg border border-xeoo-border bg-xeoo-surface pl-9 pr-3 text-sm text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-3 focus:ring-xeoo-primary-soft disabled:cursor-not-allowed disabled:bg-xeoo-surface-soft"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold text-xeoo-text-soft"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={16}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xeoo-muted"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="h-10 w-full rounded-lg border border-xeoo-border bg-xeoo-surface pl-9 pr-10 text-sm text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-3 focus:ring-xeoo-primary-soft disabled:cursor-not-allowed disabled:bg-xeoo-surface-soft"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-xeoo-muted transition hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff size={16} strokeWidth={1.8} />
                  ) : (
                    <Eye size={16} strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-xeoo-primary px-4 text-sm font-semibold text-white transition hover:bg-xeoo-primary-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 shadow-xs"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} strokeWidth={1.8} />
                  Login
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] text-xeoo-muted">
            XeooTools Administration
          </p>
        </div>
      </div>
    </main>
  );
}
