import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, KeyRound, User, ArrowRight, Loader2, Eye, EyeOff, AlertCircle, Lock } from "lucide-react";
import { useCtfAuth } from "./ctfAuth";

export const CtfLogin: React.FC = () => {
  const { login, isAuthenticated, settings } = useCtfAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/ctf");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.login_enabled) return;
    if (!usernameOrEmail.trim() || !password) return;

    setSubmitting(true);
    const ok = await login(usernameOrEmail.trim(), password);
    setSubmitting(false);

    if (ok) {
      navigate("/ctf");
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm rounded-xl border border-xeoo-border bg-xeoo-surface p-5 sm:p-6 shadow-xs">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-lg bg-xeoo-surface-soft border border-xeoo-border text-xeoo-primary">
            <LogIn className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-xeoo-text">Login CTF</h1>
          <p className="mt-1 text-xs text-xeoo-muted">
            Log in to access the CTF challenge.
          </p>
        </div>

        {!settings.login_enabled && (
          <div className="mb-4 rounded-lg border border-xeoo-warning/40 bg-xeoo-warning/10 p-3 text-xs text-xeoo-text space-y-1">
            <div className="flex items-center gap-2 font-bold text-xeoo-warning">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Login disabled by admin</span>
            </div>
            <p className="text-[11px] text-xeoo-muted leading-relaxed">
              Authentication has been temporarily disabled by the admin
            </p>
            {settings.leaderboard_enabled && (
              <div className="pt-1">
                <Link
                  to="/ctf/leaderboard"
                  className="inline-flex items-center gap-1 font-semibold text-xeoo-primary hover:underline text-[11px]"
                >
                  Leaderboard &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-xeoo-text" htmlFor="login-identity">
              Username or Email
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xeoo-muted">
                <User className="h-4 w-4" />
              </span>
              <input
                id="login-identity"
                type="text"
                required
                disabled={!settings.login_enabled || submitting}
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 pl-9 pr-3 text-xs text-xeoo-text placeholder-xeoo-muted focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary font-mono disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-semibold text-xeoo-text" htmlFor="login-password">
                Password
              </label>
              {settings.password_reset_enabled !== false && (
                <Link
                  to="/ctf/forgot-password"
                  className="text-[11px] text-xeoo-primary hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xeoo-muted">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                disabled={!settings.login_enabled || submitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-xeoo-border bg-xeoo-surface-soft py-2 pl-9 pr-10 text-xs text-xeoo-text placeholder-xeoo-muted focus:border-xeoo-primary focus:outline-none focus:ring-1 focus:ring-xeoo-primary font-mono disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={!settings.login_enabled}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xeoo-muted hover:text-xeoo-text cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                title={showPassword ? "Hidden" : "Show"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!settings.login_enabled || submitting || !usernameOrEmail.trim() || !password}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-xeoo-primary py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-xeoo-primary-hover disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {!settings.login_enabled ? (
              <>
                <Lock className="h-4 w-4" />
                <span>Login disabled by admin</span>
              </>
            ) : submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 border-t border-xeoo-border pt-3 text-center">
          <p className="text-xs text-xeoo-muted">
            Don't have an account?{" "}
            <Link to="/ctf/register" className="font-semibold text-xeoo-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
